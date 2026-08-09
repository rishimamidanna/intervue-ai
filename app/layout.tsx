import type { Metadata } from "next";
import { Geist, Geist_Mono, Space_Grotesk } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const spaceGrotesk = Space_Grotesk({
  variable: "--font-space-grotesk",
  subsets: ["latin"],
  weight: ["500", "600", "700"],
});

export const metadata: Metadata = {
  title: {
    default: "INTERVUE — Adaptive AI Technical Interview Intelligence",
    template: "%s | INTERVUE",
  },
  description:
    "INTERVUE is an Adaptive AI Technical Interview Agent. Every Answer Changes the Interview.",
  keywords: [
    "AI interview",
    "adaptive interview",
    "RAG",
    "AI engineering",
    "technical interview",
  ],
  openGraph: {
    title: "INTERVUE",
    description: "Every Answer Changes the Interview.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} ${spaceGrotesk.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-neutral-950 text-white">
        {children}
      </body>
    </html>
  );
}
