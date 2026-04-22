export default function EmergencyIllustration() {
  return (
    <svg viewBox="0 0 220 180" className="w-full h-full" fill="none" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="emerg-grad" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#FEF3C7" />
          <stop offset="100%" stopColor="#FDE68A" />
        </linearGradient>
        <filter id="emerg-shadow">
          <feDropShadow dx="0" dy="2" stdDeviation="3" floodColor="#000" floodOpacity="0.06" />
        </filter>
      </defs>

      {/* Background */}
      <circle cx="110" cy="85" r="70" fill="url(#emerg-grad)" opacity="0.5" />

      {/* Document / dossier */}
      <g filter="url(#emerg-shadow)">
        <rect x="60" y="30" width="100" height="120" rx="8" fill="white" />
        {/* Header bar */}
        <rect x="60" y="30" width="100" height="24" rx="8" fill="#2563EB" />
        <rect x="60" y="46" width="100" height="8" fill="#2563EB" />
        {/* Shield icon in header */}
        <path d="M110 36 L118 39 V47 C118 52 110 56 110 56 C110 56 102 52 102 47 V39 L110 36Z" fill="white" fillOpacity="0.9" />
      </g>

      {/* Document content lines */}
      <rect x="74" y="66" width="40" height="3" rx="1.5" fill="#E5E7EB" />
      <rect x="74" y="76" width="72" height="3" rx="1.5" fill="#F3F4F6" />
      <rect x="74" y="86" width="60" height="3" rx="1.5" fill="#F3F4F6" />
      <rect x="74" y="96" width="52" height="3" rx="1.5" fill="#F3F4F6" />

      {/* Checklist items */}
      <g>
        <rect x="74" y="110" width="8" height="8" rx="2" fill="#D1FAE5" />
        <path d="M76 114.5 L77.5 116 L80 113" stroke="#059669" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
        <rect x="86" y="112" width="32" height="3" rx="1.5" fill="#E5E7EB" />

        <rect x="74" y="124" width="8" height="8" rx="2" fill="#D1FAE5" />
        <path d="M76 128.5 L77.5 130 L80 127" stroke="#059669" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
        <rect x="86" y="126" width="40" height="3" rx="1.5" fill="#E5E7EB" />
      </g>

      {/* Bell notification badge */}
      <g filter="url(#emerg-shadow)">
        <circle cx="155" cy="42" r="14" fill="white" />
        <path d="M155 35 L155 35" stroke="#D97706" strokeWidth="1.5" />
        <path d="M149 42 Q149 36 155 36 Q161 36 161 42 L162 46 L148 46 Z" fill="#D97706" />
        <rect x="149" y="46" width="12" height="1.5" rx="0.75" fill="#D97706" />
        <circle cx="155" cy="34" r="1.5" fill="#D97706" />
      </g>

      {/* Key icon */}
      <g filter="url(#emerg-shadow)">
        <circle cx="45" cy="105" r="12" fill="white" />
        <circle cx="43" cy="103" r="4" fill="none" stroke="#2563EB" strokeWidth="1.5" />
        <line x1="46" y1="106" x2="51" y2="111" stroke="#2563EB" strokeWidth="1.5" strokeLinecap="round" />
        <line x1="49" y1="109" x2="51" y2="107" stroke="#2563EB" strokeWidth="1.5" strokeLinecap="round" />
      </g>

      {/* Decorative dots */}
      <circle cx="25" cy="60" r="2" fill="#DBEAFE" />
      <circle cx="195" cy="90" r="2" fill="#DBEAFE" />
      <circle cx="180" cy="140" r="2.5" fill="#FDE68A" />
    </svg>
  );
}
