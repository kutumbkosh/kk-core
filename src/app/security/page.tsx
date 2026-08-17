"use client";

import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  Shield,
  Lock,
  Eye,
  EyeOff,
  Server,
  Key,
  FileCheck,
  AlertTriangle,
  CheckCircle2,
  Database,
  Globe,
  Fingerprint,
  ShieldCheck,
} from "lucide-react";

const securityFeatures = [
  {
    icon: Lock,
    title: "Encryption at Rest & in Transit",
    description:
      "All data is encrypted using AES-256 encryption at rest. Data in transit is protected with TLS 1.3. Your financial information is never stored in plain text.",
    color: "text-blue-600",
    bg: "bg-blue-50",
  },
  {
    icon: Key,
    title: "Passwordless Authentication",
    description:
      "We use magic link authentication — no passwords to steal, no credentials to leak. Each login link expires in 1 hour and works only once.",
    color: "text-emerald-600",
    bg: "bg-emerald-50",
  },
  {
    icon: EyeOff,
    title: "Partial Data Only",
    description:
      "We never ask for or store full account numbers, passwords, or PINs. Only the last 4 digits of identifiers are kept — just enough for your family to identify the account.",
    color: "text-violet-600",
    bg: "bg-violet-50",
  },
  {
    icon: Database,
    title: "Row-Level Security",
    description:
      "Every database query is enforced with row-level security policies. Your data is cryptographically isolated — even in the event of a breach, other users' data cannot be accessed through your session.",
    color: "text-amber-600",
    bg: "bg-amber-50",
  },
  {
    icon: Server,
    title: "Hosted on Trusted Infrastructure",
    description:
      "KutumbKosh runs on Supabase (PostgreSQL) and Vercel, both SOC 2 Type II certified platforms. Your data resides in secure, managed infrastructure with automated backups.",
    color: "text-cyan-600",
    bg: "bg-cyan-50",
  },
  {
    icon: Fingerprint,
    title: "Audit Logging",
    description:
      "Every access to your vault — every login, every data view, every modification — is logged with timestamps and device information. You can review your activity history at any time.",
    color: "text-rose-600",
    bg: "bg-rose-50",
  },
  {
    icon: Globe,
    title: "Security Headers",
    description:
      "Our application enforces strict Content Security Policy, HSTS, X-Frame-Options, and other HTTP security headers to prevent XSS, clickjacking, and code injection attacks.",
    color: "text-indigo-600",
    bg: "bg-indigo-50",
  },
  {
    icon: ShieldCheck,
    title: "Designed with Privacy in Mind",
    description:
      "KutumbKosh is designed with India's Digital Personal Data Protection Act (DPDPA) 2023 in mind. We collect only what's necessary, you can delete your data at any time, and formal compliance verification is in progress.",
    color: "text-green-600",
    bg: "bg-green-50",
  },
];

const dataHandling = [
  { label: "Full account numbers", stored: false },
  { label: "Passwords or PINs", stored: false },
  { label: "Transaction history", stored: false },
  { label: "Card CVV or expiry", stored: false },
  { label: "Aadhaar number", stored: false },
  { label: "Last 4 digits of identifiers", stored: true },
  { label: "Institution names", stored: true },
  { label: "Nominee names & relations", stored: true },
  { label: "Approximate value range", stored: true },
  { label: "Your emergency instructions", stored: true },
];

export default function SecurityPage() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-white">
      <header className="bg-white border-b border-gray-100 sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-6 py-4 flex items-center gap-3">
          <button
            onClick={() => router.back()}
            className="p-2 -ml-2 rounded-lg hover:bg-gray-100 transition-colors"
          >
            <ArrowLeft className="w-5 h-5 text-gray-600" />
          </button>
          <div className="flex items-center gap-2.5 flex-1">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
              <Shield className="w-4 h-4 text-white" />
            </div>
            <span className="text-lg font-bold text-gray-900">KutumbKosh</span>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-6 py-10">
        {/* Hero */}
        <div className="text-center mb-12">
          <div className="w-16 h-16 bg-blue-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Shield className="w-8 h-8 text-blue-600" />
          </div>
          <h1 className="text-3xl font-extrabold text-gray-900 mb-3">
            Trust & Security
          </h1>
          <p className="text-gray-500 max-w-lg mx-auto leading-relaxed">
            Your financial information is the most sensitive data you have.
            Here&apos;s exactly how we protect it — no vague promises, just
            specifics.
          </p>
        </div>

        {/* Security Features Grid */}
        <div className="grid md:grid-cols-2 gap-5 mb-14">
          {securityFeatures.map((feature) => (
            <div
              key={feature.title}
              className="p-5 rounded-xl border border-gray-200 hover:border-gray-300 transition-colors"
            >
              <div className="flex items-start gap-4">
                <div
                  className={`w-10 h-10 ${feature.bg} rounded-lg flex items-center justify-center flex-shrink-0`}
                >
                  <feature.icon className={`w-5 h-5 ${feature.color}`} />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-gray-900 mb-1">
                    {feature.title}
                  </h3>
                  <p className="text-sm text-gray-500 leading-relaxed">
                    {feature.description}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* What we store vs don't */}
        <div className="mb-14">
          <h2 className="text-xl font-bold text-gray-900 mb-2 text-center">
            What we store vs. what we don&apos;t
          </h2>
          <p className="text-sm text-gray-500 text-center mb-6">
            Transparency is non-negotiable. Here&apos;s the full picture.
          </p>
          <div className="max-w-xl mx-auto">
            <div className="divide-y divide-gray-100 border border-gray-200 rounded-xl overflow-hidden">
              {dataHandling.map((item) => (
                <div
                  key={item.label}
                  className="flex items-center gap-3 px-5 py-3"
                >
                  {item.stored ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-500 flex-shrink-0" />
                  ) : (
                    <Eye className="w-4 h-4 text-red-400 flex-shrink-0" />
                  )}
                  <span
                    className={`text-sm flex-1 ${item.stored ? "text-gray-700" : "text-gray-400 line-through"}`}
                  >
                    {item.label}
                  </span>
                  <span
                    className={`text-xs font-semibold px-2 py-0.5 rounded ${
                      item.stored
                        ? "bg-emerald-50 text-emerald-700"
                        : "bg-red-50 text-red-600"
                    }`}
                  >
                    {item.stored ? "Stored" : "Never stored"}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Emergency Access Safeguards */}
        <div className="mb-14">
          <h2 className="text-xl font-bold text-gray-900 mb-2 text-center">
            Emergency access safeguards
          </h2>
          <p className="text-sm text-gray-500 text-center mb-6">
            When a trusted contact requests access, here&apos;s what happens.
          </p>
          <div className="max-w-xl mx-auto space-y-3">
            {[
              "Trusted contacts must be explicitly added and approved by you",
              "They can only request access — you must approve every request",
              "They see asset names and last 4 digits only, never full details",
              "No passwords, PINs, or login credentials are ever shared",
              "Access can be revoked instantly at any time",
              "All access events are logged in your audit trail",
            ].map((point) => (
              <div key={point} className="flex items-start gap-3">
                <CheckCircle2 className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
                <p className="text-sm text-gray-700">{point}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Internal Access Controls */}
        <div className="mb-14">
          <h2 className="text-xl font-bold text-gray-900 mb-2 text-center">
            Internal access controls
          </h2>
          <p className="text-sm text-gray-500 text-center mb-6">
            How we protect your data from within.
          </p>
          <div className="max-w-xl mx-auto p-5 bg-blue-50 border border-blue-100 rounded-xl space-y-3">
            {[
              "No team member has routine access to your vault contents",
              "Access to production user data requires explicit founder approval",
              "Every admin database operation is logged with timestamp and reason",
              "The service role key (which bypasses row-level security) is restricted to a single, audited function: account deletion",
              "All admin access events are retained in an audit log for review",
            ].map((point) => (
              <div key={point} className="flex items-start gap-3">
                <CheckCircle2 className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
                <p className="text-sm text-gray-700">{point}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Responsible Disclosure */}
        <div className="p-6 bg-amber-50 border border-amber-200 rounded-xl mb-10">
          <div className="flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
            <div>
              <h3 className="text-sm font-bold text-gray-900 mb-1">
                Found a vulnerability?
              </h3>
              <p className="text-sm text-gray-600 leading-relaxed">
                We take security reports seriously. If you&apos;ve found a
                security issue, please email us at{" "}
                <a
                  href="mailto:care@kutumbkosh.com"
                  className="text-blue-600 font-medium hover:underline"
                >
                  care@kutumbkosh.com
                </a>{" "}
                and we&apos;ll respond within 24 hours. We appreciate
                responsible disclosure and will acknowledge your contribution.
              </p>
            </div>
          </div>
        </div>

        {/* Certifications & Compliance */}
        <div className="text-center pb-10">
          <h2 className="text-xl font-bold text-gray-900 mb-4">
            Compliance & standards
          </h2>
          <div className="flex items-center justify-center gap-6 flex-wrap">
            {[
              { label: "Indian Privacy Standards", icon: FileCheck },
              { label: "SOC 2 Infra", icon: Server },
              { label: "TLS 1.3", icon: Lock },
              { label: "AES-256", icon: Key },
            ].map((badge) => (
              <div
                key={badge.label}
                className="flex items-center gap-2 px-4 py-2 bg-gray-50 rounded-lg border border-gray-200"
              >
                <badge.icon className="w-4 h-4 text-gray-500" />
                <span className="text-xs font-semibold text-gray-700">
                  {badge.label}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Footer links */}
        <div className="border-t border-gray-100 pt-6 flex items-center justify-center gap-6 text-xs text-gray-400 flex-wrap">
          <a href="/privacy" className="hover:text-gray-600 transition-colors">
            Privacy Policy
          </a>
          <a href="/terms" className="hover:text-gray-600 transition-colors">
            Terms of Service
          </a>
          <a href="/grievance" className="hover:text-gray-600 transition-colors">
            Grievance Officer
          </a>
          <a
            href="mailto:care@kutumbkosh.com"
            className="hover:text-gray-600 transition-colors"
          >
            Report a Vulnerability
          </a>
        </div>
      </main>
    </div>
  );
}
