export default function WatchLoading() {
  return (
    <div className="max-w-2xl mx-auto px-4 py-16 animate-pulse space-y-6">
      <div className="h-6 bg-[#F3F4F6] rounded w-32" />
      <div className="h-12 bg-[#F3F4F6] rounded w-80" />
      <div className="h-12 bg-[#F3F4F6] rounded" />
      <div className="h-28 bg-[#F3F4F6] rounded-2xl" />
      <div className="grid grid-cols-2 gap-3">
        <div className="h-20 bg-[#F3F4F6] rounded-xl" />
        <div className="h-20 bg-[#F3F4F6] rounded-xl" />
      </div>
    </div>
  );
}
