import { client } from '../../../sanity/lib/client'
import { postBySlugQuery, recentPostsQuery } from '../../../sanity/lib/queries'
import { PortableText } from '@portabletext/react'
import Image from 'next/image'
import { urlFor } from '../../../sanity/lib/image'
import Link from 'next/link'
import { Stethoscope } from 'lucide-react'
import { Navbar } from '@/components/Navbar'
import { calculateReadingTime } from '@/lib/utils'
import {
  ReadingProgressBar,
  ReadingTimeBadge,
  SocialShareSidebar,
  BackButton,
} from '@/components/BlogPostClient'
import { BookmarkButton } from '@/components/BookmarkButton'
import { getBookmarks } from '@/lib/actions/user.actions'

export const revalidate = 60


export default async function PostPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const post = await client.fetch(postBySlugQuery, { slug })

  if (!post) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background text-foreground">
        <div className="text-center space-y-4">
          <h1 className="text-3xl font-bold">Post not found</h1>
          <Link href="/" className="text-sm text-muted-foreground hover:text-foreground transition-colors inline-flex items-center gap-2">
            ← Back to home
          </Link>
        </div>
      </div>
    )
  }

  const readingTime = calculateReadingTime(post.body)
  const bookmarkedArticleIds = await getBookmarks()
  const isBookmarked = bookmarkedArticleIds.includes(post._id)

  const recentPostsData = await client.fetch(recentPostsQuery, { slug })
  const CATEGORIES = ["All", "Health", "Wellness", "Research", "Lifestyle", "Nutrition"]
  const recentArticles = recentPostsData.map((rp: any, index: number) => {
    const displayDate = rp.publishedAt || rp._createdAt || new Date("2024-01-01").toISOString()
    const readTimeVal = calculateReadingTime(rp.body)
    return {
      id: rp._id,
      title: rp.title,
      slug: rp.slug?.current || '#',
      category: CATEGORIES[1 + (index % (CATEGORIES.length - 1))],
      readTime: `${readTimeVal} min read`,
      date: new Date(displayDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
      imageUrl: rp.image ? urlFor(rp.image).width(800).height(500).url() : null
    }
  })

  return (
    <div className="flex min-h-screen flex-col bg-background text-foreground">
      <ReadingProgressBar />

      <Navbar />

      <main className="flex-1">
        {/* ─── BREADCRUMBS ─── */}
        <div className="max-w-[1200px] mx-auto px-6 pt-6">
          <nav className="flex items-center gap-2 text-xs text-muted-foreground">
            <Link href="/" className="hover:text-foreground transition-colors">Home</Link>
            <span className="text-muted-foreground/40">›</span>
            <span className="text-foreground/70 truncate max-w-[300px]">{post.title}</span>
          </nav>
        </div>

        {/* ─── ARTICLE HEADER ─── */}
        <div className="max-w-[1200px] mx-auto px-6 pt-8 pb-8 relative">
          <div className="max-w-[720px]">
            <BackButton />

            <h1 className="text-3xl sm:text-4xl md:text-[42px] font-extrabold tracking-tight leading-[1.15] mt-6 mb-5">
              {post.title}
            </h1>

            <div className="mt-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
                <time dateTime={post.publishedAt || post._createdAt} className="font-medium" suppressHydrationWarning>
                  {new Date(post.publishedAt || post._createdAt).toLocaleDateString('en-US', {
                    month: 'long',
                    day: 'numeric',
                    year: 'numeric'
                  })}
                </time>
                <span className="w-1 h-1 rounded-full bg-muted-foreground/40" />
                <ReadingTimeBadge minutes={readingTime} />
              </div>

              <div className="flex-shrink-0 md:absolute md:right-6 md:mt-0">
                <BookmarkButton articleId={post._id} initialIsBookmarked={isBookmarked} className="rounded-md px-4 py-2 w-auto gap-2 border">
                  <span className="text-sm font-medium">{isBookmarked ? "Saved" : "Save article"}</span>
                </BookmarkButton>
              </div>
            </div>
          </div>
        </div>

        {/* ─── FEATURED IMAGE ─── */}
        {post.image && (
          <div className="max-w-[1200px] mx-auto px-6 mb-10">
            <div className="rounded-2xl overflow-hidden border border-border bg-secondary">
              <Image
                src={urlFor(post.image)?.url() as string}
                alt={post.image.alt || post.title}
                width={1200}
                height={600}
                className="w-full h-auto object-cover max-h-[500px]"
                priority
              />
            </div>
          </div>
        )}

        {/* ─── CONTENT AREA ─── */}
        <div className="max-w-[1200px] mx-auto px-6 pb-20">
          <div className="grid gap-8 lg:grid-cols-[60px_1fr_300px]">
            {/* Social Share Sidebar */}
            <aside className="hidden lg:block">
              <div className="sticky top-20">
                <SocialShareSidebar title={post.title} />
              </div>
            </aside>

            {/* Article Body */}
            <article className="min-w-0">
              <div className="prose prose-zinc dark:prose-invert md:prose-lg max-w-none
                                prose-headings:font-bold prose-headings:tracking-tight
                                prose-h2:text-2xl prose-h2:mt-10 prose-h2:mb-4
                                prose-h3:text-xl prose-h3:mt-8 prose-h3:mb-3
                                prose-p:leading-[1.8] prose-p:text-[15px] prose-p:text-foreground/85
                                prose-li:text-[15px] prose-li:leading-[1.8]
                                prose-a:text-foreground prose-a:underline prose-a:underline-offset-2 prose-a:decoration-foreground/30 hover:prose-a:decoration-foreground
                                prose-blockquote:border-l-foreground/20 prose-blockquote:text-muted-foreground prose-blockquote:not-italic
                                prose-img:rounded-xl prose-img:border prose-img:border-border
                                prose-code:text-sm prose-code:bg-muted prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded-md prose-code:before:content-none prose-code:after:content-none
                                prose-strong:text-foreground prose-strong:font-semibold
                            ">
                <PortableText value={post.body} />
              </div>

              {/* Mobile Social Share */}
              <div className="lg:hidden mt-12 pt-8 border-t border-border">
                <p className="text-sm font-medium text-muted-foreground mb-4">Share this article</p>
                <div className="flex gap-3">
                  <SocialShareSidebar title={post.title} />
                </div>
              </div>
            </article>

            {/* Sidebar */}
            <aside className="hidden lg:block">
              <div className="sticky top-20 bg-card border border-border rounded-lg p-6 space-y-4">
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

        {/* ─── READ NEXT ─── */}
        {recentArticles.length > 0 && (
          <div className="max-w-[1200px] mx-auto px-6 pb-20 border-t border-border pt-16">
            <h2 className="text-2xl font-bold tracking-tight mb-8">Read Next</h2>
            <div className="grid gap-x-6 gap-y-8 sm:grid-cols-2 lg:grid-cols-3">
              {recentArticles.map((article: any) => (
                <Link href={`/post/${article.slug}`} key={article.id} className="group">
                  <article className="flex flex-col rounded-2xl overflow-hidden bg-card border border-border/40 shadow-[0_1px_3px_rgba(0,0,0,0.08)] hover:shadow-[0_8px_30px_rgba(0,0,0,0.12)] hover:-translate-y-1 transition-all duration-300 ease-out h-full">
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
                      <h3 className="font-semibold text-base leading-snug tracking-tight mb-2 group-hover:text-foreground/80 transition-colors line-clamp-2">
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
          </div>
        )}
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
                <Link href="/" className="block text-muted-foreground hover:text-foreground transition-colors">Home</Link>
                <Link href="/#articles" className="block text-muted-foreground hover:text-foreground transition-colors">Articles</Link>
              </nav>
            </div>
          </div>
          <div className="mt-8 pt-6 border-t border-border flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-muted-foreground">
            <p suppressHydrationWarning>&copy; {new Date().getFullYear()} — Komal&apos;s Blog. All Rights Reserved.</p>
            <p>
              Made by <a href="https://www.prakashjha.com" target="_blank" rel="noopener noreferrer" className="font-medium hover:text-foreground transition-colors underline underline-offset-4">Prakashjha</a>
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
}
