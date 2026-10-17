"use client"

import * as React from "react"
import gsap from "gsap"
import { useGSAP } from "@gsap/react"

gsap.registerPlugin(useGSAP)

interface ArticleAnimationsProps {
    children: React.ReactNode
}

export function ArticleAnimations({ children }: ArticleAnimationsProps) {
    const containerRef = React.useRef<HTMLDivElement>(null)

    useGSAP(
        () => {
            if (!containerRef.current) return

            const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches
            if (prefersReducedMotion) return

            // Subtle entrance animation only on article header & featured image
            const entranceTl = gsap.timeline({ defaults: { ease: "power2.out" } })

            const breadcrumb = containerRef.current.querySelector(".article-entrance-crumb")
            const backBtn = containerRef.current.querySelector(".article-entrance-back")
            const title = containerRef.current.querySelector(".article-entrance-title")
            const meta = containerRef.current.querySelector(".article-entrance-meta")
            const featImg = containerRef.current.querySelector(".article-entrance-image")

            if (breadcrumb) {
                entranceTl.from(breadcrumb, { y: -8, opacity: 0, duration: 0.4 })
            }

            if (backBtn) {
                entranceTl.from(backBtn, { x: -8, opacity: 0, duration: 0.4 }, "-=0.2")
            }

            if (title) {
                const titleWords = title.querySelectorAll(".split-word")
                if (titleWords.length > 0) {
                    entranceTl.from(
                        titleWords,
                        {
                            y: 20,
                            opacity: 0,
                            duration: 0.6,
                            stagger: 0.025,
                            ease: "power2.out"
                        },
                        "-=0.2"
                    )
                } else {
                    entranceTl.from(title, { y: 20, opacity: 0, duration: 0.6 }, "-=0.2")
                }
            }

            if (meta) {
                entranceTl.from(meta, { y: 12, opacity: 0, duration: 0.5 }, "-=0.3")
            }

            if (featImg) {
                entranceTl.from(
                    featImg,
                    {
                        y: 18,
                        opacity: 0,
                        scale: 0.99,
                        duration: 0.65,
                        ease: "power2.out"
                    },
                    "-=0.25"
                )
            }
        },
        { scope: containerRef }
    )

    return (
        <div ref={containerRef} className="article-animation-root w-full">
            {children}
        </div>
    )
}
