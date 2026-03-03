import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Link from "next/link";
import { ThemeProvider } from "@/components/ThemeProvider";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Komal&apos;s Blog",
  description: "A modern blog powered by Next.js and Sanity.io",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        suppressHydrationWarning
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-zinc-50 dark:bg-black text-zinc-900 dark:text-zinc-50 min-h-screen flex flex-col`}
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <div className="grow">
            {children}
          </div>
        </ThemeProvider>
        <footer className="border-t border-zinc-200 dark:border-zinc-800 py-8 text-center text-sm text-zinc-500">
          <p>© {new Date().getFullYear()} Komal&apos;s Blog. All rights reserved.</p>
        </footer>
      </body>
    </html>
  );
}
