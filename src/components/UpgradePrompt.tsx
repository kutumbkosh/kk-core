"use client";

import { useRouter } from "next/navigation";
import { Crown, Zap, ArrowRight, X } from "lucide-react";
import { useState } from "react";

interface UpgradePromptProps {
  feature: string;
  message?: string;
  variant?: "banner" | "card" | "modal" | "inline";
  onClose?: () => void;
}

const featureMessages: Record<string, { title: string; desc: string }> = {
  asset_limit: {
    title: "Asset limit reached",
    desc: "Free plan supports up to 3 assets. Upgrade to Pro for unlimited assets and full vault protection.",
  },
  nominee_limit: {
    title: "Nominee limit reached",
    desc: "Free plan supports up to 2 nominees. Upgrade to Pro to add unlimited nominees.",
  },
  emergency_access: {
    title: "Emergency Access is a Pro feature",
    desc: "Set up trusted contacts and emergency dossiers to protect your family. Available with KutumbKosh Pro.",
  },
  emergency_access_v2v3: {
    title: "Automatic access is a Pro feature",
    desc: "With Pro, your trusted contact can get access automatically — no need for you to approve it in the moment.",
  },
  emergency_contact_limit: {
    title: "Add more trusted contacts with Pro",
    desc: "Your free plan includes 1 trusted contact. Upgrade to Pro to add a second and configure how they access your vault.",
  },
  pdf_export: {
    title: "PDF Export is a Pro feature",
    desc: "Download and print your complete vault summary. Available with KutumbKosh Pro.",
  },
  share_percentages: {
    title: "Share percentages are a Pro feature",
    desc: "Specify exact share percentages for each nominee per asset. Available with KutumbKosh Pro.",
  },
  all_reminders: {
    title: "Advanced reminders are a Pro feature",
    desc: "Get timely alerts for insurance policy expiry and FD maturity dates. Available with KutumbKosh Pro.",
  },
};

export default function UpgradePrompt({ feature, message, variant = "card", onClose }: UpgradePromptProps) {
  const router = useRouter();
  const [dismissed, setDismissed] = useState(false);
  const info = featureMessages[feature] || { title: "Pro feature", desc: message || "Upgrade to KutumbKosh Pro to unlock this feature." };

  if (dismissed) return null;

  const handleUpgrade = () => router.push("/dashboard/pricing?plan=annual");
  const handleDismiss = () => { setDismissed(true); onClose?.(); };

  if (variant === "inline") {
    return (
      <button onClick={handleUpgrade} className="flex items-center gap-1.5 text-xs text-blue-600 hover:text-blue-800 font-medium transition-colors">
        <Crown className="w-3 h-3" /> Upgrade to unlock
      </button>
    );
  }

  if (variant === "banner") {
    return (
      <div className="flex items-center gap-3 p-3 bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-lg">
        <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
          <Crown className="w-4 h-4 text-blue-600" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-gray-900">{info.title}</p>
          <p className="text-xs text-gray-500 mt-0.5">{info.desc}</p>
        </div>
        <button onClick={handleUpgrade} className="btn-primary text-xs py-1.5 px-3 whitespace-nowrap">
          Upgrade <ArrowRight className="w-3 h-3 ml-1" />
        </button>
        {onClose && (
          <button onClick={handleDismiss} className="p-1 text-gray-400 hover:text-gray-600">
            <X className="w-4 h-4" />
          </button>
        )}
      </div>
    );
  }

  if (variant === "modal") {
    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-6">
        <div className="bg-white rounded-xl max-w-sm w-full p-6 text-center">
          <div className="w-14 h-14 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Zap className="w-7 h-7 text-blue-600" />
          </div>
          <h3 className="text-base font-bold text-gray-900 mb-2">{info.title}</h3>
          <p className="text-sm text-gray-500 mb-6">{info.desc}</p>
          <div className="flex gap-3">
            <button onClick={handleDismiss} className="flex-1 py-2.5 px-4 bg-gray-100 text-gray-700 rounded-lg text-sm font-semibold hover:bg-gray-200 transition-colors">
              Maybe later
            </button>
            <button onClick={handleUpgrade} className="flex-1 py-2.5 px-4 bg-vault-accent text-white rounded-lg text-sm font-semibold hover:bg-blue-700 transition-colors">
              View Plans
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Default: card variant
  return (
    <div className="card border-blue-200 bg-gradient-to-br from-white to-blue-50/50 p-6 text-center">
      <div className="w-12 h-12 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-full flex items-center justify-center mx-auto mb-3">
        <Crown className="w-6 h-6 text-blue-600" />
      </div>
      <h3 className="text-base font-bold text-gray-900 mb-1">{info.title}</h3>
      <p className="text-sm text-gray-500 mb-4 max-w-xs mx-auto">{info.desc}</p>
      <button onClick={handleUpgrade} className="btn-primary text-sm">
        Upgrade to Pro &mdash; from &#8377;49/month or &#8377;499/year <ArrowRight className="w-4 h-4 ml-1.5" />
      </button>
    </div>
  );
}
