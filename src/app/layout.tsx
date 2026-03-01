import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as SonnerToaster } from "@/components/ui/sonner";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Neural Network Visualizer - Design • Visualize • Understand",
  description: "Interactive web application to design, visualize, and understand neural network architectures. Configure layers, see real-time diagrams, and generate production-ready code.",
  keywords: ["Neural Network", "Deep Learning", "Visualization", "PyTorch", "TensorFlow", "Machine Learning", "AI"],
  authors: [{ name: "Neural Network Visualizer" }],
  icons: {
    icon: "/logo.svg",
  },
  openGraph: {
    title: "Neural Network Visualizer",
    description: "Design, visualize, and understand neural network architectures",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-[#0a0a0f] text-white`}
      >
        {children}
        <Toaster />
        <SonnerToaster position="bottom-right" />
      </body>
    </html>
  );
}
