import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/ThemeProvider";
import { ClerkProvider } from "@clerk/nextjs";
import { SanityLive } from "@/sanity/lib/live";
import { ScrollToTop } from "@/components/ScrollToTop";
import { Analytics } from '@vercel/analytics/next';
import { SpeedInsights } from '@vercel/speed-insights/next';


const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
  display: 'swap', // This is the performance booster
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
  display: 'swap', // Ensures code blocks/mono text don't block render
});
export const metadata: Metadata = {
  metadataBase: new URL("https://thehealthjournal.in"),
  title: {
    default: "The Health Journal | Evidence-Based Medical Insights",
    template: "%s | The Health Journal", // This makes sub-pages look like: "Yoga Tips | The Health Journal"
  },
  description: "Your trusted source for evidence-based medical insights, wellness guides, and expert healthcare research simplified by medical professionals.",
  icons: {
    icon: "/fevicon.svg", // Double check if it's spelled 'favicon' or 'fevicon' in your public folder!
  },
  keywords: ["medical journal", "health tips", "wellness guides", "evidence-based health", "Dr. Rajnandini Dubey", "Dr. Komal"],
  openGraph: {
    title: "The Health Journal",
    description: "Expert medical insights and wellness tips verified by healthcare professionals.",
    siteName: "The Health Journal",
    url: "https://thehealthjournal.in",
    type: "website",
    locale: "en_IN",
    images: [
      {
        url: "/og-image.jpg", // Make sure you have a high-quality branded image in /public
        width: 1200,
        height: 630,
        alt: "The Health Journal Logo",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "The Health Journal",
    description: "Evidence-based medical insights and wellness guides.",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider afterSignOutUrl="/">
      <html lang="en" suppressHydrationWarning className="scroll-smooth">
        <body
          suppressHydrationWarning
          className={`${geistSans.variable} ${geistMono.variable} antialiased bg-zinc-50 dark:bg-black text-zinc-900 dark:text-zinc-50 min-h-screen flex flex-col`}
        >
          <ThemeProvider
            attribute="class"
            defaultTheme="dark"
            enableSystem
          >
            <ScrollToTop />
            {children}
            <SanityLive />
            <Analytics />
            <SpeedInsights />
          </ThemeProvider>
        </body>
      </html>
    </ClerkProvider>
  );
}
