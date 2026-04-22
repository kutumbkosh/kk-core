import type { Metadata } from "next";
import "./globals.css";
import EnvBadge from "@/components/EnvBadge";

export const metadata: Metadata = {
  title: "KutumbKosh - Your Family's Financial Safety Net",
  description:
    "Secure vault for all your financial accounts, nominees, and emergency access. Protect your family's financial legacy.",
  manifest: "/manifest.json",
  themeColor: "#0F172A",
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
      </body>
    </html>
  );
}
