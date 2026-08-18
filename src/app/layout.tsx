import type { Metadata } from "next";
import { Poppins } from "next/font/google";
import "./globals.css";
import EnvBadge from "@/components/EnvBadge";
import CloudflareAnalytics from "@/components/CloudflareAnalytics";
import WebVitals from "@/components/WebVitals";

const OG_DESCRIPTION =
  "Organize, protect, and pass on your family's financial legacy. Track bank accounts, insurance, FDs, PPF, and all nominees — in one secure vault.";

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700", "800"],
  variable: "--font-poppins",
});

export const metadata: Metadata = {
  title: "KutumbKosh — Your Family's Financial Vault | India",
  description: OG_DESCRIPTION,
  manifest: "/manifest.json",
  themeColor: "#2563EB",
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "any" },
      { url: "/icon.png", type: "image/png", sizes: "32x32" },
    ],
    apple: [{ url: "/apple-touch-icon.png", sizes: "180x180" }],
  },
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

const organizationSchema = {
  "@context": "https://schema.org",
  "@type": "Organization",
  name: "KutumbKosh",
  url: "https://kutumbkosh.com",
  logo: "https://kutumbkosh.com/logo.png",
  contactPoint: {
    "@type": "ContactPoint",
    email: "care@kutumbkosh.com",
    contactType: "customer support",
  },
  sameAs: [],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={poppins.variable}>
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationSchema) }}
        />
      </head>
      <body className="min-h-screen bg-gray-50">
        {children}
        <EnvBadge />
        <CloudflareAnalytics />
        <WebVitals />
      </body>
    </html>
  );
}
