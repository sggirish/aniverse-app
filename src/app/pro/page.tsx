export default function ProPage() {
  const features = [
    { icon: "⚡", title: "Unlimited Roasts", desc: "No daily limits on anime roasts — go wild.", free: "5/day", pro: "Unlimited" },
    { icon: "🎭", title: "Identity Card History", desc: "Save and share your identity cards over time.", free: "1 at a time", pro: "Unlimited history" },
    { icon: "💘", title: "Bulk Compatibility", desc: "Compare your taste against multiple friends at once.", free: "1 pair/day", pro: "10 pairs/day" },
    { icon: "📊", title: "Advanced Tier Lists", desc: "Tier lists with custom criteria and deeper analysis.", free: "Basic", pro: "Advanced + custom" },
    { icon: "🎮", title: "Game Score Boosts", desc: "Double XP on leaderboards, exclusive badges.", free: "Standard", pro: "2x + badges" },
    { icon: "🎁", title: "Wrapped Deep Dive", desc: "Full year analytics with month-by-month breakdown.", free: "Summary only", pro: "Full breakdown" },
    { icon: "🔥", title: "Early Access", desc: "Try new features before anyone else.", free: "No", pro: "Yes" },
    { icon: "🎨", title: "Custom Identity Cards", desc: "Choose themes and colors for your card.", free: "Default only", pro: "10+ themes" },
  ];

  return (
    <main className="min-h-screen bg-[#0a0a0f] text-white px-4 py-12">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 bg-gradient-to-r from-purple-600/20 to-pink-600/20 border border-purple-500/30 rounded-full px-4 py-2 mb-6">
            <span className="text-purple-400 text-sm font-medium">Coming Soon</span>
          </div>
          <h1 className="text-5xl font-black mb-4">
            <span className="bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">AniDeck Pro</span>
          </h1>
          <p className="text-xl text-gray-400 max-w-lg mx-auto">
            For the anime fan who takes their hobby seriously. Unlock the full power of AniDeck.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-6 mb-16">
          <div className="bg-[#12121a] border border-[#2a2a3a] rounded-2xl p-6">
            <h2 className="text-xl font-bold text-white mb-1">Free</h2>
            <div className="text-4xl font-black text-gray-400 mb-6">$0</div>
            <ul className="space-y-3">
              {features.map((f) => (
                <li key={f.title} className="flex items-start gap-3">
                  <span className="text-gray-600 mt-0.5">○</span>
                  <div>
                    <span className="text-gray-400 text-sm">{f.title}</span>
                    <span className="text-gray-600 text-xs ml-2">— {f.free}</span>
                  </div>
                </li>
              ))}
            </ul>
          </div>

          <div className="bg-gradient-to-br from-purple-900/30 to-pink-900/20 border border-purple-500/40 rounded-2xl p-6 relative overflow-hidden">
            <div className="absolute top-3 right-3 bg-purple-500 text-white text-xs font-bold px-2 py-1 rounded-full">PRO</div>
            <h2 className="text-xl font-bold text-white mb-1">Pro</h2>
            <div className="text-4xl font-black text-purple-400 mb-1">$4.99</div>
            <div className="text-gray-500 text-sm mb-6">/ month</div>
            <ul className="space-y-3">
              {features.map((f) => (
                <li key={f.title} className="flex items-start gap-3">
                  <span className="text-purple-400 mt-0.5">✓</span>
                  <div>
                    <span className="text-white text-sm">{f.title}</span>
                    <span className="text-purple-300 text-xs ml-2">— {f.pro}</span>
                  </div>
                </li>
              ))}
            </ul>

            <button
              disabled
              className="mt-6 w-full bg-gradient-to-r from-purple-600 to-pink-600 opacity-60 cursor-not-allowed text-white font-semibold py-3 rounded-xl"
            >
              Coming Soon
            </button>
          </div>
        </div>

        <div className="text-center">
          <h2 className="text-2xl font-bold text-white mb-4">Interested in Pro?</h2>
          <p className="text-gray-400 mb-6">Join the waitlist and get 3 months free when we launch.</p>
          <div className="flex gap-3 max-w-md mx-auto">
            <input
              type="email"
              placeholder="your@email.com"
              className="flex-1 bg-[#12121a] border border-[#2a2a3a] rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-purple-500"
            />
            <button className="bg-purple-600 hover:bg-purple-500 text-white font-semibold px-6 py-3 rounded-xl transition-colors">
              Join Waitlist
            </button>
          </div>
          <p className="text-xs text-gray-600 mt-3">No spam. Unsubscribe anytime.</p>
        </div>
      </div>
    </main>
  );
}
