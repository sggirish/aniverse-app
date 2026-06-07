"use client";
export default function GlobalError({ reset }: { reset: () => void }) {
  return (
    <div className="min-h-screen bg-[#FAFAF9] flex items-center justify-center px-4">
      <div className="text-center space-y-4">
        <p className="text-5xl">😅</p>
        <h2 className="text-xl font-bold">Something broke</h2>
        <p className="text-[#6B7280] text-sm">The AI got confused. It happens.</p>
        <button onClick={reset}
          className="text-sm font-semibold px-4 py-2 bg-[#0F0F0F] text-white rounded-xl hover:bg-[#1F1F1F]">
          Try again
        </button>
      </div>
    </div>
  );
}
