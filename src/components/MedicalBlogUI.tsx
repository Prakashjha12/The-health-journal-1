"use client"

import * as React from "react"
import {
    Search, Stethoscope, ChevronLeft, ChevronRight, FileText, ArrowRight, X
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { DotPattern } from "@/components/ui/dot-pattern"
import { cn, calculateReadingTime } from "@/lib/utils"
import Link from "next/link"
import Image from "next/image"
import { urlFor } from "@/sanity/lib/image"
import { Navbar } from "@/components/Navbar"
import { Footer } from "@/components/Footer"
import { BookmarkButton } from "@/components/BookmarkButton"
import { useRouter, usePathname } from "next/navigation"
import { FormattedDate } from "@/components/ui/FormattedDate"
import gsap from "gsap"
import { useGSAP } from "@gsap/react"

gsap.registerPlugin(useGSAP)

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

interface SearchSuggestion {
    _id: string
    title: string
    slug: string
    categories?: { title: string }[]
}

export default function MedicalBlogUI({
    posts,
    allCategories = [],
    searchSuggestions = [],
    bookmarkedArticleIds = [],
    initialQuery = "",
    initialCategory = "All"
}: {
    posts: SanityPost[],
    allCategories?: string[],
    searchSuggestions?: SearchSuggestion[],
    bookmarkedArticleIds?: string[],
    initialQuery?: string,
    initialCategory?: string
}) {
    const router = useRouter()
    const pathname = usePathname()
    const [searchQuery, setSearchQuery] = React.useState(initialQuery)
    const [activeCategory, setActiveCategory] = React.useState(initialCategory)
    const [currentPage, setCurrentPage] = React.useState(1)

    const [isSuggestionsOpen, setIsSuggestionsOpen] = React.useState(false)
    const [highlightedIndex, setHighlightedIndex] = React.useState(-1)
    const searchContainerRef = React.useRef<HTMLDivElement>(null)

    const categoryScrollRef = React.useRef<HTMLDivElement>(null)
    const activeCategoryRef = React.useRef<HTMLButtonElement>(null)
    const heroRef = React.useRef<HTMLDivElement>(null)
    const articlesSectionRef = React.useRef<HTMLDivElement>(null)
    const scrollTimerRef = React.useRef<ReturnType<typeof setTimeout> | null>(null)
    const [canScrollLeft, setCanScrollLeft] = React.useState(false)
    const [canScrollRight, setCanScrollRight] = React.useState(false)

    // Compute live suggestions from published articles
    const suggestions = React.useMemo(() => {
        const q = searchQuery.trim().toLowerCase()
        if (!q || q.length === 0) return []

        return searchSuggestions
            .filter((item) => {
                const titleMatch = item.title?.toLowerCase().includes(q)
                const catMatch = item.categories?.some((c) => c.title?.toLowerCase().includes(q))
                return titleMatch || catMatch
            })
            .slice(0, 5)
    }, [searchQuery, searchSuggestions])

    // Close suggestions on click outside
    React.useEffect(() => {
        const handleClickOutside = (e: MouseEvent) => {
            if (searchContainerRef.current && !searchContainerRef.current.contains(e.target as Node)) {
                setIsSuggestionsOpen(false)
                setHighlightedIndex(-1)
            }
        }
        document.addEventListener("mousedown", handleClickOutside)
        return () => document.removeEventListener("mousedown", handleClickOutside)
    }, [])

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (!isSuggestionsOpen || suggestions.length === 0) {
            if (e.key === "ArrowDown" && searchQuery.trim().length > 0) {
                setIsSuggestionsOpen(true)
            }
            return
        }

        if (e.key === "ArrowDown") {
            e.preventDefault()
            setHighlightedIndex((prev) => (prev < suggestions.length - 1 ? prev + 1 : 0))
        } else if (e.key === "ArrowUp") {
            e.preventDefault()
            setHighlightedIndex((prev) => (prev > 0 ? prev - 1 : suggestions.length - 1))
        } else if (e.key === "Enter" && highlightedIndex >= 0 && highlightedIndex < suggestions.length) {
            e.preventDefault()
            const selected = suggestions[highlightedIndex]
            setIsSuggestionsOpen(false)
            router.push(`/post/${selected.slug}`)
        } else if (e.key === "Escape") {
            setIsSuggestionsOpen(false)
            setHighlightedIndex(-1)
        }
    }

    // GSAP Micro-animations: Hero Entrance
    useGSAP(
        () => {
            const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches
            if (prefersReducedMotion) return

            gsap.from(
                [".gsap-hero-title", ".gsap-hero-subtitle", ".gsap-hero-divider", ".gsap-hero-search", ".gsap-hero-desc"],
                {
                    y: 16,
                    opacity: 0,
                    duration: 0.65,
                    stagger: 0.07,
                    ease: "power2.out",
                    clearProps: "all"
                }
            )
        },
        { scope: heroRef }
    )

    // GSAP Micro-animations: Articles Stagger Reveal on Category/Page update
    useGSAP(
        () => {
            const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches
            if (prefersReducedMotion) return

            const targets = articlesSectionRef.current?.querySelectorAll(".gsap-fade-item")
            if (targets && targets.length > 0) {
                gsap.fromTo(
                    targets,
                    { y: 14, opacity: 0 },
                    {
                        y: 0,
                        opacity: 1,
                        duration: 0.4,
                        stagger: 0.04,
                        ease: "power2.out",
                        clearProps: "transform,opacity"
                    }
                )
            }
        },
        {
            scope: articlesSectionRef,
            dependencies: [activeCategory, currentPage, posts],
            revertOnUpdate: true
        }
    )

    // Sync state with props when they change (e.g. browser back button)
    React.useEffect(() => {
        setSearchQuery(initialQuery)
        setActiveCategory(initialCategory)
    }, [initialQuery, initialCategory])

    // Maintain complete categories list so choosing one doesn't make others disappear
    const categories = React.useMemo(() => {
        const seen = new Set<string>()
        const list: string[] = []

        const addCategory = (title: string) => {
            const norm = title.trim().toLowerCase()
            if (norm && !seen.has(norm)) {
                seen.add(norm)
                list.push(title)
            }
        }

        // 1. Add all categories fetched from Sanity
        allCategories.forEach(addCategory)

        // 2. Also ensure any categories on currently loaded posts are preserved
        posts.forEach(post => {
            post.categories?.forEach(cat => {
                if (cat.title) addCategory(cat.title)
            })
        })

        // 3. Ensure active/initial category is in the list
        if (initialCategory && initialCategory !== "All") {
            addCategory(initialCategory)
        }

        // 4. Default fallback if no categories exist
        if (list.length === 0) {
            return ["All", "ANXIETY", "Wellness", "Sleep & Technology", "mental health", "Nutrition & Metabolism", "Injury & Recovery", "Artificial Intelligence", "Physiological Regulation"]
        }

        return ["All", ...list]
    }, [allCategories, posts, initialCategory])

    const checkScrollability = React.useCallback(() => {
        const el = categoryScrollRef.current
        if (!el) return
        const { scrollLeft, scrollWidth, clientWidth } = el
        setCanScrollLeft(scrollLeft > 2)
        setCanScrollRight(scrollLeft + clientWidth < scrollWidth - 4)
    }, [])

    React.useEffect(() => {
        checkScrollability()
        const handleResize = () => checkScrollability()
        window.addEventListener("resize", handleResize)
        return () => window.removeEventListener("resize", handleResize)
    }, [checkScrollability, categories])

    const isCategoryActive = (cat: string) => {
        if (activeCategory === cat) return true
        if (activeCategory.trim().toLowerCase() === cat.trim().toLowerCase()) return true
        return false
    }

    React.useEffect(() => {
        return () => {
            if (scrollTimerRef.current) {
                clearTimeout(scrollTimerRef.current)
            }
        }
    }, [])

    const scrollCategories = (direction: "left" | "right") => {
        const el = categoryScrollRef.current
        if (!el) return
        const amount = Math.max(260, Math.floor(el.clientWidth * 0.6))
        el.scrollBy({
            left: direction === "left" ? -amount : amount,
            behavior: "smooth"
        })
        if (scrollTimerRef.current) clearTimeout(scrollTimerRef.current)
        scrollTimerRef.current = setTimeout(checkScrollability, 350)
    }

    React.useEffect(() => {
        if (activeCategoryRef.current) {
            activeCategoryRef.current.scrollIntoView({
                behavior: "smooth",
                block: "nearest",
                inline: "nearest"
            })
            if (scrollTimerRef.current) clearTimeout(scrollTimerRef.current)
            scrollTimerRef.current = setTimeout(checkScrollability, 350)
        }
    }, [activeCategory, checkScrollability])

    const updateFilters = (query: string, category: string) => {
        const params = new URLSearchParams()
        if (query) params.set("query", query)
        if (category !== "All") params.set("category", category)
        router.push(`${pathname}?${params.toString()}`, { scroll: false })
    }

    const handleCategoryChange = (cat: string) => {
        const nextCategory = (cat !== "All" && isCategoryActive(cat)) ? "All" : cat
        setActiveCategory(nextCategory)
        setCurrentPage(1)
        updateFilters(searchQuery, nextCategory)
    }

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault()
        setIsSuggestionsOpen(false)
        setHighlightedIndex(-1)
        setCurrentPage(1)
        updateFilters(searchQuery, activeCategory)
    }

    const handlePageChange = (newPage: number) => {
        setCurrentPage(newPage)
        const target = document.getElementById("recent-articles") || document.getElementById("articles")
        if (target) {
            const yOffset = -80
            const y = target.getBoundingClientRect().top + window.scrollY + yOffset
            window.scrollTo({ top: Math.max(0, y), behavior: "smooth" })
        }
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

    return (
        <div className="flex min-h-screen flex-col bg-background text-foreground">
            <Navbar />

            <main className="flex-1">
                {/* ─── HERO SECTION ─── */}
                <section id="home" className="relative z-30 w-full pt-12 pb-10 md:pt-16 md:pb-14">
                    <div className="absolute inset-0 overflow-hidden pointer-events-none">
                        <DotPattern
                            width={14}
                            height={14}
                            cx={1}
                            cy={1}
                            cr={1.2}
                            className="fill-black/15 dark:fill-white/15 text-black/15 dark:text-white/15 mask-[linear-gradient(to_bottom,black_30%,transparent)] "
                        />
                    </div>
                    <div className="sr-only">
                        <h2>The Health Journal: Evidence-based medical insights, wellness tips, and research breakdowns by healthcare professionals.</h2>
                    </div>
                    <div ref={heroRef} className=" relative z-10 max-w-300 mx-auto px-6 cursor-default ">
                        <div className="mb-10 px-4 md:px-0">
                            <h1 className="gsap-hero-title text-[36px] md:text-[68px] font-extrabold leading-[1.1] tracking-tighter text-zinc-900 dark:text-zinc-50 transition-colors duration-300">
                                The Health Journal
                            </h1>
                            <p className="gsap-hero-subtitle text-[18px] md:text-[26px] mt-4 font-medium leading-tight text-zinc-600 dark:text-zinc-400 max-w-2xl">
                                Got a health question?
                                <span className="block md:inline ml-0 md:ml-2 text-primary-600 dark:text-blue-400">
                                    Get evidence-based answers.
                                </span>
                            </p>
                            <div className="gsap-hero-divider mt-8 h-px w-full bg-zinc-200 dark:bg-zinc-800" />
                        </div>

                        {/* Search Bar with Live Suggestions Dropdown */}
                        <div ref={searchContainerRef} className="gsap-hero-search relative max-w-125 mb-5 z-40">
                            <form onSubmit={handleSearch} className="flex items-center gap-0 w-full relative">
                                <div className="relative flex-1">
                                    <Input
                                        type="text"
                                        placeholder="Search articles..."
                                        className="h-12 rounded-r-none border-r-0 bg-card text-base focus-visible:ring-1 transition-all pr-8"
                                        value={searchQuery}
                                        onChange={(e) => {
                                            setSearchQuery(e.target.value)
                                            setIsSuggestionsOpen(e.target.value.trim().length > 0)
                                            setHighlightedIndex(-1)
                                        }}
                                        onFocus={() => {
                                            if (searchQuery.trim().length > 0) {
                                                setIsSuggestionsOpen(true)
                                            }
                                        }}
                                        onKeyDown={handleKeyDown}
                                        autoComplete="off"
                                        aria-autocomplete="list"
                                        aria-expanded={isSuggestionsOpen && suggestions.length > 0}
                                    />
                                    {searchQuery && (
                                        <button
                                            type="button"
                                            onClick={() => {
                                                setSearchQuery("")
                                                setIsSuggestionsOpen(false)
                                                setHighlightedIndex(-1)
                                            }}
                                            className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground/60 hover:text-foreground p-1 rounded-full transition-colors cursor-pointer"
                                            aria-label="Clear search"
                                        >
                                            <X className="h-4 w-4" />
                                        </button>
                                    )}
                                </div>
                                <Button type="submit" className="h-12 rounded-l-none px-6 text-base font-medium active:scale-95 transition-transform shrink-0 cursor-pointer">
                                    Search
                                </Button>
                            </form>

                            {/* Floating Suggestions Dropdown */}
                            {isSuggestionsOpen && searchQuery.trim().length > 0 && (
                                <div className="absolute top-[calc(100%+6px)] left-0 right-0 bg-card/95 backdrop-blur-md border border-border/80 rounded-xl shadow-2xl overflow-hidden z-50">
                                    <div className="px-3.5 py-2 border-b border-border/50 text-[11px] font-semibold tracking-wider uppercase text-muted-foreground/80 flex items-center justify-between">
                                        <span>Related Articles ({suggestions.length})</span>
                                        <span className="text-[10px] font-normal lowercase text-muted-foreground/60">esc to close</span>
                                    </div>

                                    {suggestions.length > 0 ? (
                                        <ul className="max-h-75 overflow-y-auto divide-y divide-border/30">
                                            {suggestions.map((item, idx) => {
                                                const categoryTitle = item.categories && item.categories.length > 0 ? item.categories[0].title : null
                                                const isHighlighted = idx === highlightedIndex

                                                return (
                                                    <li key={item._id}>
                                                        <Link
                                                            href={`/post/${item.slug}`}
                                                            onClick={() => {
                                                                setIsSuggestionsOpen(false)
                                                                setHighlightedIndex(-1)
                                                            }}
                                                            onMouseEnter={() => setHighlightedIndex(idx)}
                                                            className={cn(
                                                                "flex items-start gap-3 px-3.5 py-2.5 transition-colors group",
                                                                isHighlighted ? "bg-muted text-foreground" : "hover:bg-muted/60"
                                                            )}
                                                        >
                                                            <FileText className="h-4 w-4 text-muted-foreground shrink-0 mt-0.5 group-hover:text-primary transition-colors" />
                                                            <div className="flex-1 min-w-0">
                                                                <p className="text-sm font-medium leading-snug line-clamp-1 group-hover:text-primary transition-colors">
                                                                    {item.title}
                                                                </p>
                                                                {categoryTitle && (
                                                                    <span className="inline-block mt-0.5 text-[11px] text-muted-foreground">
                                                                        {categoryTitle.trim()}
                                                                    </span>
                                                                )}
                                                            </div>
                                                            <ArrowRight className="h-3.5 w-3.5 text-muted-foreground/40 shrink-0 mt-1 opacity-0 group-hover:opacity-100 transition-opacity" />
                                                        </Link>
                                                    </li>
                                                )
                                            })}
                                        </ul>
                                    ) : (
                                        <div className="p-4 text-center text-xs text-muted-foreground">
                                            No published articles found matching &ldquo;<span className="font-semibold text-foreground">{searchQuery}</span>&rdquo;
                                        </div>
                                    )}

                                    <div className="p-2 border-t border-border/50 bg-muted/20">
                                        <button
                                            type="button"
                                            onClick={handleSearch}
                                            className="w-full text-left px-3 py-1.5 rounded-lg text-xs font-medium text-muted-foreground hover:text-foreground hover:bg-muted/60 transition-colors flex items-center justify-between cursor-pointer"
                                        >
                                            <span>Search all results for &ldquo;{searchQuery}&rdquo;</span>
                                            <Search className="h-3.5 w-3.5" />
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>

                        <p className="gsap-hero-desc text-muted-foreground text-base leading-relaxed max-w-130">
                            Your go-to source for evidence-based medical insights. We&apos;ve got wellness tips that actually work, research breakdowns that make sense, and health guides to live your best life.
                        </p>
                    </div>
                </section>

                {/* ─── CATEGORY TABS ─── */}
                <section className="w-full sticky top-0 z-20 bg-background/95 backdrop-blur-sm border-b border-border/40">
                    <div className="max-w-300 mx-auto px-6">
                        <div className="relative flex items-center py-3 gap-2">
                            {/* Scrollable Categories List */}
                            <div
                                ref={categoryScrollRef}
                                onScroll={checkScrollability}
                                className="flex items-center gap-2.5 overflow-x-auto [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden scroll-smooth flex-nowrap flex-1 min-w-0"
                            >
                                {categories.map((cat) => {
                                    const isActive = isCategoryActive(cat)
                                    return (
                                        <button
                                            key={cat}
                                            ref={isActive ? activeCategoryRef : null}
                                            onClick={() => handleCategoryChange(cat)}
                                            className={cn(
                                                "px-5 py-2 rounded-full text-sm font-medium border transition-all shrink-0 whitespace-nowrap cursor-pointer",
                                                "active:scale-95 select-none",
                                                isActive
                                                    ? "bg-foreground text-background border-foreground shadow-sm"
                                                    : "bg-background text-foreground border-border hover:border-muted-foreground hover:bg-muted/50"
                                            )}
                                        >
                                            {cat.trim()}
                                        </button>
                                    )
                                })}
                            </div>

                            {/* Gradient Fade to visually blend categories behind the controls */}
                            <div
                                aria-hidden="true"
                                className={cn(
                                    "pointer-events-none absolute right-20 top-0 bottom-0 w-12 bg-linear-to-r from-transparent to-background/95 transition-opacity duration-200 hidden sm:block",
                                    canScrollRight ? "opacity-100" : "opacity-0"
                                )}
                            />

                            {/* Left and Right Arrow Buttons at the end ("in the last") */}
                            <div className="flex items-center gap-1.5 shrink-0 pl-2 border-l border-border/40 bg-background/95">
                                <Button
                                    type="button"
                                    variant="outline"
                                    size="icon"
                                    onClick={() => scrollCategories("left")}
                                    disabled={!canScrollLeft}
                                    aria-label="Scroll categories left"
                                    className={cn(
                                        "h-8 w-8 rounded-full border border-border transition-all active:scale-95 cursor-pointer",
                                        !canScrollLeft
                                            ? "opacity-30 cursor-not-allowed pointer-events-none"
                                            : "hover:bg-muted text-foreground"
                                    )}
                                >
                                    <ChevronLeft className="h-4 w-4" />
                                </Button>
                                <Button
                                    type="button"
                                    variant="outline"
                                    size="icon"
                                    onClick={() => scrollCategories("right")}
                                    disabled={!canScrollRight}
                                    aria-label="Scroll categories right"
                                    className={cn(
                                        "h-8 w-8 rounded-full border border-border transition-all active:scale-95 cursor-pointer",
                                        !canScrollRight
                                            ? "opacity-30 cursor-not-allowed pointer-events-none"
                                            : "hover:bg-muted text-foreground"
                                    )}
                                >
                                    <ChevronRight className="h-4 w-4" />
                                </Button>
                            </div>
                        </div>
                    </div>
                </section>

                {/* ─── ARTICLES SECTION ─── */}
                <section id="articles" className="w-full py-10">
                    <div ref={articlesSectionRef} className="max-w-300 mx-auto px-6">
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
                                                <Link href={`/post/${featured.slug}`} className="group block mb-10 gsap-fade-item">
                                                    <article className="relative flex flex-col rounded-2xl overflow-hidden bg-card border border-border/40 shadow-[0_2px_8px_rgba(0,0,0,0.08)] hover:shadow-[0_12px_36px_rgba(0,0,0,0.12)] dark:hover:shadow-[0_12px_36px_rgba(255,255,255,0.06)] transition-all duration-300 transform-gpu backface-hidden">
                                                        <div className="relative w-full aspect-video bg-secondary overflow-hidden -mb-px">
                                                            {featured.imageUrl ? (
                                                                <Image
                                                                    src={featured.image ? urlFor(featured.image).width(1000).quality(80).auto('format').url() : ""}
                                                                    alt={featured.title}
                                                                    fill
                                                                    className="object-cover group-hover:scale-[1.03] transition-transform duration-500 ease-out"
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
                                                <h3 id="recent-articles" className="text-xs font-semibold tracking-widest text-muted-foreground uppercase mb-5 scroll-mt-24">
                                                    Recent Articles
                                                </h3>
                                                {(() => {
                                                    const rest = articlesToDisplay.slice(1)
                                                    const startIdx = (currentPage - 1) * POSTS_PER_PAGE
                                                    const paginated = rest.slice(startIdx, startIdx + POSTS_PER_PAGE)

                                                    return (
                                                        <div className="grid gap-x-6 gap-y-8 sm:grid-cols-2 lg:grid-cols-3">
                                                            {paginated.map((article) => (
                                                                <Link href={`/post/${article.slug}`} key={article.id} className="group gsap-fade-item">
                                                                    <article className="flex flex-col rounded-2xl overflow-hidden bg-card border border-border/40 shadow-[0_1px_3px_rgba(0,0,0,0.08)] hover:shadow-[0_8px_30px_rgba(0,0,0,0.14)] dark:hover:shadow-[0_8px_30px_rgba(255,255,255,0.08)] hover:-translate-y-1 transition-all duration-300 ease-out h-full">
                                                                        <div className="relative w-full aspect-16/11 bg-secondary overflow-hidden">
                                                                            {article.imageUrl ? (
                                                                                <Image
                                                                                    src={article.imageUrl}
                                                                                    alt={article.title}
                                                                                    fill
                                                                                    className="object-cover group-hover:scale-105 transition-transform duration-500 ease-out"
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
                                                    <Button
                                                        type="button"
                                                        variant="outline"
                                                        size="icon"
                                                        onClick={() => handlePageChange(Math.max(1, currentPage - 1))}
                                                        disabled={currentPage === 1}
                                                        className="h-8 w-8 text-xs cursor-pointer"
                                                        aria-label="Previous page"
                                                    >
                                                        <ChevronLeft className="h-3.5 w-3.5" />
                                                    </Button>
                                                    {Array.from({ length: pages }, (_, i) => i + 1).map((page) => {
                                                        if (pages <= 7 || page === 1 || page === pages || Math.abs(page - currentPage) <= 1) {
                                                            return (
                                                                <button
                                                                    type="button"
                                                                    key={page}
                                                                    onClick={() => handlePageChange(page)}
                                                                    className={cn(
                                                                        "h-8 w-8 rounded-md text-[13px] font-medium transition-colors cursor-pointer",
                                                                        currentPage === page
                                                                            ? "bg-foreground text-background"
                                                                            : "text-muted-foreground hover:text-foreground"
                                                                    )}
                                                                >
                                                                    {page}
                                                                </button>
                                                            )
                                                        }
                                                        if (page === 2 && currentPage > 3) return <span key="dots-start" className="px-1 text-muted-foreground text-xs">...</span>
                                                        if (page === pages - 1 && currentPage < pages - 2) return <span key="dots-end" className="px-1 text-muted-foreground text-xs">...</span>
                                                        return null
                                                    })}
                                                    <Button
                                                        type="button"
                                                        variant="outline"
                                                        size="icon"
                                                        onClick={() => handlePageChange(Math.min(pages, currentPage + 1))}
                                                        disabled={currentPage === pages}
                                                        className="h-8 w-8 text-xs cursor-pointer"
                                                        aria-label="Next page"
                                                    >
                                                        <ChevronRight className="h-3.5 w-3.5" />
                                                    </Button>
                                                </div>
                                            )
                                        })()}
                                    </>
                                )}
                            </div>

                            {/* Sidebar */}
                            <aside className="hidden lg:block gsap-fade-item">
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

            <Footer />
        </div>
    )
}
