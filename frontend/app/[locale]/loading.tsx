export default function Loading() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-artic-light-bg">
      <div className="flex flex-col items-center gap-4">
        {/* Animated ARTIC logo */}
        <div className="text-artic-orange text-4xl font-black animate-pulse">ARTIC</div>
        {/* Spinner */}
        <div className="relative w-10 h-10">
          <div className="absolute inset-0 rounded-full border-4 border-gray-200" />
          <div className="absolute inset-0 rounded-full border-4 border-artic-orange border-t-transparent animate-spin" />
        </div>
        <p className="text-sm text-gray-400">Loading…</p>
      </div>
    </div>
  );
}
