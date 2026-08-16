'use client';

export default function BackToTop() {
  return (
    <div
      className="bg-artic-teal hover:bg-artic-teal/80 text-center py-3 cursor-pointer transition-colors"
      onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
      role="button"
      tabIndex={0}
      aria-label="Back to top"
      onKeyDown={(e) => e.key === 'Enter' && window.scrollTo({ top: 0, behavior: 'smooth' })}
    >
      <span className="text-sm text-white">Back to top</span>
    </div>
  );
}
