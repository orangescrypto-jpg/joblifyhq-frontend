import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { doc, updateDoc, serverTimestamp, Timestamp } from 'firebase/firestore';
import { db } from '../../firebase/config';
import { useFlutterwave, closePaymentModal } from 'flutterwave-react-v3';
import { FLUTTERWAVE_PUBLIC_KEY } from '../../config/payments';
import {
  FiZap, FiCheck, FiStar, FiTrendingUp, FiUsers, FiEye,
  FiMail, FiShield, FiGlobe, FiAward,
} from 'react-icons/fi';

const PLANS = [
  {
    key: 'basic',
    name: 'Basic',
    tag: null,
    monthlyPrice: 0,
    annualPrice: 0,
    color: 'border-gray-200 dark:border-gray-700',
    headerBg: 'bg-gray-50 dark:bg-gray-800',
    btnClass: 'border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700',
    features: [
      'Up to 3 active job listings',
      'Basic applicant management',
      'Standard listing placement',
      'Email notifications',
      'Public company profile',
    ],
    missing: [
      'Featured listings',
      'Candidate search',
      'Analytics dashboard',
      'Priority support',
    ],
  },
  {
    key: 'growth',
    name: 'Growth',
    tag: 'Most Popular',
    monthlyPrice: 15,
    annualPrice: 144,
    color: 'border-primary-500',
    headerBg: 'bg-gradient-to-br from-primary-600 to-primary-700',
    btnClass: 'bg-primary-600 hover:bg-primary-700 text-white',
    localHint: '≈ ₦24,000/mo • KES 1,950 • GHS 185',
    features: [
      '15 active job listings',
      '2 featured listings per month',
      'Full applicant management',
      'Kanban pipeline board',
      'Analytics dashboard',
      'Company profile with culture info',
      'Actively Hiring badge',
      'Priority email support',
      'Export applicant data (CSV)',
    ],
    missing: [
      'Unlimited listings',
      'Candidate database access',
      'Dedicated account manager',
    ],
  },
  {
    key: 'enterprise',
    name: 'Enterprise',
    tag: 'Best Value',
    monthlyPrice: 30,
    annualPrice: 288,
    color: 'border-purple-500',
    headerBg: 'bg-gradient-to-br from-purple-600 to-indigo-700',
    btnClass: 'bg-purple-600 hover:bg-purple-700 text-white',
    localHint: '≈ ₦48,000/mo • KES 3,900 • GHS 370',
    features: [
      'Unlimited job listings',
      'Unlimited featured listings',
      'Full applicant management + pipeline',
      'Candidate database search',
      'Advanced analytics & reports',
      'Branded company profile page',
      'Actively Hiring + Verified badge',
      'Dedicated account manager',
      'Custom email notifications',
      'API access for ATS integration',
      'White-label job widget for website',
      'Priority placement on homepage',
    ],
    missing: [],
  },
];

const PERKS = [
  { icon: FiTrendingUp, title: 'Get 3× More Applications', desc: 'Featured listings appear at the top of search results and on the homepage.' },
  { icon: FiUsers, title: 'Full Applicant Pipeline', desc: 'Kanban board to move candidates from Applied → Viewed → Shortlisted → Hired.' },
  { icon: FiEye, title: 'Actively Hiring Badge', desc: 'Show job seekers your roles are fresh and you\'re ready to hire now.' },
  { icon: FiShield, title: 'Verified Employer Badge', desc: 'Build trust with job seekers — verified employers get more quality applicants.' },
  { icon: FiGlobe, title: 'Company Profile Page', desc: 'A dedicated /employers/yourcompany page with logo, culture info and all open roles.' },
  { icon: FiAward, title: 'Analytics Dashboard', desc: 'See views, applications, and conversion rates for every listing you post.' },
];

function fmt(n) { return `$${n.toLocaleString()}`; }

export default function EmployerPremium() {
  const { user, updateUserProfile } = useAuth();
  const navigate = useNavigate();
  const [billing, setBilling] = useState('monthly');
  const [loadingPlan, setLoadingPlan] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const currentPlan = user?.employerTier || 'basic';

  const handleFlutter = useFlutterwave({
    public_key: FLUTTERWAVE_PUBLIC_KEY,
    currency: 'USD',
    payment_options: 'card,banktransfer,ussd,mobilemoney',
    customer: {
      email: user?.email || '',
      name: user?.displayName || user?.name || 'Employer',
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

    const plan = PLANS.find(p => p.key === planKey);
    const amount = billing === 'monthly' ? plan.monthlyPrice : plan.annualPrice;
    const days = billing === 'monthly' ? 30 : 365;

    setLoadingPlan(planKey);
    setError('');
    setSuccess('');

    handleFlutter({
      tx_ref: `emp_${user.uid}_${Date.now()}`,
      amount,
      description: `JoblifyHQ Employer ${plan.name} — ${billing}`,
      callback: async (response) => {
        closePaymentModal();
        if (response.status === 'successful' || response.status === 'completed') {
          try {
            await updateDoc(doc(db, 'users', user.uid), {
              employerTier: planKey,
              employerBilling: billing,
              subscriptionExpiresAt: Timestamp.fromDate(
                new Date(Date.now() + days * 24 * 60 * 60 * 1000)
              ),
              flwTransactionId: response.transaction_id,
              updatedAt: serverTimestamp(),
            });
            if (typeof updateUserProfile === 'function') {
              await updateUserProfile({ employerTier: planKey });
            }
            setSuccess(`You're now on the ${plan.name} plan! 🎉`);
            setTimeout(() => navigate('/employer'), 2000);
          } catch (err) {
            console.error(err);
            setError('Payment succeeded but update failed. Contact support. Transaction ID: ' + response.transaction_id);
          }
        } else {
          setError('Payment was not completed. Please try again.');
        }
        setLoadingPlan('');
      },
      onClose: () => setLoadingPlan(''),
    });
  };

  return (
    <div className="space-y-12 pb-16 max-w-6xl mx-auto px-4">
      <div className="text-center pt-12">
        <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary-50 dark:bg-primary-900/20 text-primary-700 dark:text-primary-300 rounded-full text-sm font-semibold mb-4">
          <FiZap size={14} /> Employer Premium Plans
        </div>
        <h1 className="text-3xl md:text-4xl font-black text-gray-900 dark:text-white mb-3">Hire Faster. Hire Better.</h1>
        <p className="text-gray-500 dark:text-gray-400 max-w-xl mx-auto text-base">
          All prices in USD. Flutterwave auto-converts to NGN, KES, GHS, ZAR at checkout.
        </p>

        {error && (
          <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm max-w-md mx-auto">{error}</div>
        )}
        {success && (
          <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-xl text-green-700 text-sm max-w-md mx-auto font-medium">{success}</div>
        )}

        {/* Billing toggle */}
        <div className="flex items-center justify-center gap-3 mt-6">
          <span className={`text-sm font-medium ${billing === 'monthly' ? 'text-gray-900 dark:text-white' : 'text-gray-400'}`}>Monthly</span>
          <button
            onClick={() => setBilling(b => b === 'monthly' ? 'annual' : 'monthly')}
            className={`relative w-12 h-6 rounded-full transition-colors ${billing === 'annual' ? 'bg-primary-600' : 'bg-gray-300 dark:bg-gray-600'}`}
          >
            <span className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full shadow transition-transform ${billing === 'annual' ? 'translate-x-6' : ''}`} />
          </button>
          <span className={`text-sm font-medium ${billing === 'annual' ? 'text-gray-900 dark:text-white' : 'text-gray-400'}`}>
            Annual <span className="text-green-600 font-semibold text-xs ml-1">Save 20%</span>
          </span>
        </div>
      </div>

      {/* Plans */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-start">
        {PLANS.map(plan => {
          const displayPrice = billing === 'monthly' ? plan.monthlyPrice : Math.round(plan.annualPrice / 12);
          const isCurrentPlan = currentPlan === plan.key;
          return (
            <div key={plan.key} className={`rounded-2xl border-2 ${plan.color} overflow-hidden shadow-sm ${plan.tag ? 'md:-mt-4 md:shadow-xl' : ''}`}>
              <div className={`${plan.headerBg} p-6 ${plan.key !== 'basic' ? 'text-white' : 'text-gray-900 dark:text-white'}`}>
                <div className="flex items-center justify-between mb-1">
                  <h3 className="text-lg font-bold">{plan.name}</h3>
                  {plan.tag && (
                    <span className="text-xs px-2.5 py-1 bg-white/25 rounded-full font-semibold">{plan.tag}</span>
                  )}
                </div>
                {plan.monthlyPrice === 0 ? (
                  <div className="mt-3">
                    <span className="text-3xl font-black">Free</span>
                    <span className="text-sm ml-1 opacity-70">forever</span>
                  </div>
                ) : (
                  <div className="mt-3">
                    <span className="text-3xl font-black">{fmt(displayPrice)}</span>
                    <span className="text-sm ml-1 opacity-70">/month</span>
                    {billing === 'annual' && (
                      <p className="text-xs mt-1 opacity-60">Billed {fmt(plan.annualPrice)}/year</p>
                    )}
                    {plan.localHint && (
                      <p className="text-xs mt-1 opacity-60">{plan.localHint}</p>
                    )}
                  </div>
                )}
              </div>

              <div className="bg-white dark:bg-gray-900 p-6">
                <button
                  onClick={() => handleSelect(plan.key)}
                  disabled={isCurrentPlan || plan.key === 'basic' || loadingPlan === plan.key}
                  className={`w-full py-3 px-4 rounded-xl font-bold text-sm transition mb-6 disabled:opacity-60 ${isCurrentPlan ? 'bg-gray-100 dark:bg-gray-800 text-gray-500' : plan.btnClass}`}
                >
                  {loadingPlan === plan.key
                    ? 'Processing...'
                    : isCurrentPlan
                      ? 'Current Plan'
                      : plan.key === 'basic'
                        ? 'Free Plan'
                        : `Upgrade to ${plan.name}`}
                </button>

                <ul className="space-y-3 mb-6">
                  {plan.features.map(f => (
                    <li key={f} className="flex items-start gap-2.5 text-sm text-gray-700 dark:text-gray-300">
                      <FiCheck size={15} className="text-green-500 mt-0.5 shrink-0" />{f}
                    </li>
                  ))}
                  {plan.missing.map(f => (
                    <li key={f} className="flex items-start gap-2.5 text-sm text-gray-400">
                      <span className="w-3.5 h-3.5 mt-0.5 shrink-0 text-center leading-none">—</span>{f}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          );
        })}
      </div>

      {/* Perks */}
      <div>
        <h2 className="text-2xl font-bold text-center text-gray-900 dark:text-white mb-8">Why Employers Choose Premium</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {PERKS.map(({ icon: Icon, title, desc }) => (
            <div key={title} className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-5">
              <div className="w-10 h-10 bg-primary-50 dark:bg-primary-900/30 rounded-xl flex items-center justify-center text-primary-600 mb-3">
                <Icon size={20} />
              </div>
              <h3 className="font-bold mb-1 text-sm text-gray-900 dark:text-white">{title}</h3>
              <p className="text-gray-500 dark:text-gray-400 text-sm">{desc}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
