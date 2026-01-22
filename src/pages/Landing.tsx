import { Link } from 'react-router-dom';
import { MessageSquare, Eye, TrendingDown, Users } from 'lucide-react';

export default function Landing() {
  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white">
      {/* Nav */}
      <nav className="flex items-center justify-between px-6 py-4 max-w-6xl mx-auto">
        <img src="/images/logo.png" alt="StillHereHQ" className="h-8" />
        <div className="flex items-center gap-6">
          <a href="#how-it-works" className="text-gray-400 hover:text-white text-sm">How It Works</a>
          <a href="#features" className="text-gray-400 hover:text-white text-sm">Features</a>
          <Link to="/login" className="text-gray-400 hover:text-white text-sm">Login</Link>
          <Link to="/signup" className="bg-white text-black px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-200">
            Start Free
          </Link>
        </div>
      </nav>

      {/* Hero */}
      <section className="text-center py-24 px-6">
        <p className="text-gray-500 text-sm mb-4 uppercase tracking-wide">Social Media Maintenance for Founders</p>
        <img src="/images/logo.png" alt="StillHereHQ" className="h-16 mx-auto mb-6" />
        <p className="text-gray-400 text-xl max-w-2xl mx-auto mb-4">
          Your social presence doesn't need strategy meetings.<br />It needs maintenance.
        </p>
        <p className="text-gray-500 max-w-xl mx-auto mb-8">
          We keep your LinkedIn and Twitter active, credible, and running quietly in the background - so you can focus on building.
        </p>
        <Link to="/signup" className="inline-block bg-white text-black px-8 py-3 rounded-lg font-medium hover:bg-gray-200">
          Start Free (No Credit Card)
        </Link>
        <p className="text-gray-600 text-sm mt-4">Trusted by 500+ founders. Build quietly. Cancel anytime.</p>
      </section>

      {/* What We Mean by Maintenance */}
      <section id="features" className="py-20 px-6 bg-[#111]">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-4">What We Mean by "Maintenance"</h2>
          <p className="text-gray-500 text-center mb-12">Social media breaks down quietly. We fix it before you notice.</p>
          
          <div className="grid md:grid-cols-2 gap-8">
            <div className="bg-[#1a1a1a] p-6 rounded-xl border border-gray-800">
              <div className="w-10 h-10 bg-[#222] rounded-lg flex items-center justify-center mb-4">
                <MessageSquare className="w-5 h-5 text-gray-400" />
              </div>
              <h3 className="text-lg font-semibold mb-2">Inconsistent posting</h3>
              <p className="text-gray-500 text-sm">Weeks go by, then profiles goes quiet. People forget you exist.</p>
            </div>
            
            <div className="bg-[#1a1a1a] p-6 rounded-xl border border-gray-800">
              <div className="w-10 h-10 bg-[#222] rounded-lg flex items-center justify-center mb-4">
                <TrendingDown className="w-5 h-5 text-gray-400" />
              </div>
              <h3 className="text-lg font-semibold mb-2">Content decay</h3>
              <p className="text-gray-500 text-sm">Old messages no longer reflects what you do or who you serve.</p>
            </div>
            
            <div className="bg-[#1a1a1a] p-6 rounded-xl border border-gray-800">
              <div className="w-10 h-10 bg-[#222] rounded-lg flex items-center justify-center mb-4">
                <Eye className="w-5 h-5 text-gray-400" />
              </div>
              <h3 className="text-lg font-semibold mb-2">Visibility loss</h3>
              <p className="text-gray-500 text-sm">Silent weeks cost you attention. Competitors stay visible.</p>
            </div>
            
            <div className="bg-[#1a1a1a] p-6 rounded-xl border border-gray-800">
              <div className="w-10 h-10 bg-[#222] rounded-lg flex items-center justify-center mb-4">
                <Users className="w-5 h-5 text-gray-400" />
              </div>
              <h3 className="text-lg font-semibold mb-2">Founder voice drift</h3>
              <p className="text-gray-500 text-sm">Without maintenance, your social presence stops sounding like you.</p>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section id="how-it-works" className="py-20 px-6">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-12">How StillHereHQ Works</h2>
          
          <div className="space-y-8">
            <div className="flex gap-6">
              <div className="w-8 h-8 bg-white text-black rounded-full flex items-center justify-center font-bold shrink-0">1</div>
              <div>
                <h3 className="text-lg font-semibold mb-1">Connect</h3>
                <p className="text-gray-500">Connect LinkedIn and/or Twitter. Tell us what you do.</p>
              </div>
            </div>
            
            <div className="flex gap-6">
              <div className="w-8 h-8 bg-white text-black rounded-full flex items-center justify-center font-bold shrink-0">2</div>
              <div>
                <h3 className="text-lg font-semibold mb-1">Maintain</h3>
                <p className="text-gray-500">Posts are drafted, reviewed, queued, and scheduled automatically. Human review ensures it still sounds like you.</p>
              </div>
            </div>
            
            <div className="flex gap-6">
              <div className="w-8 h-8 bg-white text-black rounded-full flex items-center justify-center font-bold shrink-0">3</div>
              <div>
                <h3 className="text-lg font-semibold mb-1">Approve & Forget</h3>
                <p className="text-gray-500">You approve or edit in seconds. Everything else runs in the background.</p>
              </div>
            </div>
          </div>
          
          <p className="text-center text-gray-500 mt-12">
            Used by <span className="text-white">500+ founders</span> who don't want to "do content."<br />
            <span className="text-gray-600">Like IT maintenance for your social presence.</span>
          </p>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 px-6 bg-[#111]">
        <div className="max-w-2xl mx-auto text-center">
          <h2 className="text-3xl font-bold mb-4">Reliable. Consistent. Background.</h2>
          <p className="text-gray-500 mb-8">Start free. No credit card. Cancel anytime.</p>
          <div className="flex gap-4 justify-center">
            <Link to="/signup" className="bg-white text-black px-6 py-3 rounded-lg font-medium hover:bg-gray-200">
              Start Free
            </Link>
            <a href="#features" className="border border-gray-700 px-6 py-3 rounded-lg font-medium hover:bg-gray-800">
              Learn More
            </a>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-6 px-6 border-t border-gray-800">
        <div className="max-w-6xl mx-auto flex justify-between items-center text-sm text-gray-500">
          <img src="/images/logo.png" alt="StillHereHQ" className="h-5 opacity-60" />
          <div className="flex gap-4">
            <a href="#" className="hover:text-white">Privacy</a>
            <a href="#" className="hover:text-white">Terms</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
