// src/components/HowItWorks.tsx
// Marketing design deliverable — Sales & Marketing → Tech handoff (2026-05-03)
// Ref: docs/marketing/how-it-works-infographic.html | DECISIONS.md 2026-05-02

const steps = [
  {
    number: 1,
    title: "Create your vault",
    subtitle: "Set up your profile in minutes",
    icon: (
      <svg viewBox="0 0 36 36" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" style={{ width: 36, height: 36 }}>
        <path d="M18 4 L30 9 L30 20 C30 27 18 32 18 32 C18 32 6 27 6 20 L6 9 Z" />
        <circle cx="18" cy="18" r="4" />
        <line x1="18" y1="22" x2="18" y2="26" />
      </svg>
    ),
    green: false,
  },
  {
    number: 2,
    title: "Add every asset",
    subtitle: "Bank accounts, insurance, FDs, property and more",
    icon: (
      <svg viewBox="0 0 36 36" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" style={{ width: 36, height: 36 }}>
        <rect x="8" y="10" width="16" height="20" rx="2" />
        <path d="M12 10 V8 C12 6.9 12.9 6 14 6 H24 C25.1 6 26 6.9 26 8 V24 C26 25.1 25.1 26 24 26 H24" />
        <line x1="12" y1="17" x2="20" y2="17" />
        <line x1="12" y1="21" x2="18" y2="21" />
      </svg>
    ),
    green: false,
  },
  {
    number: 3,
    title: "Link your nominees",
    subtitle: "Assign the right person to each asset",
    icon: (
      <svg viewBox="0 0 36 36" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" style={{ width: 36, height: 36 }}>
        <circle cx="13" cy="12" r="4" />
        <path d="M5 28 C5 23 8.6 20 13 20" />
        <rect x="20" y="20" width="6" height="6" rx="1.5" />
        <rect x="26" y="14" width="6" height="6" rx="1.5" />
        <line x1="23" y1="23" x2="29" y2="17" />
      </svg>
    ),
    green: false,
  },
  {
    number: 4,
    title: "Add a trusted contact",
    subtitle: "Someone you trust to act on your behalf",
    icon: (
      <svg viewBox="0 0 36 36" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" style={{ width: 36, height: 36 }}>
        <circle cx="16" cy="12" r="5" />
        <path d="M6 30 C6 24 10.5 20 16 20" />
        <circle cx="26" cy="24" r="6" />
        <path d="M23 24 L25 26 L29 22" />
      </svg>
    ),
    green: false,
  },
  {
    number: 5,
    title: "Export your vault dossier",
    subtitle: "A complete record your family can refer to anytime",
    icon: (
      <svg viewBox="0 0 36 36" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" style={{ width: 36, height: 36 }}>
        <rect x="8" y="4" width="20" height="26" rx="2" />
        <line x1="13" y1="12" x2="23" y2="12" />
        <line x1="13" y1="17" x2="23" y2="17" />
        <line x1="13" y1="22" x2="19" y2="22" />
        <path d="M22 24 L22 32 M19 29 L22 32 L25 29" />
      </svg>
    ),
    green: false,
  },
  {
    number: 6,
    title: "Your family is never left guessing",
    subtitle: "If the unexpected happens, your trusted contact gets access — instantly",
    icon: (
      <svg viewBox="0 0 36 36" fill="none" stroke="#16A34A" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" style={{ width: 36, height: 36 }}>
        <circle cx="12" cy="10" r="4" />
        <circle cx="24" cy="10" r="4" />
        <circle cx="18" cy="14" r="3" />
        <path d="M4 30 C4 24 7.6 21 12 21" />
        <path d="M32 30 C32 24 28.4 21 24 21" />
        <path d="M11 30 C11 26 14 24 18 24 C22 24 25 26 25 30" />
      </svg>
    ),
    green: true,
  },
];

export default function HowItWorks() {
  return (
    <>
      <style>{`
        .hiw-step-badge {
          width: 80px; height: 80px; border-radius: 50%;
          background: white; border: 2.5px solid #DBEAFE;
          display: flex; align-items: center; justify-content: center;
          box-shadow: 0 4px 16px rgba(37,99,235,0.10);
          transition: border-color 0.2s, box-shadow 0.2s;
          flex-shrink: 0; margin-bottom: 20px;
        }
        .hiw-step:hover .hiw-step-badge {
          border-color: #2563EB;
          box-shadow: 0 6px 24px rgba(37,99,235,0.18);
        }
        .hiw-step-badge.green { border-color: #BBF7D0; background: #F0FDF4; }
        .hiw-steps-grid {
          display: grid;
          grid-template-columns: repeat(6, 1fr);
          gap: 0;
          position: relative;
          max-width: 1100px;
          margin: 0 auto;
        }
        .hiw-steps-grid::before {
          content: '';
          position: absolute;
          top: 40px;
          left: calc(100% / 12);
          right: calc(100% / 12);
          height: 2px;
          background: linear-gradient(90deg, #DBEAFE 0%, #2563EB 50%, #DBEAFE 100%);
          z-index: 0;
        }
        @media (max-width: 768px) {
          .hiw-steps-grid {
            grid-template-columns: 1fr;
          }
          .hiw-steps-grid::before {
            top: 0; bottom: 0; left: 39px; right: auto;
            width: 2px; height: auto;
            background: linear-gradient(180deg, #DBEAFE 0%, #2563EB 50%, #DBEAFE 100%);
          }
          .hiw-step {
            flex-direction: row !important;
            align-items: flex-start !important;
            gap: 20px;
            padding-bottom: 36px;
            text-align: left !important;
          }
          .hiw-step-badge { margin-bottom: 0; }
          .hiw-step-title, .hiw-step-subtitle { text-align: left !important; }
          .hiw-step-text { padding-top: 10px; }
        }
      `}</style>

      <section className="border-t border-gray-100 bg-white px-6 py-16">
        <div style={{ maxWidth: 1100, margin: "0 auto" }}>
          <p className="text-center text-xs font-semibold tracking-widest uppercase text-blue-600 mb-2">
            Simple by design
          </p>
          <h2 className="text-center text-2xl font-bold text-gray-900 mb-3">
            How KutumbKosh Works
          </h2>
          <p className="text-center text-sm text-gray-500 mb-12" style={{ maxWidth: 520, margin: "0 auto 3rem" }}>
            Set up once. Your family stays informed — always.
          </p>

          <div className="hiw-steps-grid">
            {steps.map((step) => (
              <div
                key={step.number}
                className="hiw-step"
                style={{ display: "flex", flexDirection: "column", alignItems: "center", padding: "0 10px", position: "relative", zIndex: 1, textAlign: "center" }}
              >
                <div className={`hiw-step-badge${step.green ? " green" : ""}`}>
                  <div style={{ position: "relative", width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <div style={{
                      position: "absolute", top: -6, right: -6,
                      width: 24, height: 24,
                      background: step.green ? "#16A34A" : "#2563EB",
                      color: "white", borderRadius: "50%",
                      fontSize: 11, fontWeight: 700,
                      display: "flex", alignItems: "center", justifyContent: "center",
                      border: "2px solid white",
                      fontFamily: "Poppins, sans-serif",
                    }}>
                      {step.number}
                    </div>
                    <div style={{ color: step.green ? "#16A34A" : "#2563EB" }}>
                      {step.icon}
                    </div>
                  </div>
                </div>
                <div className="hiw-step-text">
                  <p style={{ fontSize: 13, fontWeight: 700, color: "#111827", textAlign: "center", lineHeight: 1.35, marginBottom: 6 }}>
                    {step.title}
                  </p>
                  <p style={{ fontSize: 11.5, fontWeight: 400, color: "#6B7280", textAlign: "center", lineHeight: 1.5 }}>
                    {step.subtitle}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
