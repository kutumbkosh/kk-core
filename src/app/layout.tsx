import type { Metadata } from "next";
import { Poppins } from "next/font/google";
import "./globals.css";
import EnvBadge from "@/components/EnvBadge";

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700", "800"],
  variable: "--font-poppins",
});

export const metadata: Metadata = {
  title: "KutumbKosh - Your Family's Financial Safety Net",
  description:
    "Secure vault for all your financial accounts, nominees, and emergency access. Protect your family's financial legacy.",
  manifest: "/manifest.json",
  themeColor: "#0F172A",
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
      </body>
    </html>
  );
}
