export function IconPin({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden>
      <path d="M12 21s7-6.2 7-11.2A7 7 0 0 0 5 9.8C5 14.8 12 21 12 21z" />
      <circle cx="12" cy="9.8" r="2.2" />
    </svg>
  );
}

export function IconCapsule({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden>
      <rect x="4" y="7" width="16" height="10" rx="5" />
      <path d="M12 7v10" />
    </svg>
  );
}

export function IconTrip({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden>
      <path d="M4 19V6.5A2.5 2.5 0 0 1 6.5 4H20" />
      <path d="M8 8h12v11H8z" />
      <path d="M8 12h12" />
    </svg>
  );
}

export function IconTable({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden>
      <path d="M4 10h16" />
      <path d="M6 10v8" />
      <path d="M18 10v8" />
      <path d="M12 10v8" />
      <ellipse cx="12" cy="8" rx="8" ry="3" />
    </svg>
  );
}

export function IconAccount({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden>
      <circle cx="12" cy="8" r="3.2" />
      <path d="M5 19c1.4-3.2 3.8-5 7-5s5.6 1.8 7 5" />
    </svg>
  );
}
