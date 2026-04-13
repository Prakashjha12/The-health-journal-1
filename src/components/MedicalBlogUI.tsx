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
import { useRouter, usePathname } from "next/navigation"
import { Copyright } from "@/components/ui/Copyright"
import { FormattedDate } from "@/components/ui/FormattedDate"

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
    categories?: { title: string }[]
    body?: unknown[]
}

const POSTS_PER_PAGE = 6

const FALLBACK_ARTICLES = [
    {
        id: "fallback-1",
        title: "Understanding Cardiovascular Health in Modern Medicine",
        slug: "#",
        excerpt: "Explore the latest research on heart health, preventive measures, and innovative treatments that are shaping modern cardiology.",
        category: "Health",
        readTime: "8 min read",
        date: "2024-01-15",
        imageUrl: null
    },
    {
        id: "fallback-2",
        title: "The Science of Mindfulness and Mental Wellness",
        slug: "#",
        excerpt: "How mindfulness practices are backed by neuroscience research to improve mental health outcomes.",
        category: "Wellness",
        readTime: "6 min read",
        date: "2024-02-10",
        imageUrl: null
    },
    {
        id: "fallback-3",
        title: "Nutritional Genomics: Eating for Your DNA",
        slug: "#",
        excerpt: "Personalized nutrition based on genetic profiles is the future of dietary science and wellness.",
        category: "Nutrition",
        readTime: "5 min read",
        date: "2024-03-01",
        imageUrl: null
    },
    {
        id: "fallback-4",
        title: "AI-Driven Drug Discovery Breakthroughs in 2024",
        slug: "#",
        excerpt: "How artificial intelligence is accelerating the development of new medications and therapies worldwide.",
        category: "Research",
        readTime: "7 min read",
        date: "2024-03-05",
        imageUrl: null
    },
    {
        id: "fallback-5",
        title: "Building Sustainable Health Habits That Last",
        slug: "#",
        excerpt: "Evidence-based strategies for creating lasting health routines and breaking bad habits for good.",
        category: "Lifestyle",
        readTime: "4 min read",
        date: "2024-03-08",
        imageUrl: null
    },
    {
        id: "fallback-6",
        title: "The Gut-Brain Connection: Latest Findings",
        slug: "#",
        excerpt: "New research reveals how your gut microbiome influences mood, cognition, and overall well-being.",
        category: "Research",
        readTime: "9 min read",
        date: "2024-03-12",
        imageUrl: null
    }
]

export default function MedicalBlogUI({
    posts,
    bookmarkedArticleIds = [],
    initialQuery = "",
    initialCategory = "All"
}: {
    posts: SanityPost[],
    bookmarkedArticleIds?: string[],
    initialQuery?: string,
    initialCategory?: string
}) {
    const router = useRouter()
    const pathname = usePathname()
    const [searchQuery, setSearchQuery] = React.useState(initialQuery)
    const [activeCategory, setActiveCategory] = React.useState(initialCategory)
    const [currentPage, setCurrentPage] = React.useState(1)

    // Sync state with props when they change (e.g. browser back button)
    React.useEffect(() => {
        setSearchQuery(initialQuery)
        setActiveCategory(initialCategory)
    }, [initialQuery, initialCategory])

    // Extract dynamic categories from Sanity posts, with a fallback
    const dynamicCategories = React.useMemo(() => {
        const extracted = new Set<string>()
        posts.forEach(post => {
            if (post.categories && post.categories.length > 0) {
                post.categories.forEach(cat => {
                    if (cat.title) extracted.add(cat.title)
                })
            }
        })
        const cats = Array.from(extracted)
        if (initialCategory !== "All") extracted.add(initialCategory)
        return ["All", ...(cats.length > 0 ? Array.from(extracted) : ["Health", "Wellness", "Research", "Lifestyle", "Nutrition"])]
    }, [posts, initialCategory])

    const updateFilters = (query: string, category: string) => {
        const params = new URLSearchParams()
        if (query) params.set("query", query)
        if (category !== "All") params.set("category", category)
        router.push(`${pathname}?${params.toString()}`, { scroll: false })
    }

    const handleCategoryChange = (cat: string) => {
        setActiveCategory(cat)
        setCurrentPage(1)
        updateFilters(searchQuery, cat)
    }

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault()
        setCurrentPage(1)
        updateFilters(searchQuery, activeCategory)
    }

    const mappedArticles = React.useMemo(() =>
        posts.map((post) => {
            const displayDate = post.publishedAt || post._createdAt || "2024-01-01"
            const readingTime = calculateReadingTime(post.body)
            const postCategory = post.categories && post.categories.length > 0 && post.categories[0].title
                ? post.categories[0].title
                : "Health"

            return {
                id: post._id,
                title: post.title,
                slug: post.slug?.current || '#',
                excerpt: "Read this full article in our Medical Insights portal.",
                category: postCategory,
                readTime: `${readingTime} min read`,
                date: displayDate,
                image: post.image,
                imageUrl: post.image ? urlFor(post.image).width(800).height(500).url() : null
            }
        }),
        [posts]
    )

    const articlesToDisplay = mappedArticles.length > 0 ? mappedArticles : (initialQuery || initialCategory !== "All" ? [] : FALLBACK_ARTICLES)

    const totalPages = Math.max(1, Math.ceil(articlesToDisplay.length / POSTS_PER_PAGE))

    const paginatedArticles = React.useMemo(() =>
        articlesToDisplay.slice(
            (currentPage - 1) * POSTS_PER_PAGE,
            currentPage * POSTS_PER_PAGE
        ),
        [articlesToDisplay, currentPage]
    )

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
                    <div className="relative z-10 max-w-[1200px] mx-auto px-6 cursor-default">
                        <div className="mb-10 px-4 md:px-0">
                            <h1 className="text-[36px] md:text-[68px] font-extrabold leading-[1.1] tracking-tighter text-zinc-900 dark:text-zinc-50 transition-colors duration-300">
                                The Health Journal
                            </h1>
                            <p className="text-[18px] md:text-[26px] mt-4 font-medium leading-tight text-zinc-600 dark:text-zinc-400 max-w-2xl">
                                Got a health question?
                                <span className="block md:inline ml-0 md:ml-2 text-primary-600 dark:text-blue-400">
                                    Get evidence-based answers.
                                </span>
                            </p>
                            <div className="mt-8 h-[1px] w-full bg-zinc-200 dark:bg-zinc-800" />
                        </div>

                        <form onSubmit={handleSearch} className="flex items-center gap-0 max-w-[500px] mb-5">
                            <Input
                                type="text"
                                placeholder="Search articles..."
                                className="h-12 rounded-r-none border-r-0 bg-card text-base"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                            <Button type="submit" className="h-12 rounded-l-none px-6 text-base font-medium">
                                Search
                            </Button>
                        </form>

                        <p className="text-muted-foreground text-base leading-relaxed max-w-[520px]">
                            Your go-to source for evidence-based medical insights. We&apos;ve got wellness tips that actually work, research breakdowns that make sense, and health guides to live your best life.
                        </p>
                    </div>
                </section>

                {/* ─── CATEGORY TABS ─── */}
                <section className="w-full ">
                    <div className="max-w-[1200px] mx-auto px-6 overflow-x-auto">
                        <div className="flex items-center justify-center gap-3 py-5">
                            {dynamicCategories.map((cat) => (
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

                {/* ─── ARTICLES SECTION ─── */}
                <section id="articles" className="w-full py-10">
                    <div className="max-w-[1200px] mx-auto px-6">
                        <div className="grid gap-8 lg:grid-cols-[1fr_300px]">
                            <div>
                                {articlesToDisplay.length === 0 ? (
                                    <div className="flex flex-col items-center justify-center py-20 text-center animate-fade-in-up">
                                        <Search className="h-10 w-10 text-muted-foreground/40 mb-4" />
                                        <h3 className="text-base font-semibold mb-1">No articles found</h3>
                                        <p className="text-sm text-muted-foreground">Try a different search or category.</p>
                                    </div>
                                ) : (
                                    <>
                                        {/* ─── FEATURED ARTICLE ─── */}
                                        {articlesToDisplay.length > 0 && (() => {
                                            const featured = articlesToDisplay[0]
                                            return (
                                                <Link href={`/post/${featured.slug}`} className="group block mb-10">
                                                    <article className="relative flex flex-col rounded-2xl overflow-hidden bg-card border border-border/40 shadow-[0_2px_8px_rgba(0,0,0,0.08)] transform-gpu backface-hidden">
                                                        <div className="relative w-full aspect-video bg-secondary overflow-hidden -mb-px">
                                                            {featured.imageUrl ? (
                                                                <Image
                                                                    src={featured.image ? urlFor(featured.image).width(1000).quality(80).auto('format').url() : ""}
                                                                    alt={featured.title}
                                                                    fill
                                                                    className="object-cover"
                                                                    priority
                                                                    sizes="(max-width: 768px) 100vw, (max-width: 1024px) 70vw, 1000px"
                                                                />
                                                            ) : (
                                                                <div className="flex items-center justify-center h-full">
                                                                    <Stethoscope className="h-16 w-16 text-muted-foreground/20" />
                                                                </div>
                                                            )}
                                                            <div className="absolute top-4 left-4 z-10">
                                                                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-foreground/90 backdrop-blur-sm text-background tracking-wide">
                                                                    FEATURED · {featured.category.toUpperCase()}
                                                                </span>
                                                            </div>
                                                            <div className="absolute top-3 right-3 z-10">
                                                                <BookmarkButton
                                                                    articleId={featured.id}
                                                                    initialIsBookmarked={bookmarkedArticleIds.includes(featured.id)}
                                                                />
                                                            </div>
                                                            <div className="absolute inset-x-0 -bottom-px h-32 bg-linear-to-t from-card via-card/70 to-transparent z-10 pointer-events-none" />
                                                        </div>

                                                        <div className="flex flex-col gap-3 p-6 md:p-8">
                                                            <p className="text-xs text-muted-foreground font-medium tracking-widest uppercase">
                                                                <FormattedDate date={featured.date} options={{ month: 'long', day: 'numeric', year: 'numeric' }} /> &nbsp;·&nbsp; {featured.readTime}
                                                            </p>
                                                            <h2 className="text-xl md:text-2xl font-extrabold leading-snug tracking-tight group-hover:text-primary transition-colors line-clamp-2">
                                                                {featured.title}
                                                            </h2>
                                                            <p className="text-sm text-muted-foreground leading-relaxed line-clamp-2">
                                                                {featured.excerpt}
                                                            </p>
                                                            <div className="flex items-center gap-1.5 text-sm font-semibold text-foreground group-hover:text-primary transition-colors mt-1 pt-2 border-t border-border/50">
                                                                Read Article
                                                                <span className="group-hover:translate-x-1 transition-transform duration-200 inline-block">→</span>
                                                            </div>
                                                        </div>
                                                    </article>
                                                </Link>
                                            )
                                        })()}

                                        {/* ─── LATEST ARTICLES GRID ─── */}
                                        {articlesToDisplay.length > 1 && (
                                            <>
                                                <h3 className="text-xs font-semibold tracking-widest text-muted-foreground uppercase mb-5">
                                                    Recent Articles
                                                </h3>
                                                {(() => {
                                                    const rest = articlesToDisplay.slice(1)
                                                    const startIdx = (currentPage - 1) * POSTS_PER_PAGE
                                                    const paginated = rest.slice(startIdx, startIdx + POSTS_PER_PAGE)

                                                    return (
                                                        <div className="grid gap-x-6 gap-y-8 sm:grid-cols-2 lg:grid-cols-3">
                                                            {paginated.map((article) => (
                                                                <Link href={`/post/${article.slug}`} key={article.id} className="group">
                                                                    <article className="flex flex-col rounded-2xl overflow-hidden bg-card border border-border/40 shadow-[0_1px_3px_rgba(0,0,0,0.08)] hover:shadow-[0_8px_30px_rgba(0,0,0,0.14)] dark:hover:shadow-[0_8px_30px_rgba(255,255,255,0.08)] hover:-translate-y-1 transition-all duration-300 ease-out h-full">
                                                                        <div className="relative w-full aspect-16/11 bg-secondary overflow-hidden">
                                                                            {article.imageUrl ? (
                                                                                <Image
                                                                                    src={article.imageUrl}
                                                                                    alt={article.title}
                                                                                    fill
                                                                                    className="object-cover transition-transform duration-500 ease-out"
                                                                                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                                                                                />
                                                                            ) : (
                                                                                <div className="flex items-center justify-center h-full">
                                                                                    <Stethoscope className="h-12 w-12 text-muted-foreground/20" />
                                                                                </div>
                                                                            )}
                                                                            <div className="absolute bottom-3 left-3 right-3 flex items-end justify-between z-10">
                                                                                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-background/80 backdrop-blur-sm text-foreground">
                                                                                    {article.category}
                                                                                </span>
                                                                                <BookmarkButton
                                                                                    articleId={article.id}
                                                                                    initialIsBookmarked={bookmarkedArticleIds.includes(article.id)}
                                                                                />
                                                                            </div>
                                                                        </div>
                                                                        <div className="p-5 flex flex-col flex-1">
                                                                            <h3 className="font-semibold text-base leading-snug tracking-tight mb-2 group-hover:text-foreground/80 transition-colors line-clamp-2">
                                                                                {article.title}
                                                                            </h3>
                                                                            <p className="text-xs text-muted-foreground mt-auto">
                                                                                <FormattedDate date={article.date} /> &bull; {article.readTime}
                                                                            </p>
                                                                        </div>
                                                                    </article>
                                                                </Link>
                                                            ))}
                                                        </div>
                                                    )
                                                })()}
                                            </>
                                        )}

                                        {/* Pagination */}
                                        {(() => {
                                            const restTotal = Math.max(0, articlesToDisplay.length - 1)
                                            const pages = Math.max(1, Math.ceil(restTotal / POSTS_PER_PAGE))
                                            if (pages <= 1) return null
                                            return (
                                                <div className="flex items-center justify-start gap-1.5 mt-12">
                                                    <Button variant="outline" size="icon" onClick={() => setCurrentPage(Math.max(1, currentPage - 1))} disabled={currentPage === 1} className="h-8 w-8 text-xs">
                                                        <ChevronLeft className="h-3.5 w-3.5" />
                                                    </Button>
                                                    {Array.from({ length: pages }, (_, i) => i + 1).map((page) => {
                                                        if (pages <= 7 || page === 1 || page === pages || Math.abs(page - currentPage) <= 1) {
                                                            return (
                                                                <button key={page} onClick={() => setCurrentPage(page)} className={cn("h-8 w-8 rounded-md text-[13px] font-medium transition-colors", currentPage === page ? "bg-foreground text-background" : "text-muted-foreground hover:text-foreground")}>
                                                                    {page}
                                                                </button>
                                                            )
                                                        }
                                                        if (page === 2 && currentPage > 3) return <span key="dots-start" className="px-1 text-muted-foreground text-xs">...</span>
                                                        if (page === pages - 1 && currentPage < pages - 2) return <span key="dots-end" className="px-1 text-muted-foreground text-xs">...</span>
                                                        return null
                                                    })}
                                                    <Button variant="outline" size="icon" onClick={() => setCurrentPage(Math.min(pages, currentPage + 1))} disabled={currentPage === pages} className="h-8 w-8 text-xs">
                                                        <ChevronRight className="h-3.5 w-3.5" />
                                                    </Button>
                                                </div>
                                            )
                                        })()}
                                    </>
                                )}
                            </div>

                            {/* Sidebar */}
                            <aside className="hidden lg:block">
                                <div className="sticky top-16 bg-card border border-border rounded-lg p-6 space-y-4">
                                    <h4 className="font-bold text-base">Hey, Reader!</h4>
                                    <p className="text-[13px] text-muted-foreground leading-relaxed">Struggling with health questions? We got you.</p>
                                    <p className="text-[13px] text-muted-foreground leading-relaxed">At The Health Journal, we create free, easy-to-read articles backed by real medical research.</p>
                                    <div className="space-y-1.5 text-[13px]">
                                        <p className="font-semibold">📌 What You&apos;ll Find Here:</p>
                                        <p>✅ Evidence-Based Health Insights</p>
                                        <p>✅ Wellness Tips That Actually Work</p>
                                        <p>✅ Latest Medical Research Simplified</p>
                                    </div>
                                    <p className="text-sm font-semibold">Better Health with The Health Journal</p>
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
                                <div className="relative h-8 w-8 shrink-0">
                                    <Image src="/LOGO.webp" alt="Logo" width={32} height={32} className="object-contain" />
                                </div>
                                <span className="font-bold text-base tracking-tight">The Health Journal</span>
                            </div>
                            <p className="text-[13px] text-muted-foreground max-w-sm leading-relaxed">
                                Welcome to The Health Journal, your free library of health insights and wellness guides.
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

                    <div className="mt-8 mb-4 p-4 rounded-lg bg-muted/50 border border-border/50 text-center">
                        <p className="text-xs text-muted-foreground leading-relaxed">
                            <span className="font-semibold text-foreground/80">Disclaimer:</span> The content on this site is for informational purposes only.
                        </p>
                    </div>

                    <div className="mt-8 pt-6 border-t border-border flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-muted-foreground">
                        <p><Copyright /></p>
                        <p>Made with ❤️ by <a href="https://www.prakashjha.com" target="_blank" rel="noopener noreferrer" className="font-medium hover:text-foreground underline">Prakashjha</a></p>
                    </div>
                </div>
            </footer>
        </div>
    )
}
