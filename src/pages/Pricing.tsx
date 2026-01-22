import { useNavigate } from 'react-router-dom';
import { Check, ArrowLeft } from 'lucide-react';
import { PRICING_TIERS } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';

export default function Pricing() {
  const navigate = useNavigate();
  const { user } = useAuth();

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white">
      <div className="max-w-6xl mx-auto px-4 py-16">
        <button
          onClick={() => navigate(user ? '/dashboard' : '/')}
          className="flex items-center gap-2 text-gray-400 hover:text-white mb-8"
        >
          <ArrowLeft className="w-4 h-4" /> Back
        </button>

        <div className="text-center mb-16">
          <h1 className="text-4xl font-bold mb-4">Simple, transparent pricing</h1>
          <p className="text-xl text-gray-400">Choose the plan that works for your content needs</p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {PRICING_TIERS.map((tier, index) => (
            <div
              key={tier.id}
              className={`bg-[#111] border rounded-xl p-6 flex flex-col ${
                tier.id === 'pro' ? 'border-white ring-2 ring-white' : 'border-gray-800'
              }`}
            >
              {tier.id === 'pro' && (
                <div className="bg-white text-black text-xs font-bold px-3 py-1 rounded-full w-fit mb-4">
                  MOST POPULAR
                </div>
              )}
              
              <h3 className="text-xl font-bold mb-2">{tier.name}</h3>
              
              <div className="mb-6">
                <span className="text-4xl font-bold">${tier.price}</span>
                {tier.price > 0 && <span className="text-gray-400">/month</span>}
              </div>

              <ul className="space-y-3 mb-8 flex-1">
                {tier.features.map((feature, i) => (
                  <li key={i} className="flex items-start gap-3 text-sm text-gray-300">
                    <Check className="w-4 h-4 text-green-400 flex-shrink-0 mt-0.5" />
                    {feature}
                  </li>
                ))}
              </ul>

              <button
                onClick={() => {
                  if (!user) {
                    navigate('/signup');
                  } else if (tier.price === 0) {
                    navigate('/dashboard');
                  } else {
                    // Mock checkout for now
                    alert(`Checkout for ${tier.name} plan coming soon!`);
                  }
                }}
                className={`w-full py-3 rounded-lg font-medium transition ${
                  tier.id === 'pro'
                    ? 'bg-white text-black hover:bg-gray-200'
                    : 'border border-gray-700 hover:border-gray-500'
                }`}
              >
                {tier.price === 0 ? 'Get Started Free' : 'Start Trial'}
              </button>
            </div>
          ))}
        </div>

        <div className="mt-16 bg-[#111] border border-gray-800 rounded-xl p-8">
          <h2 className="text-2xl font-bold mb-6 text-center">Compare Plans</h2>
          
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-800">
                  <th className="text-left py-4 px-4 text-gray-400 font-medium">Feature</th>
                  {PRICING_TIERS.map(tier => (
                    <th key={tier.id} className="text-center py-4 px-4 font-medium">{tier.name}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                <tr className="border-b border-gray-800">
                  <td className="py-4 px-4 text-gray-300">Posts per month</td>
                  {PRICING_TIERS.map(tier => (
                    <td key={tier.id} className="text-center py-4 px-4">{tier.posts}</td>
                  ))}
                </tr>
                <tr className="border-b border-gray-800">
                  <td className="py-4 px-4 text-gray-300">Platforms</td>
                  {PRICING_TIERS.map(tier => (
                    <td key={tier.id} className="text-center py-4 px-4">
                      {tier.platforms === 10 ? 'Unlimited' : tier.platforms}
                    </td>
                  ))}
                </tr>
                <tr className="border-b border-gray-800">
                  <td className="py-4 px-4 text-gray-300">AI Content Generation</td>
                  <td className="text-center py-4 px-4 text-gray-500">-</td>
                  <td className="text-center py-4 px-4"><Check className="w-5 h-5 text-green-400 mx-auto" /></td>
                  <td className="text-center py-4 px-4"><Check className="w-5 h-5 text-green-400 mx-auto" /></td>
                  <td className="text-center py-4 px-4"><Check className="w-5 h-5 text-green-400 mx-auto" /></td>
                </tr>
                <tr className="border-b border-gray-800">
                  <td className="py-4 px-4 text-gray-300">Scheduling</td>
                  <td className="text-center py-4 px-4 text-gray-500">-</td>
                  <td className="text-center py-4 px-4"><Check className="w-5 h-5 text-green-400 mx-auto" /></td>
                  <td className="text-center py-4 px-4"><Check className="w-5 h-5 text-green-400 mx-auto" /></td>
                  <td className="text-center py-4 px-4"><Check className="w-5 h-5 text-green-400 mx-auto" /></td>
                </tr>
                <tr className="border-b border-gray-800">
                  <td className="py-4 px-4 text-gray-300">Analytics</td>
                  <td className="text-center py-4 px-4 text-gray-400">Basic</td>
                  <td className="text-center py-4 px-4 text-gray-400">Standard</td>
                  <td className="text-center py-4 px-4 text-white">Advanced</td>
                  <td className="text-center py-4 px-4 text-white">Advanced</td>
                </tr>
                <tr className="border-b border-gray-800">
                  <td className="py-4 px-4 text-gray-300">Team Members</td>
                  <td className="text-center py-4 px-4">1</td>
                  <td className="text-center py-4 px-4">1</td>
                  <td className="text-center py-4 px-4">5</td>
                  <td className="text-center py-4 px-4">Unlimited</td>
                </tr>
                <tr>
                  <td className="py-4 px-4 text-gray-300">White-label</td>
                  <td className="text-center py-4 px-4 text-gray-500">-</td>
                  <td className="text-center py-4 px-4 text-gray-500">-</td>
                  <td className="text-center py-4 px-4 text-gray-500">-</td>
                  <td className="text-center py-4 px-4"><Check className="w-5 h-5 text-green-400 mx-auto" /></td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <div className="mt-16 text-center">
          <h2 className="text-2xl font-bold mb-4">Questions?</h2>
          <p className="text-gray-400 mb-6">We are here to help. Contact us anytime.</p>
          <button className="border border-gray-700 px-6 py-3 rounded-lg hover:border-gray-500">
            Contact Sales
          </button>
        </div>
      </div>
    </div>
  );
}
