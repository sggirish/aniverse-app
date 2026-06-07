export default function CharacterLoading() {
  return (
    <div className="max-w-xl mx-auto px-4 py-16 animate-pulse space-y-6">
      <div className="h-6 bg-[#F3F4F6] rounded w-40" />
      <div className="h-12 bg-[#F3F4F6] rounded w-72" />
      <div className="h-2 bg-[#F3F4F6] rounded-full" />
      <div className="h-7 bg-[#F3F4F6] rounded w-3/4" />
      <div className="space-y-2.5">
        {[1,2,3,4].map(i => <div key={i} className="h-14 bg-[#F3F4F6] rounded-xl" />)}
      </div>
    </div>
  );
}
