export default function NomineesIllustration() {
  return (
    <svg viewBox="0 0 240 200" className="w-full h-full" fill="none" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="nom-grad" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#F0FDF4" />
          <stop offset="100%" stopColor="#DCFCE7" />
        </linearGradient>
        <filter id="nom-shadow">
          <feDropShadow dx="0" dy="2" stdDeviation="3" floodColor="#000" floodOpacity="0.06" />
        </filter>
      </defs>

      {/* Background */}
      <circle cx="120" cy="95" r="75" fill="url(#nom-grad)" />

      {/* Center node — main person */}
      <g filter="url(#nom-shadow)">
        <circle cx="120" cy="85" r="28" fill="white" />
        <circle cx="120" cy="78" r="10" fill="#2563EB" />
        <path d="M104 95 Q104 88 112 88 L128 88 Q136 88 136 95 L136 100 Q136 104 132 104 L108 104 Q104 104 104 100 Z" fill="#2563EB" opacity="0.3" />
      </g>

      {/* Left node — nominee 1 */}
      <g filter="url(#nom-shadow)">
        <circle cx="48" cy="115" r="20" fill="white" />
        <circle cx="48" cy="110" r="7" fill="#059669" />
        <path d="M37 122 Q37 117 42 117 L54 117 Q59 117 59 122 L59 125 Q59 128 56 128 L40 128 Q37 128 37 125 Z" fill="#059669" opacity="0.3" />
      </g>

      {/* Right node — nominee 2 */}
      <g filter="url(#nom-shadow)">
        <circle cx="192" cy="115" r="20" fill="white" />
        <circle cx="192" cy="110" r="7" fill="#059669" />
        <path d="M181 122 Q181 117 186 117 L198 117 Q203 117 203 122 L203 125 Q203 128 200 128 L184 128 Q181 128 181 125 Z" fill="#059669" opacity="0.3" />
      </g>

      {/* Bottom node — nominee 3 */}
      <g filter="url(#nom-shadow)">
        <circle cx="120" cy="160" r="20" fill="white" />
        <circle cx="120" cy="155" r="7" fill="#7C3AED" />
        <path d="M109 167 Q109 162 114 162 L126 162 Q131 162 131 167 L131 170 Q131 173 128 173 L112 173 Q109 173 109 170 Z" fill="#7C3AED" opacity="0.3" />
      </g>

      {/* Connection lines */}
      <g stroke="#CBD5E1" strokeWidth="1.5" strokeDasharray="4 3">
        <line x1="95" y1="95" x2="66" y2="105" />
        <line x1="145" y1="95" x2="174" y2="105" />
        <line x1="120" y1="113" x2="120" y2="140" />
      </g>

      {/* Connection dots */}
      <g fill="#2563EB" opacity="0.5">
        <circle cx="95" cy="95" r="2.5" />
        <circle cx="145" cy="95" r="2.5" />
        <circle cx="120" cy="113" r="2.5" />
      </g>

      {/* Small asset icons floating */}
      <g opacity="0.2">
        <rect x="20" y="55" width="16" height="12" rx="2" fill="#2563EB" />
        <rect x="204" y="60" width="16" height="12" rx="2" fill="#2563EB" />
        <rect x="165" y="165" width="16" height="12" rx="2" fill="#2563EB" />
      </g>
    </svg>
  );
}
