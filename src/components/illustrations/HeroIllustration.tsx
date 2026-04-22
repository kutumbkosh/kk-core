export default function HeroIllustration() {
  return (
    <svg viewBox="0 0 480 360" className="w-full h-full" fill="none" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="hero-shield-grad" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#2563EB" />
          <stop offset="100%" stopColor="#1D4ED8" />
        </linearGradient>
        <linearGradient id="hero-glow" x1="0.5" y1="0" x2="0.5" y2="1">
          <stop offset="0%" stopColor="#3B82F6" stopOpacity="0.2" />
          <stop offset="100%" stopColor="#3B82F6" stopOpacity="0" />
        </linearGradient>
        <filter id="hero-shadow" x="-20%" y="-20%" width="140%" height="140%">
          <feDropShadow dx="0" dy="4" stdDeviation="12" floodColor="#2563EB" floodOpacity="0.15" />
        </filter>
        <filter id="card-shadow" x="-20%" y="-10%" width="140%" height="130%">
          <feDropShadow dx="0" dy="2" stdDeviation="4" floodColor="#000" floodOpacity="0.08" />
        </filter>
      </defs>

      {/* Background glow */}
      <circle cx="240" cy="180" r="160" fill="url(#hero-glow)" />

      {/* ─── Central Shield ─── */}
      <g filter="url(#hero-shadow)">
        <path d="M240 60 L300 85 V155 C300 200 240 240 240 240 C240 240 180 200 180 155 V85 L240 60Z" fill="url(#hero-shield-grad)" />
        <path d="M240 72 L292 93 V155 C292 194 240 230 240 230 C240 230 188 194 188 155 V93 L240 72Z" fill="white" fillOpacity="0.1" />
      </g>

      {/* Checkmark inside shield */}
      <path d="M218 148 L234 164 L264 128" stroke="white" strokeWidth="6" strokeLinecap="round" strokeLinejoin="round" />

      {/* ─── Floating cards around the shield ─── */}

      {/* Card 1 — Bank (top-left) */}
      <g filter="url(#card-shadow)">
        <rect x="68" y="70" width="80" height="56" rx="10" fill="white" />
        <rect x="78" y="80" width="24" height="24" rx="6" fill="#DBEAFE" />
        <rect x="85" y="87" width="10" height="10" rx="2" fill="#2563EB" />
        <rect x="108" y="84" width="30" height="4" rx="2" fill="#E5E7EB" />
        <rect x="108" y="94" width="22" height="4" rx="2" fill="#F3F4F6" />
        <rect x="78" y="112" width="60" height="4" rx="2" fill="#F3F4F6" />
      </g>

      {/* Card 2 — Insurance (top-right) */}
      <g filter="url(#card-shadow)">
        <rect x="332" y="55" width="80" height="56" rx="10" fill="white" />
        <rect x="342" y="65" width="24" height="24" rx="6" fill="#FEF3C7" />
        <path d="M354 72 L354 72 L348 78 V84 C348 86 354 89 354 89 C354 89 360 86 360 84 V78 L354 72Z" fill="#D97706" />
        <rect x="372" y="69" width="30" height="4" rx="2" fill="#E5E7EB" />
        <rect x="372" y="79" width="22" height="4" rx="2" fill="#F3F4F6" />
        <rect x="342" y="97" width="60" height="4" rx="2" fill="#F3F4F6" />
      </g>

      {/* Card 3 — Stocks/MF (bottom-left) */}
      <g filter="url(#card-shadow)">
        <rect x="52" y="190" width="80" height="56" rx="10" fill="white" />
        <rect x="62" y="200" width="24" height="24" rx="6" fill="#D1FAE5" />
        <path d="M69 218 L74 210 L79 214 L82 206" stroke="#059669" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
        <rect x="92" y="204" width="30" height="4" rx="2" fill="#E5E7EB" />
        <rect x="92" y="214" width="22" height="4" rx="2" fill="#F3F4F6" />
        <rect x="62" y="232" width="60" height="4" rx="2" fill="#F3F4F6" />
      </g>

      {/* Card 4 — People/Nominees (bottom-right) */}
      <g filter="url(#card-shadow)">
        <rect x="348" y="180" width="80" height="56" rx="10" fill="white" />
        <rect x="358" y="190" width="24" height="24" rx="6" fill="#EDE9FE" />
        <circle cx="367" cy="198" r="4" fill="#7C3AED" />
        <circle cx="373" cy="198" r="4" fill="#7C3AED" opacity="0.6" />
        <rect x="364" y="205" width="8" height="6" rx="2" fill="#7C3AED" opacity="0.4" />
        <rect x="388" y="194" width="30" height="4" rx="2" fill="#E5E7EB" />
        <rect x="388" y="204" width="22" height="4" rx="2" fill="#F3F4F6" />
        <rect x="358" y="222" width="60" height="4" rx="2" fill="#F3F4F6" />
      </g>

      {/* ─── Connection lines (dashed) ─── */}
      <g stroke="#CBD5E1" strokeWidth="1.5" strokeDasharray="4 4" opacity="0.6">
        <path d="M148 98 Q180 100 185 120" fill="none" />
        <path d="M332 83 Q305 100 295 120" fill="none" />
        <path d="M132 218 Q165 210 185 195" fill="none" />
        <path d="M348 208 Q320 200 295 195" fill="none" />
      </g>

      {/* Small connecting dots at line endpoints */}
      <g fill="#2563EB">
        <circle cx="148" cy="98" r="3" opacity="0.5" />
        <circle cx="332" cy="83" r="3" opacity="0.5" />
        <circle cx="132" cy="218" r="3" opacity="0.5" />
        <circle cx="348" cy="208" r="3" opacity="0.5" />
      </g>

      {/* ─── Bottom text area indicator ─── */}
      <g opacity="0.4">
        <circle cx="220" cy="300" r="3" fill="#2563EB" />
        <circle cx="240" cy="300" r="3" fill="#2563EB" opacity="0.6" />
        <circle cx="260" cy="300" r="3" fill="#2563EB" opacity="0.3" />
      </g>
    </svg>
  );
}
