import React from "react"
import { Metadata } from "next"
import { ShieldAlert, Cookie, ShieldCheck, Lock } from "lucide-react"
import { Navbar } from "@/components/Navbar"
import { Footer } from "@/components/Footer"

export const metadata: Metadata = {
    title: "Privacy Policy | The Health Journal",
    description: "Read our privacy policy to understand how we collect and use your data, and our strict clinical review standards.",
}

export default function PrivacyPage() {
    return (
        <div className="flex min-h-screen flex-col bg-background text-foreground">
            <Navbar />
            
            <main className="flex-1 max-w-[900px] mx-auto px-6 py-16">
                {/* Header */}
                <div className="mb-12">
                    <h1 className="text-4xl font-extrabold tracking-tight mb-4">Privacy Policy</h1>
                    <p className="text-muted-foreground">Last Updated: April 17, 2026</p>
                </div>

                {/* CRITICAL MEDICAL DISCLAIMER */}
                <div className="mb-12 p-6 rounded-2xl bg-amber-50 dark:bg-amber-950/30 border-2 border-amber-200 dark:border-amber-800 shadow-sm">
                    <div className="flex items-start gap-4">
                        <ShieldAlert className="h-6 w-6 text-amber-600 shrink-0 mt-1" />
                        <div>
                            <h2 className="text-lg font-bold text-amber-900 dark:text-amber-200 mb-2">Notice: Medical Information Disclaimer</h2>
                            <p className="text-amber-800 dark:text-amber-300/90 leading-relaxed text-sm">
                                The content available on The Health Journal is for <strong>informational and educational purposes only</strong>. It is not intended to provide a medical diagnosis or substitute for professional medical advice, diagnosis, or treatment. <strong>Always seek the advice of your physician or other qualified health provider</strong> regarding any medical condition. Never disregard professional medical advice or delay seeking it because of something you have read on this website.
                            </p>
                        </div>
                    </div>
                </div>

                {/* Content Sections */}
                <div className="prose prose-zinc dark:prose-invert max-w-none space-y-12">
                    {/* Data Collection */}
                    <section>
                        <h2 className="flex items-center gap-3 text-2xl font-bold">
                            <Lock className="h-6 w-6 text-primary" />
                            Data Collection & Usage
                        </h2>
                        <p>
                            At The Health Journal, we prioritize the privacy of our visitors. We only collect information that is strictly necessary to provide a personalized experience.
                        </p>
                        <ul>
                            <li><strong>Account Information:</strong> When you sign in via Clerk, we receive your basic profile information (email and name) to enable features like bookmarking articles.</li>
                            <li><strong>Log Files:</strong> Like most standard website servers, we use log files to analyze trends and administer the site. This includes IP addresses, browser types, and exit pages.</li>
                        </ul>
                    </section>

                    {/* Cookies */}
                    <section>
                        <h2 className="flex items-center gap-3 text-2xl font-bold">
                            <Cookie className="h-6 w-6 text-primary" />
                            Cookies & Tracking
                        </h2>
                        <p>
                            We use cookies to improve your browsing experience. Specifically:
                        </p>
                        <ul>
                            <li><strong>Functional Cookies:</strong> We use cookies through our authentication provider, <strong>Clerk</strong>, to maintain your session and remember your bookmarked articles.</li>
                            <li><strong>Analytics:</strong> We use Vercel Analytics to understand how visitors interact with our content, helping us prioritize topics of interest to our community.</li>
                        </ul>
                        <p className="text-sm italic">
                            You can choose to disable cookies through your individual browser options, though some features like "Saved Articles" may not function correctly.
                        </p>
                    </section>

                    {/* Clinical Review Standards */}
                    <section className="p-8 rounded-2xl bg-zinc-50 dark:bg-zinc-950 border border-border">
                        <h2 className="flex items-center gap-3 text-2xl font-bold mb-6">
                            <ShieldCheck className="h-6 w-6 text-blue-600" />
                            Clinical Review Standards
                        </h2>
                        <p>
                            The integrity of our health information is paramount. Every clinical article published on The Health Journal undergoes a rigorous review process:
                        </p>
                        <div className="grid sm:grid-cols-2 gap-6 mt-6">
                            <div className="space-y-2">
                                <h4 className="font-bold">1. Sourcing</h4>
                                <p className="text-sm text-muted-foreground">We prioritize primary sources, including peer-reviewed journals, government health agencies, and academic institutions.</p>
                            </div>
                            <div className="space-y-2">
                                <h4 className="font-bold">2. Expert Review</h4>
                                <p className="text-sm text-muted-foreground">Content is reviewed by our Medical Board members to ensure clinical accuracy and safety.</p>
                            </div>
                            <div className="space-y-2">
                                <h4 className="font-bold">3. Regular Updates</h4>
                                <p className="text-sm text-muted-foreground">As medical science evolves, we revisit and update articles to reflect the latest consensus.</p>
                            </div>
                            <div className="space-y-2">
                                <h4 className="font-bold">4. Transparency</h4>
                                <p className="text-sm text-muted-foreground">We clearly disclose the author and medical reviewer for every health-focused piece.</p>
                            </div>
                        </div>
                    </section>
                </div>
            </main>

            <Footer />
        </div>
    )
}
