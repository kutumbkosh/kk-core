"use client";

import { useRouter } from "next/navigation";
import { ArrowLeft, Shield } from "lucide-react";

export default function TermsOfServicePage() {
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
        <h1 className="text-3xl font-extrabold text-gray-900 mb-2">Terms of Service</h1>
        <p className="text-sm text-gray-400 mb-8">Last updated: August 17, 2026</p>

        <div className="prose prose-sm prose-gray max-w-none space-y-6">
          <section>
            <h2 className="text-lg font-bold text-gray-900 mb-2">1. Acceptance of terms</h2>
            <p className="text-sm text-gray-600 leading-relaxed">
              By accessing or using KutumbKosh (&quot;the Service&quot;), you agree to be bound by these Terms of Service (&quot;Terms&quot;). If you do not agree with any part of these Terms, you must not use the Service. These Terms constitute a legally binding agreement between you and Kutumbkosh Fintech Private Limited (CIN: U62099MR2026PTC477196), a company incorporated under the Companies Act, 2013, with its registered office in Thane, Maharashtra, India (&quot;KutumbKosh&quot;, &quot;we&quot;, &quot;our&quot;, &quot;us&quot;).
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-gray-900 mb-2">2. Description of service</h2>
            <p className="text-sm text-gray-600 leading-relaxed">
              KutumbKosh is a financial information management platform that allows you to organize records of your financial assets, designate nominees, create emergency access instructions, and generate summaries for your family. KutumbKosh is an information management tool only — it does not provide financial advisory services, does not execute transactions, does not hold custody of any financial assets, and does not access your bank accounts or financial institutions directly.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-gray-900 mb-2">3. Eligibility</h2>
            <p className="text-sm text-gray-600 leading-relaxed">
              You must be at least 18 years of age and a resident of India to use the Service. By using KutumbKosh, you represent and warrant that you meet these eligibility requirements and have the legal capacity to enter into a binding agreement.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-gray-900 mb-2">4. Your account</h2>
            <p className="text-sm text-gray-600 leading-relaxed">
              You are responsible for maintaining the security of your email account used for authentication. KutumbKosh uses passwordless magic link authentication. You must not share your login links with anyone. You are responsible for all activity that occurs under your account. Notify us immediately if you suspect unauthorized access at care@kutumbkosh.com.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-gray-900 mb-2">5. Acceptable use</h2>
            <p className="text-sm text-gray-600 leading-relaxed">
              You agree to use KutumbKosh only for lawful purposes and in accordance with these Terms. You must not use the Service to store information related to illegal activities, impersonate another person or misrepresent your identity, attempt to gain unauthorized access to other users&apos; data, reverse-engineer, decompile, or disassemble any part of the Service, or use automated tools to scrape or extract data from the Service.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-gray-900 mb-2">6. Data accuracy</h2>
            <p className="text-sm text-gray-600 leading-relaxed">
              You are solely responsible for the accuracy and completeness of the information you store in KutumbKosh. We do not verify the information you enter against any financial institution or government database. KutumbKosh is a record-keeping tool and does not guarantee that the information stored is current or accurate. You should regularly review and update your vault.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-gray-900 mb-2">7. Subscriptions & payments</h2>
            <p className="text-sm text-gray-600 leading-relaxed">
              KutumbKosh offers a free tier and paid subscription plans. Paid subscriptions are billed through Razorpay in Indian Rupees. Prices are as displayed at the time of purchase and may be updated with 30 days&apos; notice to existing subscribers. Subscriptions auto-renew unless cancelled before the renewal date. Refund requests made within 7 days of purchase will be honored in full. After 7 days, refunds are at our discretion. In the event of cancellation, you retain access to the free tier features and your data is preserved.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-gray-900 mb-2">8. Emergency access feature</h2>
            <p className="text-sm text-gray-600 leading-relaxed">
              The emergency access feature allows you to designate trusted contacts who can request access to a limited summary of your vault. You are solely responsible for choosing your trusted contacts and approving or revoking their access. KutumbKosh is not liable for any actions taken by your trusted contacts with the information shared through this feature. The emergency access feature is provided as a convenience tool and does not constitute legal authorization, power of attorney, or any form of legal instrument.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-gray-900 mb-2">9. Intellectual property</h2>
            <p className="text-sm text-gray-600 leading-relaxed">
              The KutumbKosh name, logo, website design, source code, and all related intellectual property are owned by KutumbKosh. You retain ownership of all data and content you input into the Service. By using the Service, you grant us a limited license to store, process, and display your data solely for the purpose of providing the Service to you.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-gray-900 mb-2">10. Limitation of liability</h2>
            <p className="text-sm text-gray-600 leading-relaxed">
              KutumbKosh is provided &quot;as is&quot; without warranties of any kind, express or implied. To the fullest extent permitted by law, KutumbKosh shall not be liable for any indirect, incidental, consequential, or punitive damages arising from your use of the Service, including but not limited to loss of data, financial loss resulting from reliance on information stored in the Service, or unauthorized access to your account. Our total liability for any claim related to the Service shall not exceed the amount you paid to us in the 12 months preceding the claim, or ₹1,000, whichever is greater.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-gray-900 mb-2">11. Disclaimer</h2>
            <p className="text-sm text-gray-600 leading-relaxed">
              KutumbKosh does not provide financial, legal, or tax advice. The Service is a tool for organizing your financial information and should not be used as a substitute for professional financial planning, legal advice, or estate planning. Consult a qualified financial advisor or legal professional for decisions regarding your financial assets, nominations, and estate planning.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-gray-900 mb-2">12. Termination</h2>
            <p className="text-sm text-gray-600 leading-relaxed">
              We may suspend or terminate your account if you violate these Terms or engage in activity that harms the Service or other users. You may delete your account at any time through the Settings page. Upon termination, your data will be permanently deleted within 30 days, subject to any legal retention requirements.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-gray-900 mb-2">13. Governing law & disputes</h2>
            <p className="text-sm text-gray-600 leading-relaxed">
              These Terms are governed by the laws of India. Any disputes arising from or relating to these Terms or the Service shall be subject to the exclusive jurisdiction of the competent courts in Thane, Maharashtra, India.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-gray-900 mb-2">14. Changes to these terms</h2>
            <p className="text-sm text-gray-600 leading-relaxed">
              We may update these Terms from time to time. Material changes will be communicated via email at least 30 days before they take effect. Your continued use of the Service after changes become effective constitutes acceptance of the updated Terms.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-gray-900 mb-2">15. Contact</h2>
            <p className="text-sm text-gray-600 leading-relaxed">
              For questions about these Terms, contact us at <a href="mailto:care@kutumbkosh.com" className="text-blue-600 hover:underline">care@kutumbkosh.com</a>.
            </p>
          </section>
        </div>

        {/* Footer links */}
        <div className="border-t border-gray-100 mt-10 pt-6 flex items-center justify-center gap-6 text-xs text-gray-400">
          <a href="/security" className="hover:text-gray-600 transition-colors">Trust & Security</a>
          <a href="/privacy" className="hover:text-gray-600 transition-colors">Privacy Policy</a>
        </div>
      </main>
    </div>
  );
}
