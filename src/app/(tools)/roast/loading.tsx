export default function RoastLoading() {
  return (
    <div className="max-w-2xl mx-auto px-4 py-16 animate-pulse space-y-6">
      <div className="h-6 bg-[#F3F4F6] rounded w-32" />
      <div className="h-12 bg-[#F3F4F6] rounded w-64" />
      <div className="h-4 bg-[#F3F4F6] rounded w-full max-w-md" />
      <div className="h-12 bg-[#F3F4F6] rounded" />
      <div className="space-y-3 pt-4">
        <div className="h-4 bg-[#F3F4F6] rounded" />
        <div className="h-4 bg-[#F3F4F6] rounded w-5/6" />
        <div className="h-4 bg-[#F3F4F6] rounded w-4/6" />
      </div>
    </div>
  );
}
