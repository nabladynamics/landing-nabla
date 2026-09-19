export function NablaMark({ className = "h-6 w-6" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
      className={className}
    >
      <defs>
        <linearGradient id="nabla-grad" x1="3" y1="4" x2="21" y2="21">
          <stop offset="0%" stopColor="#6446d7" />
          <stop offset="100%" stopColor="#3269b8" />
        </linearGradient>
      </defs>
      <path
        d="M3.6 4.5h16.8L12 20.4 3.6 4.5Z"
        stroke="url(#nabla-grad)"
        strokeWidth="2"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function Wordmark() {
  return (
    <span className="inline-flex items-center gap-2.5">
      <NablaMark className="h-6 w-6" />
      <span className="font-display text-xl font-semibold tracking-tight text-frost">
        Nabla AI
      </span>
    </span>
  );
}
