export const metadata = { title: "Privacy Policy" };

export default function PrivacyPage() {
  return (
    <div className="max-w-2xl mx-auto px-4 py-16 text-[#374151]">
      <h1 className="text-3xl font-black tracking-tight mb-2">Privacy Policy</h1>
      <p className="text-sm text-[#9CA3AF] mb-10">Last updated: June 2026</p>

      <section className="mb-8">
        <h2 className="text-lg font-bold mb-3">What we collect and why</h2>
        <div className="space-y-4 text-sm leading-relaxed">
          <div className="p-4 bg-white border border-[#E5E7EB] rounded-xl">
            <p className="font-semibold mb-1">MAL Usernames</p>
            <p className="text-[#6B7280]">When you use the Anime Roast tool, your MyAnimeList username and a summary of your watch history stats (completed count, mean score, top genres) are cached in our database for up to 24 hours to avoid redundant API calls. This cache expires automatically. We do not store your full anime list.</p>
          </div>
          <div className="p-4 bg-white border border-[#E5E7EB] rounded-xl">
            <p className="font-semibold mb-1">Quiz Answers</p>
            <p className="text-[#6B7280]">Character Match quiz answers (5 multiple-choice selections, no free text) are stored with a random session ID for up to 30 days to power shareable result links. They are not linked to any personal identity. Rows are deleted automatically after 30 days.</p>
          </div>
          <div className="p-4 bg-white border border-[#E5E7EB] rounded-xl">
            <p className="font-semibold mb-1">IP Addresses</p>
            <p className="text-[#6B7280]">Your IP address is used transiently for rate limiting (max 5 roasts / 10 character matches per day per IP). IP-based rate limit counters expire after 24 hours and are not stored in our database — only in our Redis cache.</p>
          </div>
          <div className="p-4 bg-white border border-[#E5E7EB] rounded-xl">
            <p className="font-semibold mb-1">Anime Verdicts</p>
            <p className="text-[#6B7280]">AI-generated verdicts for anime titles are stored permanently as public SEO pages. They contain no personal data — only the anime title and AI-generated opinion.</p>
          </div>
        </div>
      </section>

      <section className="mb-8">
        <h2 className="text-lg font-bold mb-3">Cookies</h2>
        <p className="text-sm leading-relaxed text-[#6B7280]">
          AniDeck itself does not set tracking cookies. We store two items in your browser&apos;s <code className="text-xs bg-[#F3F4F6] px-1 py-0.5 rounded">localStorage</code> (not cookies): a flag when you use a tool (to show the Buy Me a Coffee button), and a flag when you acknowledge this cookie banner.
        </p>
        <p className="text-sm leading-relaxed text-[#6B7280] mt-3">
          <strong>Google AdSense</strong>, if enabled on your visit, may set third-party cookies for ad personalisation. You can opt out via <a href="https://adssettings.google.com" target="_blank" rel="noopener noreferrer" className="underline">Google Ad Settings</a>. Affiliate links (Crunchyroll, NordVPN) are standard HTTP links — no tracking pixels or cookies from us.
        </p>
      </section>

      <section className="mb-8">
        <h2 className="text-lg font-bold mb-3">Analytics</h2>
        <p className="text-sm leading-relaxed text-[#6B7280]">
          We use <a href="https://plausible.io" target="_blank" rel="noopener noreferrer" className="underline">Plausible Analytics</a> — a privacy-first, cookieless tool that does not fingerprint users, does not track individuals across sites, and is fully GDPR/CCPA compliant. No personal data is collected by our analytics.
        </p>
      </section>

      <section className="mb-8">
        <h2 className="text-lg font-bold mb-3">Your rights (GDPR)</h2>
        <p className="text-sm leading-relaxed text-[#6B7280]">
          If you are in the EU/EEA, you have the right to request deletion of any data we hold about you. Since we store MAL usernames (for 24h) and quiz session IDs (for 30d), if you want either removed before expiry, contact us. Data deletes automatically after the TTL — no action required from you in most cases.
        </p>
      </section>

      <section className="mb-8">
        <h2 className="text-lg font-bold mb-3">Third-party services</h2>
        <ul className="text-sm text-[#6B7280] space-y-1 list-disc pl-5">
          <li><strong>Anthropic Claude API</strong> — AI generation. Inputs are sent to Anthropic's servers. See <a href="https://www.anthropic.com/privacy" target="_blank" rel="noopener noreferrer" className="underline">Anthropic Privacy Policy</a>.</li>
          <li><strong>Jikan API (MyAnimeList)</strong> — public anime data. No personal data sent.</li>
          <li><strong>Supabase</strong> — database hosting (EU/US). See <a href="https://supabase.com/privacy" target="_blank" rel="noopener noreferrer" className="underline">Supabase Privacy Policy</a>.</li>
          <li><strong>Upstash Redis</strong> — rate limit cache. IPs are held for 24h then expire.</li>
          <li><strong>Vercel</strong> — hosting. Access logs are standard server logs. See <a href="https://vercel.com/legal/privacy-policy" target="_blank" rel="noopener noreferrer" className="underline">Vercel Privacy Policy</a>.</li>
        </ul>
      </section>

      <section>
        <h2 className="text-lg font-bold mb-3">Contact</h2>
        <p className="text-sm text-[#6B7280]">
          Questions about your data? Reach out via the social links in the footer. We&apos;re a one-person project, not a corporation — we&apos;ll respond.
        </p>
      </section>
    </div>
  );
}
