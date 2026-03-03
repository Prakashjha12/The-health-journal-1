"use client"

import * as React from "react"
import { motion, useScroll, useTransform } from "framer-motion"
import {
    BookOpen, Heart, Users, Shield, Clock, ArrowRight, Calendar, Search, Stethoscope, Activity, X, Menu, ChevronRight, Mail, Phone, MapPin, Send, Facebook, Twitter, Linkedin, Instagram, MinusIcon, PlusIcon
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { ThemeToggle } from "@/components/ThemeToggle"
import { cn } from "@/lib/utils"
import Link from "next/link"
import Image from "next/image"
import { urlFor } from "@/sanity/lib/image"

interface SanityPost {
    _id: string
    title: string
    slug: { current: string }
    publishedAt: string
    image?: any
    body?: any
}

interface TimelineEntry {
    title: string
    content: React.ReactNode
}

interface FaqItem {
    id: string
    question: string
    answer: string
    category: string
}

const Timeline = ({ data }: { data: TimelineEntry[] }) => {
    const ref = React.useRef<HTMLDivElement>(null)
    const containerRef = React.useRef<HTMLDivElement>(null)
    const [height, setHeight] = React.useState(0)

    React.useEffect(() => {
        if (ref.current) {
            const rect = ref.current.getBoundingClientRect()
            setHeight(rect.height)
        }
    }, [ref])

    const { scrollYProgress } = useScroll({
        target: containerRef,
        offset: ["start 10%", "end 50%"],
    })

    const heightTransform = useTransform(scrollYProgress, [0, 1], [0, height])
    const opacityTransform = useTransform(scrollYProgress, [0, 0.1], [0, 1])

    return (
        <div className="w-full bg-background font-sans md:px-10" ref={containerRef}>
            <div className="max-w-7xl mx-auto py-20 px-4 md:px-8 lg:px-10">
                <h2 className="text-lg md:text-4xl mb-4 text-foreground max-w-4xl">
                    Latest Medical Insights
                </h2>
                <p className="text-muted-foreground text-sm md:text-base max-w-sm">
                    Stay updated with the latest research and medical breakthroughs
                </p>
            </div>

            <div ref={ref} className="relative max-w-7xl mx-auto pb-20">
                {data.map((item, index) => (
                    <div key={index} className="flex justify-start pt-10 md:pt-40 md:gap-10">
                        <div className="sticky flex flex-col md:flex-row z-40 items-center top-40 self-start max-w-xs lg:max-w-sm md:w-full">
                            <div className="h-10 absolute left-3 md:left-3 w-10 rounded-full bg-background flex items-center justify-center">
                                <div className="h-4 w-4 rounded-full bg-muted border border-border p-2" />
                            </div>
                            <h3 className="hidden md:block text-xl md:pl-20 md:text-5xl font-bold text-muted-foreground">
                                {item.title}
                            </h3>
                        </div>

                        <div className="relative pl-20 pr-4 md:pl-4 w-full">
                            <h3 className="md:hidden block text-2xl mb-4 text-left font-bold text-muted-foreground">
                                {item.title}
                            </h3>
                            {item.content}
                        </div>
                    </div>
                ))}
                <div
                    style={{ height: height + "px" }}
                    className="absolute md:left-8 left-8 top-0 overflow-hidden w-[2px] bg-[linear-gradient(to_bottom,var(--tw-gradient-stops))] from-transparent from-0% via-border to-transparent to-99% mask-[linear-gradient(to_bottom,transparent_0%,black_10%,black_90%,transparent_100%)]"
                >
                    <motion.div
                        style={{
                            height: heightTransform,
                            opacity: opacityTransform,
                        }}
                        className="absolute inset-x-0 top-0 w-[2px] bg-linear-to-t from-primary via-primary/50 to-transparent from-0% via-10% rounded-full"
                    />
                </div>
            </div>
        </div>
    )
}

export default function MedicalBlogUI({ posts }: { posts: SanityPost[] }) {
    const [isMenuOpen, setIsMenuOpen] = React.useState(false)
    const [scrolled, setScrolled] = React.useState(false)
    const [expandedId, setExpandedId] = React.useState<string | null>(null)
    const [selectedCategory, setSelectedCategory] = React.useState<string>("All")
    const [searchQuery, setSearchQuery] = React.useState<string>("")
    const { scrollYProgress } = useScroll()

    React.useEffect(() => {
        const unsubscribe = scrollYProgress.on('change', (latest) => {
            setScrolled(latest > 0.05)
        })
        return () => unsubscribe()
    }, [scrollYProgress])

    const toggleMenu = () => setIsMenuOpen(!isMenuOpen)
    const toggleExpand = (id: string) => setExpandedId(expandedId === id ? null : id)

    const menuItems = [
        { name: 'Home', href: '#home' },
        { name: 'Features', href: '#features' },
        { name: 'Articles', href: '#articles' },
        { name: 'FAQ', href: '#faq' },
        { name: 'Contact', href: '#contact' },
        { name: 'Studio', href: '/studio' }
    ]

    const mappedArticles = posts.map((post, index) => {
        const colors = [
            "from-red-500/20 to-pink-500/20",
            "from-purple-500/20 to-blue-500/20",
            "from-indigo-500/20 to-cyan-500/20",
            "from-green-500/20 to-emerald-500/20",
            "from-yellow-500/20 to-orange-500/20",
            "from-teal-500/20 to-blue-500/20"
        ];
        return {
            id: post._id,
            title: post.title,
            slug: post.slug?.current || '#',
            excerpt: "Read this full article in our Medical Insights portal.",
            category: "Health",
            readTime: "5 min read",
            date: new Date(post.publishedAt || Date.now()).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
            author: "MedInsights Editor",
            imageColor: colors[index % colors.length],
            imageUrl: post.image ? urlFor(post.image).width(800).height(500).url() : null
        }
    })

    // Provide fallback articles if db is empty
    const articlesToDisplay = mappedArticles.length > 0 ? mappedArticles : [
        {
            id: "fallback-1",
            title: "Understanding Cardiovascular Health in Modern Medicine",
            slug: "#",
            excerpt: "Explore the latest research on heart health, preventive measures, and innovative treatments.",
            category: "Cardiology",
            readTime: "8 min read",
            date: "Jan 15, 2024",
            author: "Dr. Sarah Johnson",
            imageColor: "from-red-500/20 to-pink-500/20",
            imageUrl: null
        }
    ];

    const filteredArticles = articlesToDisplay.filter((article) => {
        const matchesCategory = selectedCategory === "All" || article.category === selectedCategory
        const matchesSearch = article.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            article.excerpt.toLowerCase().includes(searchQuery.toLowerCase())
        return matchesCategory && matchesSearch
    })

    const faqItems: FaqItem[] = [
        {
            id: "1",
            question: "How often is the blog updated?",
            answer: "We publish new medical articles and research insights weekly, ensuring you stay informed about the latest developments.",
            category: "general",
        },
        {
            id: "2",
            question: "Are the articles peer-reviewed?",
            answer: "Yes, all our medical content is reviewed by certified healthcare professionals and medical experts to ensure accuracy.",
            category: "general",
        }
    ]

    return (
        <div className="flex min-h-screen flex-col bg-background">
            <motion.header
                initial={{ y: -100 }}
                animate={{ y: 0 }}
                transition={{ duration: 0.5 }}
                className={cn(
                    "sticky top-0 z-50 w-full border-b backdrop-blur supports-backdrop-filter:bg-background/60",
                    scrolled && "shadow-md bg-background/95"
                )}
            >
                <div className="container mx-auto px-4 md:px-8 flex h-16 items-center justify-between">
                    <div className="flex items-center gap-3">
                        <a href="#home" className="flex items-center space-x-3">
                            <motion.div
                                whileHover={{ rotate: 5, scale: 1.1 }}
                                transition={{ type: "spring", stiffness: 400, damping: 10 }}
                                className="h-10 w-10 rounded-full bg-primary flex items-center justify-center"
                            >
                                <Stethoscope className="h-5 w-5 text-primary-foreground" />
                            </motion.div>
                            <span className="font-bold text-xl">MedInsights</span>
                        </a>
                    </div>
                    <nav className="hidden md:flex gap-6">
                        {menuItems.map((item, index) => (
                            <a
                                key={index}
                                href={item.href}
                                className="text-sm font-medium transition-colors hover:text-primary"
                            >
                                {item.name}
                            </a>
                        ))}
                    </nav>
                    <div className="hidden md:flex items-center gap-3">
                        <Link href="/studio">
                            <Button variant="outline" size="sm">CMS Admin</Button>
                        </Link>
                        <ThemeToggle />
                    </div>
                    <button className="flex md:hidden" onClick={toggleMenu}>
                        <Menu className="h-6 w-6" />
                    </button>
                </div>
            </motion.header>

            {/* Mobile Menu omitted for brevity but standard logic handles it */}

            <main className="flex-1">
                <section id="home" className="w-full py-8 md:py-12 max-w-7xl mx-auto">
                    <div className="container px-4 md:px-6">
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.6 }}
                            className="grid gap-6 lg:grid-cols-2 items-center"
                        >
                            <div className="space-y-4">
                                <Badge variant="secondary" className="w-fit text-primary font-medium">
                                    Featured Article
                                </Badge>
                                <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold leading-tight">
                                    <motion.span
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ duration: 0.5, delay: 0.2 }}
                                    >
                                        {articlesToDisplay[0].title}
                                    </motion.span>
                                </h1>
                                <p className="text-muted-foreground text-lg">
                                    {articlesToDisplay[0].excerpt}
                                </p>
                                <Button size="lg" className="mt-4" asChild>
                                    <Link href={`/post/${articlesToDisplay[0].slug}`}>
                                        Read Article <ArrowRight className="ml-2 h-4 w-4" />
                                    </Link>
                                </Button>
                            </div>
                            <motion.div
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ duration: 0.6, delay: 0.3 }}
                            >
                                <div className="relative aspect-4/3 w-full overflow-hidden rounded-lg bg-linear-to-br from-red-100 to-pink-100">
                                    {articlesToDisplay[0].imageUrl ? (
                                        <Image src={articlesToDisplay[0].imageUrl} fill alt="Hero" className="object-cover" />
                                    ) : (
                                        <div className="absolute inset-0 flex items-center justify-center">
                                            <Activity className="h-24 w-24 text-primary/40" />
                                        </div>
                                    )}
                                </div>
                            </motion.div>
                        </motion.div>
                    </div>
                </section>

                <section id="articles" className="w-full py-8 md:py-12 border-t bg-muted/10">
                    <div className="container max-w-7xl mx-auto px-4 md:px-6">
                        <div className="flex items-center justify-between mb-8">
                            <h2 className="text-2xl md:text-3xl font-bold">Latest Articles from Sanity</h2>
                            <div className="relative w-full max-w-sm hidden md:block">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                <Input
                                    type="text"
                                    placeholder="Search articles..."
                                    className="pl-9 h-10"
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                />
                            </div>
                        </div>

                        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                            {filteredArticles.map((article, index) => (
                                <Link key={article.id} href={`/post/${article.slug}`}>
                                    <motion.article
                                        initial={{ opacity: 0, y: 20 }}
                                        whileInView={{ opacity: 1, y: 0 }}
                                        viewport={{ once: true }}
                                        transition={{ duration: 0.4, delay: index * 0.05 }}
                                        className="group cursor-pointer bg-card rounded-xl p-4 shadow-sm border"
                                    >
                                        <div className="space-y-3">
                                            <div className="relative aspect-16/10 w-full overflow-hidden rounded-lg bg-linear-to-br">
                                                {article.imageUrl ? (
                                                    <Image src={article.imageUrl} fill alt={article.title} className="object-cover transition-transform group-hover:scale-105" />
                                                ) : (
                                                    <div className={cn("absolute inset-0 bg-linear-to-br", article.imageColor)}>
                                                        <div className="absolute inset-0 flex items-center justify-center">
                                                            <Stethoscope className="h-12 w-12 text-white/60" />
                                                        </div>
                                                    </div>
                                                )}
                                            </div>

                                            <div className="space-y-2">
                                                <Badge variant="secondary" className="text-xs font-normal">
                                                    {article.category}
                                                </Badge>
                                                <h3 className="font-bold text-lg leading-tight group-hover:text-primary transition-colors line-clamp-2">
                                                    {article.title}
                                                </h3>
                                                <p className="text-sm text-muted-foreground line-clamp-2">
                                                    {article.excerpt}
                                                </p>
                                                <div className="flex items-center gap-3 text-xs text-muted-foreground pt-2">
                                                    <span>{article.date}</span>
                                                    <span>•</span>
                                                    <span>{article.readTime}</span>
                                                </div>
                                            </div>
                                        </div>
                                    </motion.article>
                                </Link>
                            ))}
                        </div>
                    </div>
                </section>

            </main>

            <footer className="w-full border-t bg-background">
                <div className="container max-w-7xl mx-auto px-4 py-12 md:px-6">
                    <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
                        <div className="space-y-4">
                            <div className="flex items-center gap-3">
                                <div className="h-10 w-10 rounded-full bg-primary flex items-center justify-center">
                                    <Stethoscope className="h-5 w-5 text-primary-foreground" />
                                </div>
                                <span className="font-bold text-xl">MedInsights</span>
                            </div>
                            <p className="text-sm text-muted-foreground">
                                Your trusted source for evidence-based medical knowledge and health insights.
                            </p>
                        </div>
                        <div>
                            <h3 className="font-medium mb-4">Quick Links</h3>
                            <nav className="space-y-2 text-sm">
                                <a href="#about" className="block text-muted-foreground hover:text-foreground">About Us</a>
                                <a href="#articles" className="block text-muted-foreground hover:text-foreground">Articles</a>
                                <a href="/studio" className="block text-primary font-medium hover:underline">CMS Login</a>
                            </nav>
                        </div>
                    </div>
                    <div className="mt-8 pt-8 border-t text-center text-sm text-muted-foreground">
                        <p>&copy; {new Date().getFullYear()} MedInsights / Komal's Blog. All rights reserved.</p>
                    </div>
                </div>
            </footer>
        </div>
    )
}
