import type { Metadata } from "next";
import {
  Geist,
  Geist_Mono,
  Bebas_Neue,
  Inter,
} from "next/font/google";
import "./globals.css";

import SiteHeader from "@/components/SiteHeader";


const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});
const bebas = Bebas_Neue({
  weight: "400",
  subsets: ["latin"],
  variable: "--font-bebas",
});

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: "Lacendary Kicks",
  description: "The Ultimate Sneaker Archive",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`
  ${geistSans.variable}
  ${geistMono.variable}
  ${bebas.variable}
  ${inter.variable}
  h-full
  antialiased
`}
    >
      <body className="min-h-screen bg-black text-white">
        <div className="flex min-h-screen flex-col">
          <SiteHeader />

          <main className="flex-1">
            {children}
          </main>
        </div>
      </body>
    </html>
  );
}