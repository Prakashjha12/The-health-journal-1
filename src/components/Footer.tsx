"use client"

import React from "react"
import Link from "next/link"
import Image from "next/image"
import { Copyright } from "@/components/ui/Copyright"

export const Footer = () => {
    return (
        <footer className="w-full border-t border-border bg-background">
            <div className="max-w-[1200px] mx-auto px-6 py-12">
                <div className="grid gap-12 md:grid-cols-[1.5fr_1fr_1fr]">
                    {/* Brand & Info */}
                    <div className="space-y-4">
                        <div className="flex items-center gap-2.5">
                            <div className="relative h-8 w-8 flex items-center justify-center shrink-0">
                                <Image 
                                    src="/LOGO.webp" 
                                    alt="The Health Journal Logo" 
                                    width={32} 
                                    height={32} 
                                    className="object-contain" 
                                />
                            </div>
                            <span className="font-bold text-lg tracking-tight">The Health Journal</span>
                        </div>
                        <p className="text-[14px] text-muted-foreground max-w-sm leading-relaxed">
                            Your trusted source for evidence-based medical insights, wellness guides, and healthcare research simplified by medical professionals.
                        </p>
                    </div>

                    {/* Quick Links */}
                    <div>
                        <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-4">Navigation</h3>
                        <nav className="flex flex-col gap-3 text-[14px]">
                            <Link href="/" className="text-muted-foreground hover:text-foreground transition-colors">Home</Link>
                            <Link href="/#articles" className="text-muted-foreground hover:text-foreground transition-colors">Articles</Link>
                        </nav>
                    </div>

                    {/* Legal & Trust */}
                    <div>
                        <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-4">Legal & Trust</h3>
                        <nav className="flex flex-col gap-3 text-[14px]">
                            <Link href="/about" className="text-muted-foreground hover:text-foreground transition-colors">About Us</Link>
                            <Link href="/privacy" className="text-muted-foreground hover:text-foreground transition-colors">Privacy Policy</Link>
                            <Link href="/terms" className="text-muted-foreground hover:text-foreground transition-colors">Terms of Service</Link>
                        </nav>
                    </div>
                </div>

                {/* Medical Disclaimer Box */}
                <div className="mt-12 p-5 rounded-xl bg-muted/40 border border-border/50">
                    <p className="text-xs text-muted-foreground leading-relaxed text-center italic">
                        <span className="font-semibold text-foreground/80 not-italic">Medical Disclaimer:</span> The content on The Health Journal is for informational purposes only and is not intended to be a substitute for professional medical advice, diagnosis, or treatment. Always seek the advice of your physician or other qualified health provider with any questions you may have regarding a medical condition.
                    </p>
                </div>

                {/* Bottom Bar */}
                <div className="mt-12 pt-8 border-t border-border flex flex-col sm:flex-row items-center justify-between gap-6 text-xs text-muted-foreground">
                    <div className="flex items-center gap-1">
                         <Copyright />
                    </div>
                    <p>
                        Designed & Developed by <a href="https://www.prakashjha.com" target="_blank" rel="noopener noreferrer" className="font-medium hover:text-foreground transition-colors underline underline-offset-4 decoration-muted-foreground/30">Prakashjha</a>
                    </p>
                </div>
            </div>
        </footer>
    )
}
