"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";

const faqs = [
  {
    q: "Is my data safe with KutumbKosh?",
    a: "Your data is protected with 256-bit encryption — the same standard used by banks. Everything in your vault is encrypted at rest, and all connections are secured in transit. We’ve also built our platform with Indian data privacy standards in mind, so your family’s financial information is always in safe hands.",
  },
  {
    q: "Do you store passwords or full account numbers?",
    a: "No. KutumbKosh is a record-keeping tool, not a password manager. We store asset names, institution names, and the last 4 digits of an account if you choose to add them. We never ask for, or store, passwords, PINs, or full account numbers.",
  },
  {
    q: "What’s the difference between a nominee and a trusted contact?",
    a: "A nominee is the person legally entitled to inherit a specific asset — your bank, insurer, or fund holds that record, and KutumbKosh helps you document it in one place. A trusted contact is someone you trust to see your vault summary in an emergency, so they know what assets exist and who to contact. They cannot claim any asset — they can only see the summary. They can be the same person, or completely different people.",
  },
  {
    q: "What does KutumbKosh cost?",
    a: "The free plan lets you add up to 3 assets, 1 trusted contact, and set up manual emergency access — at no cost, forever. KutumbKosh Pro is ₹499/year (GST inclusive) and gives you unlimited assets, up to 2 trusted contacts, automatic emergency access settings, all reminder types, and a full Vault Dossier PDF.",
  },
  {
    q: "What happens to my data if I delete my account?",
    a: "Your data is permanently deleted when you close your account. We do not retain any copies of your vault contents after deletion. Your family’s financial records belong to you — and when you choose to leave, they leave with you.",
  },
  {
    q: "Can anyone at KutumbKosh read my vault?",
    a: "No. We operate a zero-access policy — no KutumbKosh employee has routine access to the contents of your vault. Your data is visible only to you, and to anyone you explicitly choose to share access with.",
  },
  {
    q: "How does emergency access work?",
    a: "You decide who can see your vault and under what conditions. Your trusted contact can request access in an emergency, and you control whether that happens automatically after a waiting period or only with your approval. They see a vault summary — asset types, institution names, and nominee details. No passwords, no full account numbers.",
  },
];

export default function FAQ() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const toggle = (i: number) => setOpenIndex(openIndex === i ? null : i);

  return (
    <section className="py-16 lg:py-24 bg-white px-6">
      <div className="max-w-3xl mx-auto">
        <div className="text-center mb-10">
          <span className="inline-block text-xs font-semibold text-blue-600 bg-blue-50 px-3 py-1 rounded-full mb-4 tracking-wide uppercase">
            Common questions
          </span>
          <h2 className="text-2xl lg:text-3xl font-extrabold text-gray-900 leading-tight">
            Everything you need to know
          </h2>
        </div>

        <div className="divide-y divide-gray-200 border-t border-gray-200">
          {faqs.map((item, i) => (
            <div key={i}>
              <button
                onClick={() => toggle(i)}
                className="w-full flex items-center justify-between gap-4 py-5 text-left"
                aria-expanded={openIndex === i}
              >
                <span className="text-sm font-semibold text-gray-900">{item.q}</span>
                <ChevronDown
                  className={`w-4 h-4 text-blue-600 flex-shrink-0 transition-transform duration-200 ${
                    openIndex === i ? "rotate-180" : ""
                  }`}
                />
              </button>
              {openIndex === i && (
                <p className="pb-5 text-sm text-gray-500 leading-relaxed">{item.a}</p>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
