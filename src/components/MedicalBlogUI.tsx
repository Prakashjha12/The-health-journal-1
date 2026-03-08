"use client"

import * as React from "react"
import {
    Search, Stethoscope, ChevronLeft, ChevronRight
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { DotPattern } from "@/components/ui/dot-pattern"
import { cn, calculateReadingTime } from "@/lib/utils"
import Link from "next/link"
import Image from "next/image"
import { urlFor } from "@/sanity/lib/image"
import { Navbar } from "@/components/Navbar"
import { BookmarkButton } from "@/components/BookmarkButton"

interface SanityPost {
    _id: string
    title: string
    slug: { current: string }
    publishedAt?: string
    _createdAt?: string
    image?: {
        _type: 'image'
        asset: {
            _ref: string
            _type: 'reference'
        }
    } | null
    body?: unknown[]
}

const CATEGORIES = ["All", "Health", "Wellness", "Research", "Lifestyle", "Nutrition"]
const POSTS_PER_PAGE = 6

const FALLBACK_ARTICLES = [
    {
        id: "fallback-1",
        title: "Understanding Cardiovascular Health in Modern Medicine",
        slug: "#",
        excerpt: "Explore the latest research on heart health, preventive measures, and innovative treatments that are shaping modern cardiology.",
        category: "Health",
        readTime: "8 min read",
        date: "Jan 15, 2024",
        imageUrl: null
    },
    {
        id: "fallback-2",
        title: "The Science of Mindfulness and Mental Wellness",
        slug: "#",
        excerpt: "How mindfulness practices are backed by neuroscience research to improve mental health outcomes.",
        category: "Wellness",
        readTime: "6 min read",
        date: "Feb 10, 2024",
        imageUrl: null
    },
    {
        id: "fallback-3",
        title: "Nutritional Genomics: Eating for Your DNA",
        slug: "#",
        excerpt: "Personalized nutrition based on genetic profiles is the future of dietary science and wellness.",
        category: "Nutrition",
        readTime: "5 min read",
        date: "Mar 1, 2024",
        imageUrl: null
    },
    {
        id: "fallback-4",
        title: "AI-Driven Drug Discovery Breakthroughs in 2024",
        slug: "#",
        excerpt: "How artificial intelligence is accelerating the development of new medications and therapies worldwide.",
        category: "Research",
        readTime: "7 min read",
        date: "Mar 5, 2024",
        imageUrl: null
    },
    {
        id: "fallback-5",
        title: "Building Sustainable Health Habits That Last",
        slug: "#",
        excerpt: "Evidence-based strategies for creating lasting health routines and breaking bad habits for good.",
        category: "Lifestyle",
        readTime: "4 min read",
        date: "Mar 8, 2024",
        imageUrl: null
    },
    {
        id: "fallback-6",
        title: "The Gut-Brain Connection: Latest Findings",
        slug: "#",
        excerpt: "New research reveals how your gut microbiome influences mood, cognition, and overall well-being.",
        category: "Research",
        readTime: "9 min read",
        date: "Mar 12, 2024",
        imageUrl: null
    }
]

export default function MedicalBlogUI({ posts, bookmarkedArticleIds = [] }: { posts: SanityPost[], bookmarkedArticleIds?: string[] }) {
    const [searchQuery, setSearchQuery] = React.useState("")
    const [activeCategory, setActiveCategory] = React.useState("All")
    const [currentPage, setCurrentPage] = React.useState(1)

    const handleCategoryChange = React.useCallback((cat: string) => {
        setActiveCategory(cat)
        setCurrentPage(1)
    }, [])

    const mappedArticles = React.useMemo(() =>
        posts.map((post, index) => {
            const displayDate = post.publishedAt || post._createdAt || new Date("2024-01-01").toISOString()
            const readingTime = calculateReadingTime(post.body)
            return {
                id: post._id,
                title: post.title,
                slug: post.slug?.current || '#',
                excerpt: "Read this full article in our Medical Insights portal. Discover evidence-based insights and latest research findings.",
                category: CATEGORIES[1 + (index % (CATEGORIES.length - 1))],
                readTime: `${readingTime} min read`,
                date: new Date(displayDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
                imageUrl: post.image ? urlFor(post.image).width(800).height(500).url() : null
            }
        }),
        [posts]
    )

    const articlesToDisplay = mappedArticles.length > 0 ? mappedArticles : FALLBACK_ARTICLES

    const filteredArticles = React.useMemo(() =>
        articlesToDisplay.filter((article) => {
            const matchesCategory = activeCategory === "All" || article.category === activeCategory
            const matchesSearch = article.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                article.excerpt.toLowerCase().includes(searchQuery.toLowerCase())
            return matchesCategory && matchesSearch
        }),
        [articlesToDisplay, activeCategory, searchQuery]
    )

    const totalPages = Math.max(1, Math.ceil(filteredArticles.length / POSTS_PER_PAGE))

    const paginatedArticles = React.useMemo(() =>
        filteredArticles.slice(
            (currentPage - 1) * POSTS_PER_PAGE,
            currentPage * POSTS_PER_PAGE
        ),
        [filteredArticles, currentPage]
    )

    React.useEffect(() => { setCurrentPage(1) }, [searchQuery])

    return (
        <div className="flex min-h-screen flex-col bg-background text-foreground">
            <Navbar />

            <main className="flex-1">
                {/* ─── HERO SECTION ─── */}
                <section id="home" className="relative w-full pt-12 pb-10 md:pt-16 md:pb-14  overflow-hidden">
                    <DotPattern
                        width={14}
                        height={14}
                        cx={1}
                        cy={1}
                        cr={1.2}
                        className="fill-black/[0.15] dark:fill-white/[0.15] text-black/[0.15] dark:text-white/[0.15] [mask-image:linear-gradient(to_bottom,black_30%,transparent)] "
                    />
                    <div className="relative z-10 max-w-[1200px] mx-auto px-6">
                        <h1 className="text-[32px] md:text-[58px] font-extrabold leading-[1.15] tracking-tight mb-6">
                            Got a Health question?
                            <br />
                            Ask Komal.
                        </h1>

                        {/* Search Bar */}
                        <div className="flex items-center gap-0 max-w-[500px] mb-5">
                            <Input
                                type="text"
                                placeholder="Search articles..."
                                className="h-12 rounded-r-none border-r-0 bg-card text-base"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                            <Button
                                className="h-12 rounded-l-none px-6 text-base font-medium"
                            >
                                Search
                            </Button>
                        </div>

                        <p className="text-muted-foreground text-base leading-relaxed max-w-[520px]">
                            Your go-to source for evidence-based medical insights. We&apos;ve got wellness tips that actually work, research breakdowns that make sense, and health guides to live your best life.
                        </p>
                    </div>
                </section>

                {/* ─── CATEGORY TABS ─── */}
                <section className="w-full ">
                    <div className="max-w-[1200px] mx-auto px-6 overflow-x-auto">
                        <div className="flex items-center justify-center gap-3 py-5">
                            {CATEGORIES.map((cat) => (
                                <button
                                    key={cat}
                                    onClick={() => handleCategoryChange(cat)}
                                    className={cn(
                                        "px-5 py-2 rounded-full text-sm font-medium border transition-all duration-200 ease-out whitespace-nowrap",
                                        "active:scale-95",
                                        activeCategory === cat
                                            ? "bg-foreground text-background border-foreground shadow-sm"
                                            : "bg-background text-foreground border-border hover:border-muted-foreground hover:bg-muted/50"
                                    )}
                                >
                                    {cat}
                                </button>
                            ))}
                        </div>
                    </div>
                </section>

                {/* ─── ARTICLES GRID ─── */}
                <section id="articles" className="w-full py-10">
                    <div className="max-w-[1200px] mx-auto px-6">
                        <div className="grid gap-8 lg:grid-cols-[1fr_300px]">
                            {/* Main Grid */}
                            <div>
                                {paginatedArticles.length > 0 ? (
                                    <div className="grid gap-x-6 gap-y-8 sm:grid-cols-2 lg:grid-cols-3 card-stagger">
                                        {paginatedArticles.map((article) => (
                                            <Link href={`/post/${article.slug}`} key={article.id} className="group">
                                                <article className="flex flex-col rounded-2xl overflow-hidden bg-card shadow-[0_1px_3px_rgba(0,0,0,0.08)] hover:shadow-[0_8px_30px_rgba(0,0,0,0.12)] hover:-translate-y-1 transition-all duration-300 ease-out">
                                                    {/* Card Image */}
                                                    <div className="relative w-full aspect-[16/11] bg-secondary overflow-hidden">
                                                        {article.imageUrl ? (
                                                            <Image
                                                                src={article.imageUrl}
                                                                alt={article.title}
                                                                fill
                                                                className="object-cover group-hover:scale-[1.03] transition-transform duration-500 ease-out"
                                                                sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                                                            />
                                                        ) : (
                                                            <div className="flex items-center justify-center h-full">
                                                                <Stethoscope className="h-12 w-12 text-muted-foreground/20" />
                                                            </div>
                                                        )}
                                                        {/* Category Badge & Bookmark */}
                                                        <div className="absolute bottom-3 left-3 right-3 flex items-end justify-between z-10">
                                                            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-background/80 backdrop-blur-sm text-foreground">
                                                                <span className="w-2 h-2 rounded-full bg-foreground/70" />
                                                                {article.category}
                                                            </span>
                                                            <BookmarkButton
                                                                articleId={article.id}
                                                                initialIsBookmarked={bookmarkedArticleIds.includes(article.id)}
                                                            />
                                                        </div>
                                                    </div>
                                                    {/* Card Content */}
                                                    <div className="p-5 flex flex-col flex-1">
                                                        <h3 className="font-semibold text-base leading-snug tracking-tight mb-2 group-hover:text-foreground/80 transition-colors">
                                                            {article.title}
                                                        </h3>
                                                        <p className="text-xs text-muted-foreground mt-auto" suppressHydrationWarning>
                                                            {article.date} &bull; {article.readTime}
                                                        </p>
                                                    </div>
                                                </article>
                                            </Link>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="flex flex-col items-center justify-center py-20 text-center animate-fade-in-up">
                                        <Search className="h-10 w-10 text-muted-foreground/40 mb-4" />
                                        <h3 className="text-base font-semibold mb-1">No articles found</h3>
                                        <p className="text-sm text-muted-foreground">Try a different search or category.</p>
                                    </div>
                                )}

                                {/* Pagination */}
                                {totalPages > 1 && (
                                    <div className="flex items-center justify-start gap-1.5 mt-12">
                                        <Button
                                            variant="outline"
                                            size="icon"
                                            onClick={() => { setCurrentPage(Math.max(1, currentPage - 1)) }}
                                            disabled={currentPage === 1}
                                            className="h-8 w-8 text-xs"
                                        >
                                            <ChevronLeft className="h-3.5 w-3.5" />
                                        </Button>
                                        {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => {
                                            if (totalPages <= 7 || page === 1 || page === totalPages || Math.abs(page - currentPage) <= 1) {
                                                return (
                                                    <button
                                                        key={page}
                                                        onClick={() => { setCurrentPage(page) }}
                                                        className={cn(
                                                            "h-8 w-8 rounded-md text-[13px] font-medium transition-colors",
                                                            currentPage === page
                                                                ? "bg-foreground text-background"
                                                                : "text-muted-foreground hover:text-foreground"
                                                        )}
                                                    >
                                                        {page}
                                                    </button>
                                                )
                                            }
                                            if (page === 2 && currentPage > 3) {
                                                return <span key="dots-start" className="px-1 text-muted-foreground text-xs">...</span>
                                            }
                                            if (page === totalPages - 1 && currentPage < totalPages - 2) {
                                                return <span key="dots-end" className="px-1 text-muted-foreground text-xs">...</span>
                                            }
                                            return null
                                        })}
                                        <Button
                                            variant="outline"
                                            size="icon"
                                            onClick={() => { setCurrentPage(Math.min(totalPages, currentPage + 1)) }}
                                            disabled={currentPage === totalPages}
                                            className="h-8 w-8 text-xs"
                                        >
                                            <ChevronRight className="h-3.5 w-3.5" />
                                        </Button>
                                    </div>
                                )}
                            </div>

                            {/* Sidebar */}
                            <aside className="hidden lg:block">
                                <div className="sticky top-16 bg-card border border-border rounded-lg p-6 space-y-4">
                                    <h4 className="font-bold text-base">Hey, Reader!</h4>

                                    <p className="text-[13px] text-muted-foreground leading-relaxed">
                                        Struggling with health questions, conflicting advice, or information overload? We got you.
                                    </p>

                                    <p className="text-[13px] text-muted-foreground leading-relaxed">
                                        At Komal&apos;s Blog, we create free, easy-to-read articles backed by real medical research and expert insights.
                                    </p>

                                    <p className="text-[13px] text-muted-foreground leading-relaxed">
                                        Our articles simplify your research and deliver results faster. Get better answers, close knowledge gaps, and stay ahead of the curve.
                                    </p>

                                    <div className="space-y-1.5 text-[13px]">
                                        <p className="font-semibold">📌 What You&apos;ll Find Here:</p>
                                        <p>✅ Evidence-Based Health Insights</p>
                                        <p>✅ Wellness Tips That Actually Work</p>
                                        <p>✅ Latest Medical Research Simplified</p>
                                        <p>✅ Nutrition &amp; Lifestyle Guides</p>
                                        <p>✅ Expert-Reviewed Content</p>
                                    </div>

                                    <p className="text-[13px] text-muted-foreground">
                                        🧠 Stay informed. Stay healthy. Read Komal&apos;s Blog.
                                    </p>

                                    <p className="text-sm font-semibold">
                                        Better Health with Komal&apos;s Blog
                                    </p>
                                </div>
                            </aside>
                        </div>
                    </div>
                </section>
            </main>

            {/* ─── FOOTER ─── */}
            <footer className="w-full border-t border-border bg-background">
                <div className="max-w-[1200px] mx-auto px-6 py-10">
                    <div className="grid gap-8 md:grid-cols-[1fr_auto]">
                        <div className="space-y-3">
                            <div className="flex items-center gap-2.5">
                                <div className="h-8 w-8 rounded-md bg-foreground flex items-center justify-center">
                                    <Stethoscope className="h-4 w-4 text-background" />
                                </div>
                                <span className="font-bold text-base tracking-tight">Komal&apos;s Blog</span>
                            </div>
                            <p className="text-[13px] text-muted-foreground max-w-sm leading-relaxed">
                                Welcome to Komal&apos;s Blog, your free library of health insights and wellness guides. Evidence-based content you can trust.
                            </p>
                        </div>
                        <div>
                            <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3">Links</h3>
                            <nav className="space-y-2 text-[13px]">
                                <a href="#home" className="block text-muted-foreground hover:text-foreground transition-colors">Home</a>
                                <a href="#articles" className="block text-muted-foreground hover:text-foreground transition-colors">Articles</a>
                            </nav>
                        </div>
                    </div>
                    <div className="mt-8 pt-6 border-t border-border flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-muted-foreground">
                        <p suppressHydrationWarning>&copy; {new Date().getFullYear()} — Komal&apos;s Blog. All Rights Reserved.</p>
                        <p>
                            Made by <a href="https://www.prakashjha.com" target="_blank" rel="noopener noreferrer" className="font-medium hover:text-foreground transition-colors underline underline-offset-4"> ❤️ Prakashjha</a>
                        </p>
                    </div>
                </div>
            </footer>
        </div>
    )
}
