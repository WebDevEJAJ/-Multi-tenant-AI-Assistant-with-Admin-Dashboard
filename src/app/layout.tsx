import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { QueryProvider } from "@/components/providers/query-provider";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: "AI Assistant - Multi-tenant Chat Platform",
  description:
    "Production-grade multi-tenant AI assistant with config-driven admin dashboard, integrations, and real-time chat powered by Google Gemini.",
  keywords: [
    "AI",
    "chat",
    "assistant",
    "multi-tenant",
    "dashboard",
    "admin",
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body className={`${inter.variable} font-sans antialiased`}>
        <QueryProvider>{children}</QueryProvider>
      </body>
    </html>
  );
}
