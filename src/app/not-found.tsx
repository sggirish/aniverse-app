import Link from "next/link";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-[#FAFAF9] flex items-center justify-center px-4">
      <div className="text-center space-y-4 max-w-sm">
        <p className="text-5xl">🔍</p>
        <h2 className="text-xl font-bold">Page not found</h2>
        <p className="text-[#6B7280] text-sm">That anime or page doesn&apos;t exist here. Try searching for it.</p>
        <Link href="/watch"
          className="inline-block text-sm font-semibold px-4 py-2.5 bg-[#16A34A] text-white rounded-xl hover:bg-[#15803d] transition-colors">
          Search for an anime →
        </Link>
      </div>
    </div>
  );
}
