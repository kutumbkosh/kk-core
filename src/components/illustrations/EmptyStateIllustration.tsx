export default function EmptyStateIllustration() {
  return (
    <svg viewBox="0 0 200 180" className="w-full h-full" fill="none" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="empty-grad" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#EFF6FF" />
          <stop offset="100%" stopColor="#DBEAFE" />
        </linearGradient>
        <filter id="empty-shadow">
          <feDropShadow dx="0" dy="2" stdDeviation="4" floodColor="#000" floodOpacity="0.06" />
        </filter>
      </defs>

      {/* Background circle */}
      <circle cx="100" cy="85" r="65" fill="url(#empty-grad)" />

      {/* Folder base */}
      <g filter="url(#empty-shadow)">
        <path d="M55 60 L55 45 Q55 40 60 40 L85 40 L92 50 L145 50 Q150 50 150 55 L150 120 Q150 125 145 125 L60 125 Q55 125 55 120 Z" fill="white" />
        {/* Folder tab */}
        <path d="M55 45 Q55 40 60 40 L85 40 L92 50 L55 50 Z" fill="#E5E7EB" />
      </g>

      {/* Document lines inside folder */}
      <rect x="72" y="68" width="56" height="3" rx="1.5" fill="#E5E7EB" />
      <rect x="72" y="78" width="42" height="3" rx="1.5" fill="#F3F4F6" />
      <rect x="72" y="88" width="50" height="3" rx="1.5" fill="#F3F4F6" />
      <rect x="72" y="98" width="32" height="3" rx="1.5" fill="#F3F4F6" />

      {/* Plus circle */}
      <g filter="url(#empty-shadow)">
        <circle cx="140" cy="38" r="18" fill="#2563EB" />
        <line x1="140" y1="29" x2="140" y2="47" stroke="white" strokeWidth="2.5" strokeLinecap="round" />
        <line x1="131" y1="38" x2="149" y2="38" stroke="white" strokeWidth="2.5" strokeLinecap="round" />
      </g>

      {/* Decorative dots */}
      <circle cx="35" cy="70" r="2.5" fill="#DBEAFE" />
      <circle cx="170" cy="100" r="2" fill="#DBEAFE" />
      <circle cx="45" cy="130" r="2" fill="#E5E7EB" />

      {/* Bottom arrow hint */}
      <g opacity="0.3">
        <path d="M100 145 L100 162" stroke="#2563EB" strokeWidth="2" strokeLinecap="round" />
        <path d="M94 157 L100 163 L106 157" stroke="#2563EB" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      </g>
    </svg>
  );
}
