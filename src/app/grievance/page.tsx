"use client";

import { useRouter } from "next/navigation";
import { ArrowLeft, Shield, MessageSquare, Clock, CheckCircle } from "lucide-react";

export default function GrievancePage() {
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

        {/* Heading */}
        <h1 className="text-3xl font-extrabold text-gray-900 mb-2">Grievance Redressal</h1>
        <p className="text-sm text-gray-400 mb-8">
          As required under Section 13 of the Digital Personal Data Protection Act, 2023
        </p>

        {/* Grievance Officer Card */}
        <div className="bg-blue-50 border border-blue-100 rounded-2xl p-6 mb-8">
          <div className="flex items-start gap-4">
            <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center flex-shrink-0">
              <MessageSquare className="w-5 h-5 text-white" />
            </div>
            <div>
              <p className="text-sm font-semibold text-gray-900 mb-0.5">Grievance Officer</p>
              <p className="text-sm text-gray-700 mb-0.5">Shubham, Founder — KutumbKosh</p>
              <a
                href="mailto:care@kutumbkosh.com"
                className="text-sm text-blue-600 hover:underline font-medium"
              >
                care@kutumbkosh.com
              </a>
            </div>
          </div>
        </div>

        {/* How it works */}
        <div className="mb-8">
          <h2 className="text-base font-bold text-gray-900 mb-4">How the process works</h2>
          <div className="space-y-4">
            {[
              {
                icon: MessageSquare,
                title: "Send your grievance",
                desc: "Email care@kutumbkosh.com with the subject line: \"Data Grievance — [your name]\". Describe your concern clearly — what data is involved, what you'd like us to do, and any relevant dates.",
              },
              {
                icon: Clock,
                title: "We acknowledge within 48 hours",
                desc: "You'll receive a confirmation email acknowledging we've received your grievance and providing a reference number.",
              },
              {
                icon: CheckCircle,
                title: "Resolution within 30 days",
                desc: "We investigate and respond with our findings and the action taken within 30 days of receipt. If we need more time, we'll let you know.",
              },
            ].map((step, i) => (
              <div key={i} className="flex items-start gap-4">
                <div className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5">
                  <step.icon className="w-4 h-4 text-gray-500" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-gray-900 mb-0.5">{step.title}</p>
                  <p className="text-sm text-gray-600 leading-relaxed">{step.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* What you can raise */}
        <div className="mb-8">
          <h2 className="text-base font-bold text-gray-900 mb-3">What you can raise a grievance about</h2>
          <ul className="space-y-2">
            {[
              "Access — request a copy of all personal data we hold about you",
              "Correction — ask us to fix inaccurate or incomplete data",
              "Deletion — request that your account and all data be permanently deleted",
              "Objection — object to a specific way we are using your data",
              "Breach — report a suspected unauthorised access to your data",
              "Any other concern about how KutumbKosh processes your personal data",
            ].map((item, i) => (
              <li key={i} className="flex items-start gap-2.5 text-sm text-gray-600">
                <span className="w-1.5 h-1.5 rounded-full bg-blue-400 mt-1.5 flex-shrink-0" />
                {item}
              </li>
            ))}
          </ul>
        </div>

        {/* Escalation */}
        <div className="bg-gray-50 border border-gray-200 rounded-2xl p-5 mb-8">
          <h2 className="text-sm font-bold text-gray-900 mb-2">Still not satisfied?</h2>
          <p className="text-sm text-gray-600 leading-relaxed">
            If your grievance is not resolved to your satisfaction within 30 days, you have the right
            to approach the <strong>Data Protection Board of India (DPBI)</strong> once it becomes
            operational under DPDPA 2023. We will cooperate fully with any DPBI inquiry.
          </p>
        </div>

        {/* CTA */}
        <a
          href="mailto:care@kutumbkosh.com?subject=Data%20Grievance%20%E2%80%94%20"
          className="block w-full bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold text-center py-3.5 rounded-xl transition-colors"
        >
          Email Your Grievance
        </a>

        {/* Footer links */}
        <div className="border-t border-gray-100 mt-10 pt-6 flex items-center justify-center gap-6 text-xs text-gray-400">
          <a href="/privacy" className="hover:text-gray-600 transition-colors">Privacy Policy</a>
          <a href="/security" className="hover:text-gray-600 transition-colors">Trust & Security</a>
          <a href="/terms" className="hover:text-gray-600 transition-colors">Terms of Service</a>
        </div>
      </main>
    </div>
  );
}
