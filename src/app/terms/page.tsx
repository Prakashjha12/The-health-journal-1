import React from "react"
import { Metadata } from "next"
import { Scale, AlertCircle, FileText, Ban, Gavel } from "lucide-react"
import { Navbar } from "@/components/Navbar"
import { Footer } from "@/components/Footer"

export const metadata: Metadata = {
    title: "Terms of Service | The Health Journal",
    description: "Read our terms of service to understand the legal conditions for using The Health Journal, including our medical advice disclaimer.",
}

export default function TermsPage() {
    return (
        <div className="flex min-h-screen flex-col bg-background text-foreground">
            <Navbar />
            
            <main className="flex-1 max-w-[900px] mx-auto px-6 py-16">
                {/* Header */}
                <div className="mb-12">
                    <h1 className="text-4xl font-extrabold tracking-tight mb-4">Terms of Service</h1>
                    <p className="text-muted-foreground">Last Updated: April 17, 2026</p>
                </div>

                {/* Important Alert */}
                <div className="mb-12 p-6 rounded-2xl bg-zinc-100 dark:bg-zinc-900 border border-border flex gap-4">
                    <AlertCircle className="h-6 w-6 text-primary shrink-0 mt-1" />
                    <p className="text-sm leading-relaxed">
                        Please read these Terms of Service carefully before using The Health Journal. By accessing or using our platform, you agree to be bound by these terms. If you do not agree to all terms, you may not access our services.
                    </p>
                </div>

                {/* Terms Sections */}
                <div className="prose prose-zinc dark:prose-invert max-w-none space-y-12">
                    
                    {/* NO MEDICAL ADVICE */}
                    <section className="border-l-4 border-primary pl-8">
                        <h2 className="flex items-center gap-3 text-2xl font-bold text-foreground">
                            <Ban className="h-6 w-6 text-red-600" />
                            1. No Medical Advice Clause
                        </h2>
                        <p className="font-bold underline">
                            This is the most critical part of our agreement:
                        </p>
                        <p>
                            The Health Journal provides general health and wellness information for educational purposes only. <strong>The content is NOT intended to be a substitute for professional medical advice, diagnosis, or treatment.</strong>
                        </p>
                        <p>
                            You should always seek the advice of your physician or other qualified health provider with any questions you may have regarding a medical condition. Reliance on any information provided by The Health Journal, its employees, or medical contributors is solely at your own risk.
                        </p>
                    </section>

                    {/* Use of Content */}
                    <section>
                        <h2 className="flex items-center gap-3 text-2xl font-bold">
                            <FileText className="h-6 w-6 text-primary" />
                            2. Intellectual Property & Use of Content
                        </h2>
                        <p>
                            All content on The Health Journal, including text, graphics, logos, and images, is the property of The Health Journal or its content contributors and is protected by international copyright laws.
                        </p>
                        <ul>
                            <li>You may access and print content for your personal, non-commercial use only.</li>
                            <li>You may NOT reproduce, distribute, or create derivative works from our content without explicit written permission.</li>
                        </ul>
                    </section>

                    {/* Limitation of Liability */}
                    <section className="bg-zinc-50 dark:bg-zinc-950 p-8 rounded-2xl border border-border">
                        <h2 className="flex items-center gap-3 text-2xl font-bold mb-4">
                            <Scale className="h-6 w-6 text-primary" />
                            3. Limitation of Liability
                        </h2>
                        <p>
                            To the fullest extent permitted by law, The Health Journal and its medical contributors shall not be liable for any direct, indirect, incidental, special, or consequential damages resulting from:
                        </p>
                        <ol className="list-decimal pl-6 space-y-2">
                            <li>The use or inability to use the site or its content.</li>
                            <li>Any medical outcomes or health decisions made based on the information provided.</li>
                            <li>Unauthorized access to or alteration of your profile data.</li>
                        </ol>
                        <p className="mt-4 text-sm font-medium">
                            Our medical contributors, led by Dr. Rajnandini Dubey, provide insights based on their professional experience, but these insights do not establish a doctor-patient relationship.
                        </p>
                    </section>

                    {/* Governing Law */}
                    <section>
                        <h2 className="flex items-center gap-3 text-2xl font-bold">
                            <Gavel className="h-6 w-6 text-primary" />
                            4. Governing Law
                        </h2>
                        <p>
                            These terms shall be governed by and construed in accordance with the laws of India, without regard to its conflict of law provisions. Any legal action or proceeding related to your access to, or use of, the site shall be instituted in a court in Bihar, India.
                        </p>
                    </section>

                    {/* Contact */}
                    <section className="pt-8 border-t border-border">
                        <h3 className="text-xl font-bold mb-4">Questions?</h3>
                        <p>
                            If you have any questions about these Terms, please contact us at <a href="mailto:support@thehealthjournal.in" className="text-primary hover:underline font-medium">support@thehealthjournal.in</a>.
                        </p>
                    </section>
                </div>
            </main>

            <Footer />
        </div>
    )
}
