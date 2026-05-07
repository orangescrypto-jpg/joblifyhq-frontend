import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { doc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../firebase/config';
import { FiCheck, FiZap, FiStar, FiShield, FiBell, FiEye, FiFileText, FiTrendingUp } from 'react-icons/fi';
import { useNavigate } from 'react-router-dom';

const PLANS = [
  {
    id: 'free',
    name: 'Free',
    price: '₦0',
    period: 'forever',
    color: 'gray',
    features: [
      'Browse all jobs & scholarships',
      'Save up to 5 jobs',
      'Apply to jobs',
      '1 job alert',
      'Basic profile',
    ],
    cta: 'Current Plan',
    disabled: true,
  },
  {
    id: 'premium',
    name: 'Premium',
    price: '₦2,500',
    period: 'per month',
    color: 'primary',
    badge: 'Most Popular',
    features: [
      'Everything in Free',
      'Unlimited saved jobs & scholarships',
      'Profile boost — appear higher in employer searches',
      'Unlimited job alerts',
      'See who viewed your profile',
      'Application status tracking',
      'Priority support',
      'Early access to new features',
    ],
    cta: 'Upgrade to Premium',
    disabled: false,
  },
  {
    id: 'premium-annual',
    name: 'Premium Annual',
    price: '₦20,000',
    period: 'per year',
    color: 'purple',
    badge: 'Save ₦10,000',
    features: [
      'Everything in Premium',
      '2 months free',
      'CV review by career expert (1x/year)',
      'Featured applicant badge on applications',
      'Dedicated career tips newsletter',
    ],
    cta: 'Get Annual Plan',
    disabled: false,
  },
];

const PERKS = [
  { icon: FiTrendingUp, title: 'Profile Boost', desc: 'Your profile ranks higher when employers search for candidates.' },
  { icon: FiBell, title: 'Unlimited Job Alerts', desc: 'Get notified instantly for every job that matches your skills.' },
  { icon: FiEye, title: 'Profile Views', desc: 'See exactly which employers have viewed your profile.' },
  { icon: FiShield, title: 'Application Tracking', desc: 'Real-time status updates — know when your application is reviewed.' },
  { icon: FiFileText, title: 'CV Review', desc: 'Annual plan includes a human expert CV review (coming soon).' },
  { icon: FiStar, title: 'Featured Badge', desc: 'Stand out with a Premium badge on all your applications.' },
];

export default function Premium() {
  const { user, updateUserProfile } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');

  const isPremium = user?.tier === 'premium' || user?.tier === 'premium-annual';

  const handleUpgrade = async (planId) => {
    if (!user) { navigate('/login'); return; }
    if (planId === 'free') return;

    setLoading(true);
    setError('');
    setSuccess('');

    try {
      // In production replace this with a real payment gateway (Paystack / Flutterwave)
      // For now we directly upgrade the tier — swap this block with payment flow
      await updateDoc(doc(db, 'users', user.uid), {
        tier: planId,
        premiumSince: serverTimestamp(),
        premiumPlan: planId,
        updatedAt: serverTimestamp(),
      });
      await updateUserProfile({ tier: planId });
      setSuccess(`You're now on the ${planId === 'premium-annual' ? 'Annual Premium' : 'Premium'} plan! 🎉`);
      setTimeout(() => navigate('/dashboard'), 2000);
    } catch (err) {
      setError('Upgrade failed. Please try again or contact support.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 pb-16">

      {/* Hero */}
      <div className="bg-gradient-to-br from-primary-600 via-primary-700 to-purple-700 text-white py-14 px-4 text-center">
        <div className="max-w-2xl mx-auto">
          <span className="inline-flex items-center gap-1.5 text-xs px-3 py-1 bg-white/20 rounded-full font-semibold mb-4">
            <FiZap size={12} /> JoblifyHQ Premium
          </span>
          <h1 className="text-4xl font-bold mb-3">Land your dream job faster</h1>
          <p className="text-primary-100 text-lg">
            Unlock tools that get you noticed, keep you informed and move your career forward.
          </p>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 py-12">

        {/* Alerts */}
        {success && (
          <div className="mb-6 p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-700 rounded-xl text-green-700 dark:text-green-400 text-sm font-medium text-center">
            {success}
          </div>
        )}
        {error && (
          <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-700 rounded-xl text-red-700 dark:text-red-400 text-sm font-medium text-center">
            {error}
          </div>
        )}

        {isPremium && (
          <div className="mb-8 p-5 bg-primary-50 dark:bg-primary-900/20 border border-primary-200 dark:border-primary-700 rounded-2xl flex items-center gap-3">
            <FiStar className="text-primary-600 flex-shrink-0" size={22} />
            <div>
              <p className="font-semibold text-primary-800 dark:text-primary-300">You're already a Premium member!</p>
              <p className="text-sm text-primary-600 dark:text-primary-400">Enjoying all premium perks on your {user.tier === 'premium-annual' ? 'Annual' : 'Monthly'} plan.</p>
            </div>
          </div>
        )}

        {/* Pricing Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16">
          {PLANS.map((plan) => (
            <div
              key={plan.id}
              className={`relative bg-white dark:bg-gray-800 rounded-2xl border-2 p-6 flex flex-col ${
                plan.id === 'premium'
                  ? 'border-primary-500 shadow-lg shadow-primary-100 dark:shadow-none'
                  : 'border-gray-100 dark:border-gray-700'
              }`}
            >
              {plan.badge && (
                <span className={`absolute -top-3 left-1/2 -translate-x-1/2 text-xs px-3 py-1 rounded-full font-semibold whitespace-nowrap ${
                  plan.id === 'premium'
                    ? 'bg-primary-600 text-white'
                    : 'bg-purple-600 text-white'
                }`}>
                  {plan.badge}
                </span>
              )}

              <div className="mb-4">
                <h2 className="text-lg font-bold text-gray-900 dark:text-white">{plan.name}</h2>
                <div className="flex items-baseline gap-1 mt-1">
                  <span className="text-3xl font-bold text-gray-900 dark:text-white">{plan.price}</span>
                  <span className="text-sm text-gray-500 dark:text-gray-400">/{plan.period}</span>
                </div>
              </div>

              <ul className="space-y-2.5 mb-6 flex-1">
                {plan.features.map((f) => (
                  <li key={f} className="flex items-start gap-2 text-sm text-gray-700 dark:text-gray-300">
                    <FiCheck className="text-green-500 flex-shrink-0 mt-0.5" size={15} />
                    {f}
                  </li>
                ))}
              </ul>

              <button
                onClick={() => handleUpgrade(plan.id)}
                disabled={plan.disabled || loading || (isPremium && plan.id === user?.tier)}
                className={`w-full py-3 rounded-xl font-semibold text-sm transition ${
                  plan.id === 'free' || (isPremium && plan.id === user?.tier)
                    ? 'bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400 cursor-default'
                    : plan.id === 'premium'
                    ? 'bg-primary-600 hover:bg-primary-700 text-white'
                    : 'bg-purple-600 hover:bg-purple-700 text-white'
                }`}
              >
                {loading ? 'Processing…' : isPremium && plan.id === user?.tier ? 'Active Plan' : plan.cta}
              </button>
            </div>
          ))}
        </div>

        {/* Perks Grid */}
        <div className="mb-16">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white text-center mb-8">What you unlock with Premium</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {PERKS.map(({ icon: Icon, title, desc }) => (
              <div key={title} className="bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-2xl p-5 flex gap-4">
                <div className="w-10 h-10 bg-primary-50 dark:bg-primary-900/30 rounded-xl flex items-center justify-center text-primary-600 flex-shrink-0">
                  <Icon size={20} />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 dark:text-white text-sm mb-1">{title}</h3>
                  <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed">{desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* FAQ */}
        <div className="max-w-2xl mx-auto">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white text-center mb-6">Common questions</h2>
          <div className="space-y-4">
            {[
              { q: 'How do I pay?', a: 'Payment via Paystack or bank transfer. We accept cards, USSD, and mobile money. (Payment gateway integration coming soon — upgrade is simulated for now.)' },
              { q: 'Can I cancel anytime?', a: 'Yes. Cancel before your next billing date and you keep your Premium access until the end of the period.' },
              { q: 'Is my data safe?', a: 'Absolutely. Your data is stored securely on Firebase and is never sold to third parties.' },
              { q: 'What is profile boost?', a: 'Your profile appears higher in employer search results and application lists, increasing your chances of being noticed.' },
            ].map(({ q, a }) => (
              <div key={q} className="bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-xl p-5">
                <h3 className="font-semibold text-gray-900 dark:text-white text-sm mb-2">{q}</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed">{a}</p>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}
