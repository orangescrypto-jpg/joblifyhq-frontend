import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { doc, updateDoc, serverTimestamp, Timestamp } from 'firebase/firestore';
import { db } from '../../firebase/config';
import { useFlutterwave, closePaymentModal } from 'flutterwave-react-v3';
import {
  FiZap, FiCheck, FiStar, FiTrendingUp, FiUsers, FiEye,
  FiBriefcase, FiMail, FiShield, FiGlobe, FiAward,
} from 'react-icons/fi';

const PLANS = [ /* your PLANS array - keep exactly as you pasted */ ];
const PERKS = [ /* your PERKS array - keep exactly */ ];

function fmt(n) { return `$${n.toLocaleString()}`; }

export default function EmployerPremium() {
  const { user, updateUserProfile } = useAuth();
  const navigate = useNavigate();
  const [billing, setBilling] = useState('monthly');
  const [loadingPlan, setLoadingPlan] = useState('');

  const isPremium = user?.employerTier && user.employerTier !== 'basic';
  const currentPlan = user?.employerTier || 'basic';

  const flutterKey = import.meta.env.VITE_FLW_PUBLIC_KEY;

  const handleFlutter = useFlutterwave({
    public_key: flutterKey,
    currency: 'USD', // ✅ Always USD - Flutterwave converts for each country
    payment_options: 'card,banktransfer,ussd,mobilemoney',
    customer: {
      email: user?.email,
      name: user?.displayName || 'Employer',
    },
    customizations: {
      title: 'JoblifyHQ Employer',
      description: 'Employer Premium Plan',
      logo: 'https://joblifyhq.com/logo.png',
    },
  });

  const handleSelect = (planKey) => {
    if (planKey === 'basic') return;
    if (!user) return navigate('/login');
    if (!flutterKey) return alert('Add VITE_FLW_PUBLIC_KEY to Vercel');

    const plan = PLANS.find(p => p.key === planKey);
    const amount = billing === 'monthly' ? plan.monthlyPrice : plan.annualPrice;
    const days = billing === 'monthly' ? 30 : 365;

    setLoadingPlan(planKey);

    handleFlutter({
      tx_ref: `emp_${user.uid}_${Date.now()}`,
      amount,
      callback: async (response) => {
        closePaymentModal();
        if (response.status === 'successful' || response.status === 'completed') {
          await updateDoc(doc(db, 'users', user.uid), {
            employerTier: planKey,
            employerBilling: billing,
            subscriptionExpiresAt: Timestamp.fromDate(new Date(Date.now() + days * 24 * 60 * 60 * 1000)),
            flwTransactionId: response.transaction_id,
            updatedAt: serverTimestamp(),
          });
          await updateUserProfile?.({ employerTier: planKey });
          alert(`${plan.name} activated!`);
          navigate('/employer/dashboard');
        }
        setLoadingPlan('');
      },
      onClose: () => setLoadingPlan(''),
    });
  };

  return (
    <div className="space-y-12 pb-16">
      {/* Hero - keep yours, just update the text */}
      <div className="text-center">
        <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary-50 dark:bg-primary-900/20 text-primary-700 dark:text-primary-300 rounded-full text-sm font-semibold mb-4">
          <FiZap size={14} /> Employer Premium Plans
        </div>
        <h1 className="text-3xl md:text-4xl font-black text-gray-900 dark:text-white mb-3">
          Hire Faster. Hire Better.
        </h1>
        <p className="text-gray-500 dark:text-gray-400 max-w-xl mx-auto text-base">
          All prices in USD. Pay with your local card — Flutterwave auto-converts to NGN, KES, GHS, ZAR and more.
        </p>

        {/* Billing toggle - keep yours */}
        <div className="flex items-center justify-center gap-3 mt-6">
          <span className={`text-sm font-medium ${billing === 'monthly' ? 'text-gray-900 dark:text-white' : 'text-gray-400'}`}>Monthly</span>
          <button onClick={() => setBilling(b => b === 'monthly' ? 'annual' : 'monthly')} className={`relative w-12 h-6 rounded-full transition-colors ${billing === 'annual' ? 'bg-primary-600' : 'bg-gray-300 dark:bg-gray-600'}`}>
            <span className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full shadow transition-transform ${billing === 'annual' ? 'translate-x-6' : ''}`} />
          </button>
          <span className={`text-sm font-medium ${billing === 'annual' ? 'text-gray-900 dark:text-white' : 'text-gray-400'}`}>
            Annual <span className="text-green-600 font-semibold text-xs ml-1">Save 20%</span>
          </span>
        </div>
      </div>

      {/* Plans - keep your grid, just change button */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-start">
        {PLANS.map(plan => {
          const displayPrice = billing === 'monthly' ? plan.monthlyPrice : Math.round(plan.annualPrice / 12);
          const isCurrentPlan = currentPlan === plan.key;

          return (
            <div key={plan.key} className={`rounded-2xl border-2 ${plan.color} overflow-hidden shadow-sm ${plan.tag ? 'md:-mt-4 md:shadow-xl' : ''}`}>
              <div className={`${plan.headerBg} p-6 ${plan.key !== 'basic' ? 'text-white' : 'text-gray-900 dark:text-white'}`}>
                <div className="flex items-center justify-between mb-1">
                  <h3 className="text-lg font-bold">{plan.name}</h3>
                  {plan.tag && <span className="text-xs px-2.5 py-1 bg-white/25 rounded-full font-semibold">{plan.tag}</span>}
                </div>
                {plan.monthlyPrice === 0 ? (
                  <div className="mt-3"><span className="text-3xl font-black">Free</span></div>
                ) : (
                  <div className="mt-3">
                    <span className="text-3xl font-black">{fmt(displayPrice)}</span>
                    <span className="text-sm ml-1">/month</span>
                    {billing === 'annual' && <p className="text-xs mt-1 opacity-70">Billed {fmt(plan.annualPrice)}/year</p>}
                  </div>
                )}
              </div>

              <div className="bg-white dark:bg-gray-900 p-6">
                <button
                  onClick={() => handleSelect(plan.key)}
                  disabled={isCurrentPlan || plan.key === 'basic' || loadingPlan === plan.key}
                  className={`w-full py-3 px-4 rounded-xl font-bold text-sm transition mb-6 disabled:opacity-60 ${isCurrentPlan ? 'bg-gray-100 dark:bg-gray-800 text-gray-500' : plan.btnClass}`}
                >
                  {loadingPlan === plan.key ? 'Processing...' : isCurrentPlan ? 'Current Plan' : plan.key === 'basic' ? 'Free Plan' : `Upgrade to ${plan.name}`}
                </button>

                <ul className="space-y-3 mb-6">
                  {plan.features.map(f => (
                    <li key={f} className="flex items-start gap-2.5 text-sm text-gray-700 dark:text-gray-300">
                      <FiCheck size={15} className="text-green-500 mt-0.5 shrink-0" />{f}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          );
        })}
      </div>

      {/* Keep your PERKS, trust, FAQ sections exactly as you have them */}
      {/* Just update the FAQ answer: */}
      <div className="max-w-2xl mx-auto">
        <h2 className="text-xl font-bold text-center mb-6">Common Questions</h2>
        <div className="space-y-4">
          <div className="bg-white dark:bg-gray-800 rounded-xl border p-5">
            <h4 className="font-semibold text-sm mb-1">What payment methods do you accept?</h4>
            <p className="text-gray-500 text-sm">We accept USD payments via Flutterwave. Your local card will be auto-converted — NGN, KES, GHS, ZAR, UGX all supported.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
