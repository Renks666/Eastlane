import type { Metadata } from "next";
import { Geist, Geist_Mono, Source_Sans_3 } from "next/font/google";
import { Toaster } from "@/components/ui/sonner";
import { ScrollRestoration } from "@/components/ScrollRestoration";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const sourceSans3 = Source_Sans_3({
  variable: "--font-source-sans-3",
  subsets: ["latin", "cyrillic"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Eastlane - Премиум одежда и аксессуары",
  description: "Интернет-магазин качественной одежды и аксессуаров Eastlane",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ru">
      <body
        className={`${geistSans.variable} ${geistMono.variable} ${sourceSans3.variable} antialiased`}
      >
        <ScrollRestoration />
        {children}
        <Toaster 
          position="top-right" 
          offset="24px"
          gap={12}
          visibleToasts={3}
        />
      </body>
    </html>
  );
}
