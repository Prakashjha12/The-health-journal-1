import React from "react"
import { Metadata } from "next"
import Image from "next/image"
import Link from "next/link"
import { Stethoscope, Award, Heart, ShieldCheck, Users } from "lucide-react"
import { Navbar } from "@/components/Navbar"
import { Footer } from "@/components/Footer"
import { sanityFetch } from "@/sanity/lib/live"
import { authorBySlugQuery } from "@/sanity/lib/queries"
import { urlFor } from "@/sanity/lib/image"
import { PortableText } from "@portabletext/react"

export const metadata: Metadata = {
    title: "About Us | The Health Journal",
    description: "Learn about The Health Journal's mission to provide evidence-based medical insights from Dr. Rajnandini Dubey.",
}

export default async function AboutPage() {
    // Fetch Dr. Rajnandini's official profile from Sanity
    const authorResponse = await sanityFetch({
        query: authorBySlugQuery,
        params: { slug: 'dr-rajnandini-dubey' } as any,
        tags: ['author:dr-rajnandini-dubey'],
    })
    
    const author = authorResponse?.data

    return (
        <div className="flex min-h-screen flex-col bg-background text-foreground">
            <Navbar />
            
            <main className="flex-1">
                {/* Hero Section */}
                <section className="relative py-20 overflow-hidden bg-zinc-50 dark:bg-zinc-950 border-b border-border/50">
                    <div className="max-w-[1200px] mx-auto px-6 relative z-10">
                        <div className="max-w-3xl">
                            <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight mb-6">
                                Demystifying Medicine for <span className="text-primary-600 dark:text-blue-500">Everyone.</span>
                            </h1>
                            <p className="text-xl md:text-2xl text-muted-foreground leading-relaxed font-medium">
                                At The Health Journal, we bridge the gap between complex clinical research and everyday wellness. Our mission is to provide you with evidence-based answers to your most pressing health questions.
                            </p>
                        </div>
                    </div>
                </section>

                {/* Mission Section */}
                <section className="py-24 max-w-[1200px] mx-auto px-6">
                    <div className="grid md:grid-cols-2 gap-16 items-center">
                        <div>
                            <h2 className="text-3xl font-bold mb-8 flex items-center gap-3">
                                <Heart className="text-red-500 h-8 w-8" />
                                Our Mission
                            </h2>
                            <div className="space-y-6 text-lg text-muted-foreground leading-relaxed">
                                <p>
                                    Founded on the principle that health information should be accessible, accurate, and actionable, <strong>The Health Journal</strong> serves as a premier digital resource for the global health community.
                                </p>
                                <p>
                                    We believe that understanding your body shouldn't require a medical degree. By simplifying complex research into professional guides, we empower individuals to make informed decisions about their healthcare journey.
                                </p>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4">
                                    <div className="flex items-start gap-3 p-4 rounded-xl bg-card border border-border/60">
                                        <ShieldCheck className="h-6 w-6 text-green-600 mt-1 shrink-0" />
                                        <div>
                                            <h4 className="font-bold text-foreground">Evidence-Based</h4>
                                            <p className="text-sm">Every article is rooted in peer-reviewed science.</p>
                                        </div>
                                    </div>
                                    <div className="flex items-start gap-3 p-4 rounded-xl bg-card border border-border/60">
                                        <Users className="h-6 w-6 text-blue-600 mt-1 shrink-0" />
                                        <div>
                                            <h4 className="font-bold text-foreground">Expert Reviewed</h4>
                                            <p className="text-sm">Clinical content verified by medical professionals.</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="relative aspect-square rounded-3xl overflow-hidden shadow-2xl border-4 border-white dark:border-zinc-800 rotate-2">
                           <Image 
                                src="/about-hero.jpg" 
                                alt="Medical Professional in Research" 
                                fill 
                                className="object-cover"
                                placeholder="empty"
                            />
                            {/* Overlay tag */}
                            <div className="absolute bottom-6 left-6 bg-background/90 backdrop-blur-md p-4 rounded-2xl border border-border">
                                <p className="text-sm font-bold">Standard of Excellence</p>
                                <p className="text-xs text-muted-foreground italic">"Trust through transparency"</p>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Medical Editorial Team */}
                <section className="py-24 bg-zinc-50 dark:bg-zinc-950">
                    <div className="max-w-[1200px] mx-auto px-6">
                        <div className="text-center max-w-2xl mx-auto mb-16">
                            <h2 className="text-3xl md:text-4xl font-bold mb-4">Our Medical Editorial Team</h2>
                            <p className="text-muted-foreground text-lg">
                                Behind every word on this site is a commitment to clinical accuracy. Led by our Chief Medical Editor, we ensure our content maintains the highest standards of medical integrity.
                            </p>
                        </div>

                        <div className="flex justify-center">
                            {/* Dr. Rajnandini Dubey */}
                            <div className="max-w-3xl w-full bg-card border border-border/80 rounded-3xl p-8 md:p-12 hover:shadow-xl transition-shadow group">
                                <div className="flex flex-col md:flex-row items-center md:items-start gap-10">
                                    <div className="relative w-40 h-40 shrink-0">
                                        <div className="absolute inset-0 bg-primary/20 rounded-full blur-2xl group-hover:bg-primary/30 transition-colors" />
                                        {author?.image ? (
                                            <Image 
                                                src={urlFor(author.image).width(160).height(160).url()} 
                                                alt={author.name || "Dr. Rajnandini Dubey"} 
                                                width={160} 
                                                height={160} 
                                                className="rounded-full object-cover border-4 border-background relative z-10"
                                            />
                                        ) : (
                                            <div className="w-40 h-40 rounded-full bg-muted flex items-center justify-center relative z-10 border-4 border-background">
                                                <Users className="h-10 w-10 text-muted-foreground" />
                                            </div>
                                        )}
                                        <div className="absolute -bottom-2 -right-2 bg-blue-600 text-white p-2.5 rounded-full z-20 border-2 border-background">
                                            <Award className="h-5 w-5" />
                                        </div>
                                    </div>
                                    <div className="text-center md:text-left">
                                        <div className="flex items-center justify-center md:justify-start gap-3 mb-2">
                                            <h3 className="text-3xl font-bold">{author?.name || "Dr. Rajnandini Dubey"}</h3>
                                            {author?.linkedin && (
                                                <Link href={author.linkedin} target="_blank" className="text-muted-foreground hover:text-[#0A66C2] transition-colors">
                                                    <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="currentColor"><path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/></svg>
                                                </Link>
                                            )}
                                        </div>
                                        <p className="text-primary-600 dark:text-blue-400 font-bold uppercase text-sm tracking-widest mb-6">Chief Medical Editor</p>
                                        <div className="space-y-4 text-lg text-muted-foreground leading-relaxed italic">
                                            {author?.bio ? (
                                                <div className="not-italic prose prose-zinc dark:prose-invert max-w-none">
                                                    <PortableText value={author.bio} />
                                                </div>
                                            ) : (
                                                <>
                                                    <p>
                                                        "Medical knowledge shouldn't be a privilege. My goal is to transform complex clinical data into actionable lifestyle improvements for our readers."
                                                    </p>
                                                    <p className="not-italic text-base">
                                                        Dr. Rajnandini Dubey is a healthcare specialist dedicated to evidence-based medical journalism. She oversees all clinical content on The Health Journal, ensuring every guide and research breakdown meets rigorous accuracy standards.
                                                    </p>
                                                </>
                                            )}
                                        </div>
                                        <div className="mt-8 flex flex-wrap items-center justify-center md:justify-start gap-4">
                                            <div className="flex items-center gap-2 text-sm font-semibold text-foreground bg-muted/50 px-4 py-2 rounded-full border border-border/50">
                                                <Stethoscope className="h-4 w-4 text-primary" />
                                                <span>MPT (Sports) | Masters in Physiotherapy</span>
                                            </div>
                                            <div className="flex items-center gap-2 text-sm font-semibold text-foreground bg-muted/50 px-4 py-2 rounded-full border border-border/50">
                                                <ShieldCheck className="h-4 w-4 text-green-600" />
                                                <span>Medical Review Board Lead</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>
            </main>

            <Footer />
        </div>
    )
}
