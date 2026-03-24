import type { Metadata } from "next";
import { Geist, Geist_Mono, Sora } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const sora = Sora({
  variable: "--font-display",
  subsets: ["latin"],
  weight: ["600", "700", "800"],
});

export const metadata: Metadata = {
  title: "Stamply — Digital Loyalty Cards for Local Businesses",
  description:
    "Replace punch cards with digital loyalty cards your customers add to Apple & Google Wallet. Set up in 3 minutes. No app required.",
  manifest: "/manifest.json",
  themeColor: "#6C63FF",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "Stamply",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} ${sora.variable}`}
    >
      <body className="min-h-screen bg-background text-foreground font-sans antialiased noise-bg">
        {children}
      </body>
    </html>
  );
}
