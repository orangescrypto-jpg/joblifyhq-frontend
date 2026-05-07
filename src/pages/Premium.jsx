import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { doc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../firebase/config';
import {
  FiCheck, FiZap, FiStar, FiShield, FiBell,
  FiEye, FiFileText, FiTrendingUp, FiX,
} from 'react-icons/fi';
import { useNavigate } from 'react-router-dom';

const PLANS = [
  {
    id: 'free',
    name: 'Free',
    price: '$0',
    period: 'forever',
    description: 'Get started exploring jobs and scholarships across Africa.',
    features: [
      { text: 'Browse all jobs & scholarships', included: true },
      { text: 'Save up to 5 jobs', included: true },
      { text: 'Apply to jobs', included: true },
      { text: '1 job alert', included: true },
      { text: 'Basic profile', included: true },
      { text: 'Profile boost in employer search', included: false },
      { text: 'See who viewed your profile', included: false },
      { text: 'Unlimited job alerts', included: false },
      { text: 'Application status tracking', included: false },
      { text: 'Featured applicant badge', included: false },
    ],
    cta: 'Current Free Plan',
    disabled: true,
    accent: false,
  },
  {
    id: 'premium',
    name: 'Premium',
    price: '$4',
    period: 'per month',
    description: 'For active job seekers who want to stand out and move faster.',
    badge: 'Most Popular',
    features: [
      { text: 'Everything in Free', included: true },
      { text: 'Unlimited saved jobs & scholarships', included: true },
      { text: 'Profile boost in employer search', included: true },
      { text: 'See who viewed your profile', included: true },
      { text: 'Unlimited job alerts', included: true },
      { text: 'Application status tracking', included: true },
      { text: 'Priority support', included: true },
      { text: 'Early access to new features', included: true },
      { text: 'Featured applicant badge', included: false },
      { text: 'Expert CV review (1×/year)', included: false },
    ],
    cta: 'Upgrade to Premium',
    disabled: false,
    accent: true,
  },
  {
    id: 'premium-annual',
    name: 'Annual',
    price: '$40',
    period: 'per year',
    subtext: 'equivalent to $3.33/mo',
    description: 'Best value for serious career builders. Save $8 vs monthly.',
    badge: 'Save $8',
    features: [
      { text: 'Everything in Premium', included: true },
      { text: 'Featured applicant badge on applications', included: true },
      { text: 'Expert CV review (1×/year)', included: true },
      { text: 'Dedicated career tips newsletter', included: true },
      { text: 'Locked-in price guarantee', included: true },
      { text: 'Unlimited saved jobs & scholarships', included: true },
      { text: 'Profile boost in employer search', included: true },
      { text: 'See who viewed your profile', included: true },
      { text: 'Unlimited job alerts', included: true },
      { text: 'Application status tracking', included: true },
    ],
    cta: 'Get Annual Plan',
    disabled: false,
    accent: false,
  },
];

const PERKS = [
  {
    icon: FiTrendingUp,
    title: 'Profile Boost',
    desc: 'Your profile and applications rank higher when employers search for candidates on JoblifyHQ.',
  },
  {
    icon: FiBell,
    title: 'Unlimited Job Alerts',
    desc: 'Get notified the moment a job matching your skills and location is posted.',
  },
  {
    icon: FiEye,
    title: 'Profile Views',
    desc: 'See which employers and recruiters have visited your profile so you know who is interested.',
  },
  {
    icon: FiShield,
    title: 'Application Tracking',
    desc: 'Real-time status updates on every application — know exactly where you stand.',
  },
  {
    icon: FiFileText,
    title: 'Expert CV Review',
    desc: 'Annual plan includes one human expert CV review to help you craft a standout resume.',
  },
  {
    icon: FiStar,
    title: 'Featured Badge',
    desc: 'A Premium badge appears on all your applications, signalling seriousness to employers.',
  },
];

const FAQS = [
  {
    q: 'How do I pay?',
    a: 'Payment is processed securely via Paystack or Flutterwave — cards, USSD, bank transfer, and mobile money all supported. (Payment gateway integration coming soon — upgrade is currently simulated.)',
  },
  {
    q: 'Can I cancel anytime?',
    a: 'Yes. Cancel before your next billing date and your Premium access continues until the end of the period. No penalties.',
  },
  {
    q: 'What currency are prices in?',
    a: 'All prices are in US Dollars ($). This keeps pricing stable for users across Africa regardless of local exchange rate fluctuations.',
  },
  {
    q: 'What is profile boost?',
    a: 'Your profile appears higher in employer search results and application lists on JoblifyHQ, increasing your chances of being noticed without extra effort.',
  },
  {
    q: 'What does the expert CV review include?',
    a: 'A career professional reviews your CV and gives written feedback on structure, keywords, ATS-compatibility, and presentation. Available once per year on the Annual plan.',
  },
  {
    q: 'Is my payment information safe?',
    a: 'Yes. We never store card details. All transactions go through PCI-compliant payment processors. Your personal data is secured on Firebase and never sold.',
  },
];

export default function Premium() {
  const { user, updateUserProfile } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [loadingPlan, setLoadingPlan] = useState('');
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');
  const [openFaq, setOpenFaq] = useState(null);

  const isPremium = user?.tier === 'premium' || user?.tier === 'premium-annual';

  const handleUpgrade = async (planId) => {
    if (!user) { navigate('/login'); return; }
    if (planId === 'free') return;
    if (isPremium && planId === user?.tier) return;

    setLoading(true);
    setLoadingPlan(planId);
    setError('');
    setSuccess('');

    try {
      // 🔌 PAYSTACK INTEGRATION POINT
      // Replace the block below with your Paystack/Flutterwave payment call.
      // On payment success, run the Firestore update below.
      // Example: await initiatePaystackPayment({ email: user.email, amount: planId === 'premium' ? 400 : 4000, ... });

      await updateDoc(doc(db, 'users', user.uid), {
        tier: planId,
        premiumSince: serverTimestamp(),
        premiumPlan: planId,
        updatedAt: serverTimestamp(),
      });
      await updateUserProfile({ tier: planId });

      setSuccess(
        planId === 'premium-annual'
          ? "You're now on the Annual Premium plan! Welcome to the top tier. 🎉"
          : "You're now a Premium member! Your profile boost is live. 🚀"
      );
      setTimeout(() => navigate('/dashboard'), 2500);
    } catch (err) {
      console.error(err);
      setError('Upgrade failed. Please try again or contact support.');
    } finally {
      setLoading(false);
      setLoadingPlan('');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 pb-20">

      {/* Hero */}
      <div className="bg-gradient-to-br from-primary-600 via-primary-700 to-purple-700 text-white py-16 px-4 text-center">
        <div className="max-w-2xl mx-auto">
          <span className="inline-flex items-center gap-1.5 text-xs px-3 py-1.5 bg-white/20 rounded-full font-semibold mb-5 tracking-wide">
            <FiZap size={12} /> JoblifyHQ Premium
          </span>
          <h1 className="text-4xl md:text-5xl font-bold mb-4 leading-tight">
            Land your dream job faster
          </h1>
          <p className="text-primary-100 text-lg max-w-xl mx-auto leading-relaxed">
            Unlock tools that get you noticed by employers, keep you ahead of deadlines, and move your African career forward.
          </p>
          <div className="flex flex-wrap justify-center gap-3 mt-6 text-sm">
            {['Profile Boost', 'Unlimited Alerts', 'Who Viewed You', 'Application Tracking'].map(tag => (
              <span key={tag} className="px-3 py-1 bg-white/15 rounded-full text-primary-100">
                ✓ {tag}
              </span>
            ))}
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 py-12">

        {/* Alerts */}
        {success && (
          <div className="mb-8 p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-700 rounded-xl text-green-700 dark:text-green-400 text-sm font-medium text-center">
            {success}
          </div>
        )}
        {error && (
          <div className="mb-8 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-700 rounded-xl text-red-700 dark:text-red-400 text-sm font-medium text-center">
            {error}
          </div>
        )}

        {/* Already premium notice */}
        {isPremium && (
          <div className="mb-10 p-5 bg-primary-50 dark:bg-primary-900/20 border border-primary-200 dark:border-primary-700 rounded-2xl flex items-center gap-4">
            <div className="w-10 h-10 bg-primary-100 dark:bg-primary-900/40 rounded-xl flex items-center justify-center text-primary-600 flex-shrink-0">
              <FiStar size={20} />
            </div>
            <div>
              <p className="font-semibold text-primary-800 dark:text-primary-300">You're already a Premium member!</p>
              <p className="text-sm text-primary-600 dark:text-primary-400 mt-0.5 capitalize">
                Active plan: {user?.tier === 'premium-annual' ? 'Annual Premium' : 'Monthly Premium'}
              </p>
            </div>
            <button
              onClick={() => navigate('/dashboard')}
              className="ml-auto text-sm font-medium text-primary-600 hover:underline whitespace-nowrap"
            >
              Go to Dashboard →
            </button>
          </div>
        )}

        {/* Pricing Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-20">
          {PLANS.map((plan) => (
            <div
              key={plan.id}
              className={`relative bg-white dark:bg-gray-800 rounded-2xl flex flex-col transition-shadow ${
                plan.accent
                  ? 'border-2 border-primary-500 shadow-xl shadow-primary-100/40 dark:shadow-none'
                  : 'border border-gray-200 dark:border-gray-700'
              }`}
            >
              {/* Badge */}
              {plan.badge && (
                <span className={`absolute -top-3.5 left-1/2 -translate-x-1/2 text-xs px-4 py-1 rounded-full font-semibold whitespace-nowrap shadow-sm ${
                  plan.accent
                    ? 'bg-primary-600 text-white'
                    : 'bg-purple-600 text-white'
                }`}>
                  {plan.badge}
                </span>
              )}

              <div className="p-6 flex flex-col flex-1">
                {/* Plan header */}
                <div className="mb-5">
                  <h2 className="text-lg font-bold text-gray-900 dark:text-white">{plan.name}</h2>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 leading-relaxed">{plan.description}</p>
                  <div className="flex items-baseline gap-1 mt-3">
                    <span className="text-4xl font-bold text-gray-900 dark:text-white">{plan.price}</span>
                    <span className="text-sm text-gray-500 dark:text-gray-400">/{plan.period}</span>
                  </div>
                  {plan.subtext && (
                    <p className="text-xs text-primary-600 dark:text-primary-400 mt-1 font-medium">{plan.subtext}</p>
                  )}
                </div>

                {/* Features */}
                <ul className="space-y-2.5 mb-6 flex-1">
                  {plan.features.map((f) => (
                    <li key={f.text} className={`flex items-start gap-2.5 text-sm ${f.included ? 'text-gray-700 dark:text-gray-300' : 'text-gray-400 dark:text-gray-600'}`}>
                      {f.included
                        ? <FiCheck className="text-green-500 flex-shrink-0 mt-0.5" size={15} />
                        : <FiX className="text-gray-300 dark:text-gray-600 flex-shrink-0 mt-0.5" size={15} />
                      }
                      {f.text}
                    </li>
                  ))}
                </ul>

                {/* CTA */}
                <button
                  onClick={() => handleUpgrade(plan.id)}
                  disabled={
                    plan.disabled ||
                    loading ||
                    (isPremium && plan.id === user?.tier)
                  }
                  className={`w-full py-3 rounded-xl font-semibold text-sm transition flex items-center justify-center gap-2 ${
                    plan.disabled || (isPremium && plan.id === user?.tier)
                      ? 'bg-gray-100 dark:bg-gray-700 text-gray-400 dark:text-gray-500 cursor-default'
                      : plan.accent
                      ? 'bg-primary-600 hover:bg-primary-700 text-white'
                      : plan.id === 'premium-annual'
                      ? 'bg-purple-600 hover:bg-purple-700 text-white'
                      : 'bg-gray-100 dark:bg-gray-700 text-gray-500 cursor-default'
                  }`}
                >
                  {loadingPlan === plan.id ? (
                    <>
                      <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                      Processing…
                    </>
                  ) : isPremium && plan.id === user?.tier ? (
                    '✓ Active Plan'
                  ) : (
                    plan.cta
                  )}
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Perks Grid */}
        <div className="mb-20">
          <div className="text-center mb-10">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white">Everything you unlock</h2>
            <p className="text-gray-500 dark:text-gray-400 mt-2 text-sm max-w-lg mx-auto">
              Built specifically for African job seekers competing locally and globally.
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {PERKS.map(({ icon: Icon, title, desc }) => (
              <div key={title} className="bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-2xl p-5 flex gap-4 hover:border-primary-200 dark:hover:border-primary-700 transition">
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

        {/* Comparison callout */}
        <div className="mb-20 bg-gradient-to-r from-primary-600 to-purple-600 rounded-2xl p-8 text-white text-center">
          <p className="text-primary-100 text-sm font-medium mb-2 uppercase tracking-wide">Think about it this way</p>
          <h2 className="text-2xl md:text-3xl font-bold mb-3">
            Less than a cup of coffee a month
          </h2>
          <p className="text-primary-100 max-w-lg mx-auto text-sm leading-relaxed">
            At $4/month, Premium costs less than a single café visit — but it gives you the tools to land a job that changes your income for years. The ROI on one successful application is thousands of dollars.
          </p>
          <button
            onClick={() => {
              document.getElementById('plans-anchor')?.scrollIntoView({ behavior: 'smooth' });
            }}
            className="mt-5 inline-block bg-white text-primary-700 font-bold px-8 py-3 rounded-xl hover:bg-primary-50 transition"
          >
            Choose a Plan →
          </button>
        </div>

        {/* FAQ */}
        <div className="max-w-2xl mx-auto">
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white text-center mb-8">Common questions</h2>
          <div className="space-y-3">
            {FAQS.map(({ q, a }, i) => (
              <div
                key={q}
                className="bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-xl overflow-hidden"
              >
                <button
                  onClick={() => setOpenFaq(openFaq === i ? null : i)}
                  className="w-full flex items-center justify-between px-5 py-4 text-left gap-3"
                >
                  <span className="font-semibold text-gray-900 dark:text-white text-sm">{q}</span>
                  <span className={`text-gray-400 transition-transform flex-shrink-0 ${openFaq === i ? 'rotate-45' : ''}`}>
                    <FiZap size={14} className={openFaq === i ? 'text-primary-600' : ''} />
                  </span>
                </button>
                {openFaq === i && (
                  <div className="px-5 pb-4">
                    <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed">{a}</p>
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Bottom CTA */}
          <div className="mt-10 text-center">
            <p className="text-gray-500 dark:text-gray-400 text-sm mb-4">Still have questions?</p>
            
              href="/contact"
              className="text-primary-600 font-semibold hover:underline text-sm"
            >
              Contact our support team →
            </a>
          </div>
        </div>

      </div>
    </div>
  );
}
