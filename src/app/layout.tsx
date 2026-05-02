import type { Metadata } from "next";
import "./globals.css";
import EnvBadge from "@/components/EnvBadge";
import CloudflareAnalytics from "@/components/CloudflareAnalytics";

const OG_DESCRIPTION =
  "Organize, protect, and pass on your family's financial legacy. Track bank accounts, insurance, FDs, PPF, and all nominees — in one secure vault.";

export const metadata: Metadata = {
  title: "KutumbKosh — Your Family's Financial Vault | India",
  description: OG_DESCRIPTION,
  manifest: "/manifest.json",
  themeColor: "#2563EB",
  alternates: {
    canonical: "https://kutumbkosh.com",
  },
  openGraph: {
    title: "KutumbKosh — Your Family's Financial Vault",
    description: OG_DESCRIPTION,
    url: "https://kutumbkosh.com",
    siteName: "KutumbKosh",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "KutumbKosh — Your Family's Financial Vault",
      },
    ],
    type: "website",
    locale: "en_IN",
  },
  twitter: {
    card: "summary_large_image",
    title: "KutumbKosh — Your Family's Financial Vault",
    description: OG_DESCRIPTION,
    images: ["/og-image.png"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-gray-50">
        {children}
        <EnvBadge />
        <CloudflareAnalytics />
      </body>
    </html>
  );
}
