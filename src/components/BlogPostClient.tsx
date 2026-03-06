"use client"

import * as React from "react"
import { Check, Copy, Linkedin, ArrowLeft, Clock } from "lucide-react"
import Link from "next/link"

// X (Twitter) icon
function XIcon({ className }: { className?: string }) {
    return (
        <svg viewBox="0 0 24 24" className={className} fill="currentColor" aria-hidden="true">
            <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
        </svg>
    )
}

// Facebook icon
function FacebookIcon({ className }: { className?: string }) {
    return (
        <svg viewBox="0 0 24 24" className={className} fill="currentColor" aria-hidden="true">
            <path d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z" />
        </svg>
    )
}

export function ReadingProgressBar() {
    const [progress, setProgress] = React.useState(0)

    React.useEffect(() => {
        let ticking = false

        const handleScroll = () => {
            if (!ticking) {
                requestAnimationFrame(() => {
                    const scrollTop = window.scrollY
                    const docHeight = document.documentElement.scrollHeight - window.innerHeight
                    const scrollPercent = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0
                    setProgress(Math.min(100, Math.max(0, scrollPercent)))
                    ticking = false
                })
                ticking = true
            }
        }

        window.addEventListener("scroll", handleScroll, { passive: true })
        return () => window.removeEventListener("scroll", handleScroll)
    }, [])

    return (
        <div className="fixed top-0 left-0 right-0 z-[60] h-[3px] bg-transparent">
            <div
                className="h-full bg-foreground/80 transition-[width] duration-150 ease-out"
                style={{ width: `${progress}%` }}
            />
        </div>
    )
}

export function ReadingTimeBadge({ minutes }: { minutes: number }) {
    return (
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-muted text-muted-foreground">
            <Clock className="h-3 w-3" />
            {minutes} min read
        </span>
    )
}

export function SocialShareSidebar({ title }: { title: string }) {
    const [copied, setCopied] = React.useState(false)
    const [currentUrl, setCurrentUrl] = React.useState("")

    React.useEffect(() => {
        setCurrentUrl(window.location.href)
    }, [])

    const encodedUrl = encodeURIComponent(currentUrl)
    const encodedTitle = encodeURIComponent(title)

    const shareLinks = [
        {
            name: "Share on X",
            href: `https://twitter.com/intent/tweet?text=${encodedTitle}&url=${encodedUrl}`,
            icon: <XIcon className="h-4 w-4" />,
        },
        {
            name: "Share on Facebook",
            href: `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`,
            icon: <FacebookIcon className="h-4 w-4" />,
        },
        {
            name: "Share on LinkedIn",
            href: `https://www.linkedin.com/shareArticle?mini=true&url=${encodedUrl}&title=${encodedTitle}`,
            icon: <Linkedin className="h-4 w-4" />,
        },
    ]

    const handleCopy = async () => {
        try {
            await navigator.clipboard.writeText(currentUrl)
            setCopied(true)
            setTimeout(() => setCopied(false), 2000)
        } catch {
            // fallback
            const textarea = document.createElement("textarea")
            textarea.value = currentUrl
            document.body.appendChild(textarea)
            textarea.select()
            document.execCommand("copy")
            document.body.removeChild(textarea)
            setCopied(true)
            setTimeout(() => setCopied(false), 2000)
        }
    }

    return (
        <div className="flex flex-col items-center gap-3">
            {shareLinks.map((link) => (
                <a
                    key={link.name}
                    href={link.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    title={link.name}
                    className="flex items-center justify-center h-10 w-10 rounded-full border border-border bg-card text-muted-foreground hover:text-foreground hover:border-foreground/30 hover:bg-muted transition-all duration-200"
                >
                    {link.icon}
                </a>
            ))}
            <button
                onClick={handleCopy}
                title={copied ? "Copied!" : "Copy link"}
                className="flex items-center justify-center h-10 w-10 rounded-full border border-border bg-card text-muted-foreground hover:text-foreground hover:border-foreground/30 hover:bg-muted transition-all duration-200 cursor-pointer"
            >
                {copied ? <Check className="h-4 w-4 text-green-500" /> : <Copy className="h-4 w-4" />}
            </button>
        </div>
    )
}

export function BackButton() {
    return (
        <Link
            href="/"
            className="inline-flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors group"
        >
            <ArrowLeft size={16} className="group-hover:-translate-x-0.5 transition-transform" />
            Back to all posts
        </Link>
    )
}
