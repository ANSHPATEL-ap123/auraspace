import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { ClerkProvider } from '@clerk/nextjs'
import { dark } from '@clerk/themes';
import Navigation from "@/components/Navigation"; // 🔥 This imports your updated navbar
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "AuraSpace-Observatory",
  description: "Advanced celestial telemetry and astrophotography planning.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider 
      appearance={{ baseTheme: dark, variables: { colorPrimary: '#00FF66' } } as any}
    >
      <html lang="en">
        <body className={`${inter.className} bg-[#020202] text-white antialiased`}>
          <Navigation /> {/* 🔥 This renders the button on the screen */}
          {children}
        </body>
      </html>
    </ClerkProvider>
  );
}