"use client";

import { useRouter } from "next/navigation";
import { ArrowLeft, Shield } from "lucide-react";

export default function PrivacyPolicyPage() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-white">
      <header className="bg-white border-b border-gray-100 sticky top-0 z-10">
        <div className="max-w-3xl mx-auto px-6 py-4 flex items-center gap-3">
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

      <main className="max-w-3xl mx-auto px-6 py-10">
        <h1 className="text-3xl font-extrabold text-gray-900 mb-2">Privacy Policy</h1>
        <p className="text-sm text-gray-400 mb-8">Last updated: March 31, 2026</p>

        <div className="prose prose-sm prose-gray max-w-none space-y-6">
          <section>
            <h2 className="text-lg font-bold text-gray-900 mb-2">1. Who we are</h2>
            <p className="text-sm text-gray-600 leading-relaxed">
              KutumbKosh (&quot;we&quot;, &quot;our&quot;, &quot;us&quot;) is a financial information management platform that helps Indian families organize, track, and secure their financial asset information and nominee details. KutumbKosh is operated by its founding team based in India. This Privacy Policy explains how we collect, use, store, and protect your personal data in accordance with the Digital Personal Data Protection Act, 2023 (DPDPA) and applicable Indian laws.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-gray-900 mb-2">2. Data we collect</h2>
            <p className="text-sm text-gray-600 leading-relaxed mb-3">
              We collect only the minimum data necessary to provide our service:
            </p>
            <p className="text-sm text-gray-600 leading-relaxed">
              <strong>Account information:</strong> Email address (used for authentication via magic link), full name, phone number (optional), date of birth (optional), and PAN number (optional, for nominee verification only).
            </p>
            <p className="text-sm text-gray-600 leading-relaxed">
              <strong>Financial asset identifiers:</strong> Institution names, asset types, last 4 digits of account numbers only (never full account numbers), approximate value ranges, and your personal notes. We never collect passwords, PINs, CVVs, full account numbers, transaction details, or Aadhaar numbers.
            </p>
            <p className="text-sm text-gray-600 leading-relaxed">
              <strong>Nominee information:</strong> Names, relationships, contact numbers, dates of birth, and PAN numbers of your designated nominees.
            </p>
            <p className="text-sm text-gray-600 leading-relaxed">
              <strong>Usage data:</strong> Login timestamps, device information, and IP addresses for security and audit logging purposes.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-gray-900 mb-2">3. How we use your data</h2>
            <p className="text-sm text-gray-600 leading-relaxed">
              Your data is used solely to provide the KutumbKosh service: organizing your financial asset information, managing nominee mappings, generating reminders for gaps or expiries, enabling emergency access for your trusted contacts, and creating PDF exports of your vault. We do not sell, rent, or share your personal data with any third parties for marketing or advertising purposes.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-gray-900 mb-2">4. Data storage & security</h2>
            <p className="text-sm text-gray-600 leading-relaxed">
              All data is stored in a PostgreSQL database hosted on Supabase, which maintains SOC 2 Type II certification. Data is encrypted at rest using AES-256 and in transit using TLS 1.3. Every database table is protected by row-level security (RLS) policies — your data is cryptographically isolated and accessible only through your authenticated session. Backups are automated and encrypted. For full security details, visit our <a href="/security" className="text-blue-600 hover:underline">Trust & Security</a> page.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-gray-900 mb-2">5. Third-party services</h2>
            <p className="text-sm text-gray-600 leading-relaxed">
              We use the following third-party services, all of which maintain industry-standard security certifications: Supabase (database and authentication), Vercel (application hosting), and Razorpay (payment processing for Pro subscriptions). Razorpay handles all payment data directly — we never see or store your card numbers, UPI IDs, or banking credentials. Each third party processes data in accordance with their own privacy policies and is contractually bound to protect your data.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-gray-900 mb-2">6. Your rights under DPDPA</h2>
            <p className="text-sm text-gray-600 leading-relaxed">
              Under the Digital Personal Data Protection Act, 2023, you have the right to access all personal data we hold about you, correct inaccurate data at any time through your Settings page, delete your account and all associated data permanently, withdraw consent for data processing (which may require account deletion), and receive information about how your data is being processed. To exercise any of these rights, contact us at care@kutumbkosh.com or use the account deletion feature in Settings.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-gray-900 mb-2">7. Emergency access & data sharing</h2>
            <p className="text-sm text-gray-600 leading-relaxed">
              Your trusted contacts can only view a limited summary of your vault (institution names, last 4 digits, nominee details, and your emergency instructions) after you explicitly approve their access request. Full account numbers, passwords, and sensitive credentials are never shared. You can revoke any trusted contact&apos;s access instantly at any time.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-gray-900 mb-2">8. Data retention</h2>
            <p className="text-sm text-gray-600 leading-relaxed">
              We retain your data for as long as your account is active. If you delete your account, all personal data is permanently deleted within 30 days, except where retention is required by applicable Indian law. Audit logs are retained for 1 year for security purposes and then permanently deleted.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-gray-900 mb-2">9. Cookies & tracking</h2>
            <p className="text-sm text-gray-600 leading-relaxed">
              KutumbKosh uses only essential cookies required for authentication and session management. We do not use advertising cookies, tracking pixels, or any third-party analytics that profile your behavior. We do not share any data with ad networks.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-gray-900 mb-2">10. Changes to this policy</h2>
            <p className="text-sm text-gray-600 leading-relaxed">
              We may update this Privacy Policy from time to time. Significant changes will be communicated via email to all registered users. The &quot;Last updated&quot; date at the top reflects the most recent revision.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-gray-900 mb-2">11. Contact us</h2>
            <p className="text-sm text-gray-600 leading-relaxed">
              For privacy-related concerns or to exercise your data rights, contact us at <a href="mailto:privacy@kutumbkosh.in" className="text-blue-600 hover:underline">privacy@kutumbkosh.in</a>.
            </p>
          </section>
        </div>

        {/* Footer links */}
        <div className="border-t border-gray-100 mt-10 pt-6 flex items-center justify-center gap-6 text-xs text-gray-400">
          <a href="/security" className="hover:text-gray-600 transition-colors">Trust & Security</a>
          <a href="/terms" className="hover:text-gray-600 transition-colors">Terms of Service</a>
        </div>
      </main>
    </div>
  );
}
  