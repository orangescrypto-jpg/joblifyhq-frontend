import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  FiZap, FiCheck, FiStar, FiTrendingUp, FiUsers, FiEye,
  FiBriefcase, FiMail, FiShield, FiGlobe, FiAward,
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
      '3 active job listings',
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
    monthlyPrice: 15000,
    annualPrice: 144000,
    color: 'border-primary-500',
    headerBg: 'bg-gradient-to-br from-primary-600 to-primary-700',
    btnClass: 'bg-primary-600 hover:bg-primary-700 text-white',
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
    monthlyPrice: 45000,
    annualPrice: 432000,
    color: 'border-purple-500',
    headerBg: 'bg-gradient-to-br from-purple-600 to-indigo-700',
    btnClass: 'bg-purple-600 hover:bg-purple-700 text-white',
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
  { icon: FiUsers,      title: 'Full Applicant Pipeline', desc: 'Kanban board to move candidates from Applied → Viewed → Shortlisted → Hired.' },
  { icon: FiEye,        title: 'Actively Hiring Badge', desc: 'Show job seekers your roles are fresh and you\'re ready to hire now.' },
  { icon: FiShield,     title: 'Verified Employer Badge', desc: 'Build trust with job seekers — verified employers get more quality applicants.' },
  { icon: FiGlobe,      title: 'Company Profile Page', desc: 'A dedicated /employers/yourcompany page with logo, culture info and all open roles.' },
  { icon: FiAward,      title: 'Analytics Dashboard', desc: 'See views, applications, and conversion rates for every listing you post.' },
];

function fmt(n) {
  return `₦${n.toLocaleString()}`;
}

export default function EmployerPremium() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [billing, setBilling] = useState('monthly'); // 'monthly' | 'annual'

  const isPremium = user?.employerTier && user.employerTier !== 'basic';
  const currentPlan = user?.employerTier || 'basic';

  const handleSelect = (planKey) => {
    if (planKey === 'basic') return;
    // In production: integrate Paystack / Flutterwave here
    alert(`Upgrade flow for ${planKey} plan — integrate your payment provider here.`);
  };

  return (
    <div className="space-y-12 pb-16">

      {/* Hero */}
      <div className="text-center">
        <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary-50 dark:bg-primary-900/20 text-primary-700 dark:text-primary-300 rounded-full text-sm font-semibold mb-4">
          <FiZap size={14} /> Employer Premium Plans
        </div>
        <h1 className="text-3xl md:text-4xl font-black text-gray-900 dark:text-white mb-3">
          Hire Faster. Hire Better.
        </h1>
        <p className="text-gray-500 dark:text-gray-400 max-w-xl mx-auto text-base">
          Reach thousands of qualified Nigerian and African candidates. Feature your roles, manage your pipeline, and build your employer brand.
        </p>

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
          const price = billing === 'annual' ? plan.annualPrice : plan.monthlyPrice * 12;
          const displayPrice = billing === 'monthly' ? plan.monthlyPrice : Math.round(plan.annualPrice / 12);
          const isCurrentPlan = currentPlan === plan.key;

          return (
            <div
              key={plan.key}
              className={`rounded-2xl border-2 ${plan.color} overflow-hidden shadow-sm ${plan.tag ? 'md:-mt-4 md:shadow-xl' : ''}`}
            >
              {/* Card header */}
              <div className={`${plan.headerBg} p-6 ${plan.key !== 'basic' ? 'text-white' : 'text-gray-900 dark:text-white'}`}>
                <div className="flex items-center justify-between mb-1">
                  <h3 className="text-lg font-bold">{plan.name}</h3>
                  {plan.tag && (
                    <span className="text-xs px-2.5 py-1 bg-white/25 rounded-full font-semibold">
                      {plan.tag}
                    </span>
                  )}
                </div>
                {plan.monthlyPrice === 0 ? (
                  <div className="mt-3">
                    <span className="text-3xl font-black">Free</span>
                    <span className={`text-sm ml-1 ${plan.key !== 'basic' ? 'text-white/70' : 'text-gray-500'}`}>forever</span>
                  </div>
                ) : (
                  <div className="mt-3">
                    <span className="text-3xl font-black">{fmt(displayPrice)}</span>
                    <span className={`text-sm ml-1 ${plan.key !== 'basic' ? 'text-white/70' : 'text-gray-500 dark:text-gray-400'}`}>/month</span>
                    {billing === 'annual' && (
                      <p className={`text-xs mt-1 ${plan.key !== 'basic' ? 'text-white/60' : 'text-gray-400'}`}>
                        Billed {fmt(plan.annualPrice)}/year
                      </p>
                    )}
                  </div>
                )}
              </div>

              {/* Body */}
              <div className="bg-white dark:bg-gray-900 p-6">
                <button
                  onClick={() => handleSelect(plan.key)}
                  disabled={isCurrentPlan || plan.key === 'basic'}
                  className={`w-full py-3 px-4 rounded-xl font-bold text-sm transition mb-6 disabled:opacity-60 disabled:cursor-default ${
                    isCurrentPlan
                      ? 'bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400'
                      : plan.btnClass
                  }`}
                >
                  {isCurrentPlan ? 'Current Plan' : plan.key === 'basic' ? 'Free Plan' : `Upgrade to ${plan.name}`}
                </button>

                <ul className="space-y-3 mb-6">
                  {plan.features.map(f => (
                    <li key={f} className="flex items-start gap-2.5 text-sm text-gray-700 dark:text-gray-300">
                      <FiCheck size={15} className="text-green-500 mt-0.5 shrink-0" />
                      {f}
                    </li>
                  ))}
                  {plan.missing.map(f => (
                    <li key={f} className="flex items-start gap-2.5 text-sm text-gray-400 dark:text-gray-500">
                      <span className="w-3.5 h-3.5 mt-0.5 shrink-0 text-center text-gray-300">—</span>
                      {f}
                    </li>
                  ))}
                </ul>

                {plan.key === 'enterprise' && (
                  <a
                    href="mailto:hello@joblifyhq.com?subject=Enterprise Plan Enquiry"
                    className="block text-center text-sm text-purple-600 hover:underline font-medium"
                  >
                    <FiMail className="inline mr-1" size={13} /> Contact us for custom pricing
                  </a>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Why upgrade perks */}
      <div>
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white text-center mb-8">
          Why Employers Choose Premium
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {PERKS.map(({ icon: Icon, title, desc }) => (
            <div key={title} className="bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 p-5 shadow-sm">
              <div className="w-10 h-10 bg-primary-50 dark:bg-primary-900/20 rounded-xl flex items-center justify-center text-primary-600 mb-3">
                <Icon size={20} />
              </div>
              <h3 className="font-bold text-gray-900 dark:text-white mb-1 text-sm">{title}</h3>
              <p className="text-gray-500 dark:text-gray-400 text-sm">{desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Social proof / trust */}
      <div className="bg-gradient-to-br from-primary-600 to-purple-700 rounded-2xl p-8 text-white text-center">
        <FiStar size={32} className="mx-auto mb-3 opacity-80" />
        <h3 className="text-xl font-bold mb-2">Trusted by Growing Companies Across Africa</h3>
        <p className="text-primary-100 text-sm max-w-lg mx-auto mb-6">
          From Lagos startups to Nairobi enterprises — JoblifyHQ Premium helps you find the right talent faster, with less noise.
        </p>
        <div className="flex flex-wrap justify-center gap-6 text-center text-sm">
          {[
            { stat: '50,000+', label: 'Job Seekers' },
            { stat: '3×', label: 'More Applications' },
            { stat: '48hrs', label: 'Avg Time to First Applicant' },
            { stat: '12+', label: 'Countries' },
          ].map(({ stat, label }) => (
            <div key={label}>
              <p className="text-2xl font-black">{stat}</p>
              <p className="text-primary-200 text-xs mt-0.5">{label}</p>
            </div>
          ))}
        </div>
      </div>

      {/* FAQ */}
      <div className="max-w-2xl mx-auto">
        <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6 text-center">Common Questions</h2>
        <div className="space-y-4">
          {[
            {
              q: 'Can I cancel anytime?',
              a: 'Yes. You can cancel your plan at any time. Your benefits continue until the end of your billing cycle.',
            },
            {
              q: 'What payment methods do you accept?',
              a: 'We accept card payments via Paystack and Flutterwave, including Naira debit cards, USSD, and bank transfers.',
            },
            {
              q: 'How do featured listings work?',
              a: 'Featured listings appear at the top of job search results and on the JoblifyHQ homepage, giving your role maximum visibility.',
            },
            {
              q: 'Can I upgrade or downgrade my plan?',
              a: 'Yes. You can change your plan at any time. Upgrades take effect immediately; downgrades take effect at the next billing cycle.',
            },
          ].map(({ q, a }) => (
            <div key={q} className="bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 p-5">
              <h4 className="font-semibold text-gray-900 dark:text-white text-sm mb-1">{q}</h4>
              <p className="text-gray-500 dark:text-gray-400 text-sm">{a}</p>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
}
