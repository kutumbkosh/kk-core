export default function VaultIllustration() {
  return (
    <svg viewBox="0 0 200 180" className="w-full h-full" fill="none" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="vault-grad" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#1E40AF" />
          <stop offset="100%" stopColor="#1D4ED8" />
        </linearGradient>
        <filter id="vault-shadow">
          <feDropShadow dx="0" dy="3" stdDeviation="6" floodColor="#1E40AF" floodOpacity="0.2" />
        </filter>
        <filter id="vault-card-shadow">
          <feDropShadow dx="0" dy="1" stdDeviation="2" floodColor="#000" floodOpacity="0.06" />
        </filter>
      </defs>

      {/* Background glow */}
      <circle cx="100" cy="90" r="70" fill="#EFF6FF" />

      {/* Vault body */}
      <g filter="url(#vault-shadow)">
        <rect x="50" y="35" width="100" height="110" rx="12" fill="url(#vault-grad)" />
        {/* Inner panel */}
        <rect x="58" y="43" width="84" height="94" rx="8" fill="white" fillOpacity="0.08" />
      </g>

      {/* Vault dial */}
      <circle cx="100" cy="85" r="24" fill="none" stroke="white" strokeWidth="2" strokeOpacity="0.3" />
      <circle cx="100" cy="85" r="18" fill="none" stroke="white" strokeWidth="1.5" strokeOpacity="0.2" />
      <circle cx="100" cy="85" r="5" fill="white" fillOpacity="0.9" />

      {/* Dial tick marks */}
      <g stroke="white" strokeWidth="2" strokeLinecap="round" opacity="0.4">
        <line x1="100" y1="62" x2="100" y2="67" />
        <line x1="123" y1="85" x2="118" y2="85" />
        <line x1="100" y1="108" x2="100" y2="103" />
        <line x1="77" y1="85" x2="82" y2="85" />
      </g>

      {/* Dial pointer */}
      <line x1="100" y1="85" x2="100" y2="68" stroke="white" strokeWidth="2.5" strokeLinecap="round" opacity="0.8" />

      {/* Handle bar */}
      <rect x="130" y="78" width="10" height="14" rx="3" fill="white" fillOpacity="0.25" />

      {/* Lock icon at bottom */}
      <g opacity="0.5">
        <rect x="93" y="117" width="14" height="10" rx="2" fill="white" />
        <path d="M96 117 V113 Q96 109 100 109 Q104 109 104 113 V117" stroke="white" strokeWidth="1.5" fill="none" />
        <circle cx="100" cy="122" r="1.5" fill="#1E40AF" />
      </g>

      {/* Floating checkmarks */}
      <g filter="url(#vault-card-shadow)">
        <circle cx="38" cy="58" r="10" fill="white" />
        <path d="M33 58 L37 62 L44 54" stroke="#059669" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      </g>
      <g filter="url(#vault-card-shadow)">
        <circle cx="162" cy="50" r="10" fill="white" />
        <path d="M157 50 L161 54 L168 46" stroke="#059669" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      </g>

      {/* Decorative dots */}
      <circle cx="30" cy="120" r="2" fill="#DBEAFE" />
      <circle cx="175" cy="110" r="2" fill="#DBEAFE" />
    </svg>
  );
}
