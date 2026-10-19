import { cache } from 'react'
import { sanityFetch } from '../../../sanity/lib/live'
import { client } from '../../../sanity/lib/client'
import { groq } from 'next-sanity'
import { postBySlugQuery, recentPostsQuery } from '../../../sanity/lib/queries'
import { PortableText, type PortableTextComponents } from '@portabletext/react'
import Image from 'next/image'
import { urlFor } from '../../../sanity/lib/image'
import Link from 'next/link'
import { Stethoscope } from 'lucide-react'
import { Navbar } from '@/components/Navbar'
import { calculateReadingTime } from '@/lib/utils'
import {
  ReadingTimeBadge,
  SocialShareSidebar,
  BackButton,
} from '@/components/BlogPostClient'
import { ScrollProgress, type ScrollProgressSection } from '@/components/ui/scroll-progress'
import { BookmarkButton } from '@/components/BookmarkButton'
import { getBookmarks } from '@/lib/actions/user.actions'
import { ArticleAnimations } from '@/components/ArticleAnimations'
import { Metadata } from 'next'
import { dataset, projectId } from '@/sanity/env'
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion'
import { FormattedDate } from "@/components/ui/FormattedDate"
import { Footer } from "@/components/Footer"

export const revalidate = 3600; // Revalidate the cache every 1 hour (3600 seconds)

// Pre-render all existing articles at build time so they load instantaneously
export async function generateStaticParams() {
  if (projectId === 'placeholder' || dataset === 'placeholder') return []
  try {
    const posts = await client.fetch<{ slug: string }[]>(
      groq`*[_type == "post" && defined(slug.current)]{ "slug": slug.current }`
    )
    return (posts || []).map((post) => ({
      slug: post.slug,
    }))
  } catch (error) {
    console.error('Error generating static params for posts:', error)
    return []
  }
}

// React cache dedupes the fetch call between generateMetadata and PostPage
const getPost = cache(async (slug: string) => {
  const isConfigured = projectId !== 'placeholder' && dataset !== 'placeholder'
  if (!isConfigured) return null
  const postResponse = await sanityFetch({
    query: postBySlugQuery,
    params: { slug },
    tags: ['posts', `post:${slug}`],
  })
  return postResponse?.data || null
})

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params
  const post = await getPost(slug)

  if (!post) {
    return { title: "Post Not Found | The Health Journal" }
  }

  // Use the image from Sanity for the Google/Social Media preview
  const ogImage = post.image ? urlFor(post.image).width(1200).height(630).url() : '/default-og.jpg'

  return {
    title: post.title,
    description: post.summary || "Read the latest health insights from Dr. Rajnandini Dubey at The Health Journal.",
    keywords: post.tags?.join(', ') || 'health, wellness, physio',
    alternates: {
      canonical: `https://thehealthjournal.in/post/${slug}`,
    },
    openGraph: {
      title: post.title,
      description: post.summary,
      url: `https://thehealthjournal.in/post/${slug}`,
      images: [{ url: ogImage, width: 1200, height: 630 }],
      type: 'article',
    },
    twitter: {
      card: 'summary_large_image',
      title: post.title,
      description: post.summary,
      images: [ogImage],
    },

  }
}


const portableTextComponents: PortableTextComponents = {
  types: {
    image: ({ value }: { value: { asset: object; alt?: string } }) => {
      if (!value?.asset) return null
      return (
        <div className="my-10 rounded-xl overflow-hidden border border-border">
          <Image
            src={urlFor(value).width(1200).url()}
            alt={value.alt || 'The Health Journal Image'}
            width={1200}
            height={675}
            className="w-full h-auto object-cover"
          />
        </div>
      )
    },
  },
  block: {
    normal: ({ children }: { children?: React.ReactNode }) => (
      <p className="wrap-anywhere">{children}</p>
    ),
    h2: ({ children, value }) => {
      const text = value?.children
        ?.map((c) => ('text' in c ? c.text : ''))
        .join('')
        .trim() || ''
      const id = text
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '') || 'section'
      return (
        <h2 id={id} className="scroll-mt-24 text-2xl mt-10 mb-4 font-bold tracking-tight wrap-anywhere">
          {children}
        </h2>
      )
    },
    blockquote: ({ children }: { children?: React.ReactNode }) => (
      <blockquote className="my-8 border-l-4 border-primary bg-zinc-100/80 dark:bg-zinc-900/50 py-6 pl-8 pr-6 rounded-r-xl shadow-sm italic text-zinc-800 dark:text-zinc-200 text-lg leading-relaxed wrap-anywhere">
        {children}
      </blockquote>
    ),
  },
  list: {
    bullet: ({ children }: { children?: React.ReactNode }) => (
      <ul className="list-disc pl-5 wrap-anywhere space-y-1">{children}</ul>
    ),
    number: ({ children }: { children?: React.ReactNode }) => (
      <ol className="list-decimal pl-5 wrap-anywhere space-y-1">{children}</ol>
    ),
  },
  listItem: {
    bullet: ({ children }: { children?: React.ReactNode }) => (
      <li className="wrap-anywhere">{children}</li>
    ),
    number: ({ children }: { children?: React.ReactNode }) => (
      <li className="wrap-anywhere">{children}</li>
    ),
  },
  marks: {
    link: ({ value, children }: { value?: { href: string }; children: React.ReactNode }) => {
      const href = value?.href || ''
      const isInternal = href.startsWith('/') || href.startsWith('https://thehealthjournal.in')

      if (isInternal) {
        const path = href.replace('https://thehealthjournal.in', '')
        return (
          <Link href={path} className="text-primary hover:underline underline-offset-4 decoration-primary/40 transition-all font-medium break-all">
            {children}
          </Link>
        )
      }

      return (
        <a
          href={href}
          target="_blank"
          rel="noopener noreferrer"
          className="text-primary hover:underline underline-offset-4 decoration-primary/40 transition-all font-medium break-all"
        >
          {children}
        </a>
      )
    },
  },
}

export default async function PostPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const isConfigured = projectId !== 'placeholder' && dataset !== 'placeholder'

  // Fetch post (deduped via React cache), recent articles, and bookmarks concurrently in parallel
  const [post, recentPostsResponse, bookmarkedArticleIds] = await Promise.all([
    getPost(slug),
    isConfigured
      ? sanityFetch({ query: recentPostsQuery, params: { slug } })
      : Promise.resolve({ data: [] }),
    getBookmarks(),
  ])

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
  const isBookmarked = bookmarkedArticleIds.includes(post._id)

  interface RecentArticleCard {
    id: string;
    title: string;
    slug: string;
    category: string;
    readTime: string;
    date: string;
    imageUrl: string | null;
  }

  const recentPostsData = recentPostsResponse?.data || []
  const recentArticles: RecentArticleCard[] = recentPostsData.map((rp: {
    _id: string;
    title: string;
    slug?: { current?: string };
    publishedAt?: string;
    _createdAt?: string;
    categories?: { title: string }[];
    image?: Parameters<typeof urlFor>[0] | null;
    body?: unknown[];
  }) => {
    const displayDate = rp.publishedAt || rp._createdAt || "2024-01-01"
    const readTimeVal = calculateReadingTime(rp.body)
    const postCategory = rp.categories && rp.categories.length > 0 && rp.categories[0].title
      ? rp.categories[0].title
      : "Health"
    return {
      id: rp._id,
      title: rp.title,
      slug: rp.slug?.current || '#',
      category: postCategory,
      readTime: `${readTimeVal} min read`,
      date: displayDate,
      imageUrl: rp.image ? urlFor(rp.image).width(800).height(500).url() : null
    }
  })

  interface BodyBlock {
    _type?: string;
    style?: string;
    children?: { text?: string }[];
  }

  const rawBody = Array.isArray(post.body) ? (post.body as BodyBlock[]) : []
  const dynamicSections: ScrollProgressSection[] = rawBody
    .filter((block) => block._type === 'block' && block.style === 'h2')
    .map((block) => {
      const label = block.children?.map((c) => c.text || '').join('').trim() || ''
      const id = label
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '') || 'section'
      return { id, label }
    })
    .filter((s) => s.label.length > 0)

  const sections: ScrollProgressSection[] = [
    { id: 'article-header', label: 'Intro' },
    ...dynamicSections,
    ...(post.faqs && post.faqs.length > 0 ? [{ id: 'faq-section', label: 'FAQ' }] : []),
    ...(recentArticles.length > 0 ? [{ id: 'read-next', label: 'Read Next' }] : []),
  ]

  return (
    <div className="flex min-h-screen flex-col bg-background text-foreground">
      <ScrollProgress sections={sections} />

      <Navbar />

      <main className="flex-1 w-full max-w-full overflow-x-clip">
        <script
          // type="application/ld+json"
          // dangerouslySetInnerHTML={{
          //   __html: JSON.stringify({
          //     "@context": "https://schema.org",
          //     "@type": "BlogPosting",
          //     "headline": post.title,
          //     "description": post.summary,
          //     "image": post.image ? [urlFor(post.image).width(1200).height(630).url()] : [],
          //     "datePublished": post.publishedAt || post._createdAt,
          //     "dateModified": post._updatedAt || post.publishedAt || post._createdAt,
          //     "author": [{
          //       "@type": "Person",
          //       "name": post.author?.name || "The Health Journal Team",
          //       "url": post.author?.slug ? `https://thehealthjournal.in/author/${post.author.slug}` : "https://thehealthjournal.in"
          //     }],
          //     "publisher": {
          //       "@type": "Organization",
          //       "name": "The Health Journal",
          //       "logo": {
          //         "@type": "ImageObject",
          //         "url": "https://thehealthjournal.in/LOGO.webp"
          //       }
          //     },
          //     "mainEntityOfPage": {
          //       "@type": "WebPage",
          //       "@id": `https://thehealthjournal.in/post/${slug}`
          //     }
          //   })
          // }}

          // type="application/ld+json"
          // dangerouslySetInnerHTML={{
          //   __html: JSON.stringify({
          //     "@context": "https://schema.org",
          //     "@graph": [
          //       {
          //         "@type": "MedicalWebPage",
          //         "@id": `https://thehealthjournal.in/post/${slug}#website`,
          //         "url": `https://thehealthjournal.in/post/${slug}`,
          //         "name": post.title,
          //         "headline": post.title,
          //         "description": post.summary,
          //         "image": post.image ? [urlFor(post.image).width(1200).height(630).url()] : [],
          //         "datePublished": post.publishedAt || post._createdAt,
          //         "dateModified": post._updatedAt || post.publishedAt || post._createdAt,
          //         "lastReviewed": post._updatedAt || post.publishedAt || post._createdAt,
          //         "medicalAudience": "Patients",
          //         "author": {
          //           "@type": "Person",
          //           "name": post.author?.name || "Dr. Rajnandini Dubey",
          //           "url": post.author?.slug ? `https://thehealthjournal.in/author/${post.author.slug}` : "https://thehealthjournal.in"
          //         },
          //         // ─── THE MEDICAL TRUST SIGNAL ───
          //         "reviewedBy": post.reviewer ? {
          //           "@type": "Person",
          //           "name": post.reviewer.name,
          //           "jobTitle": "Medical Professional",
          //           "url": post.reviewer.slug ? `https://thehealthjournal.in/author/${post.reviewer.slug}` : undefined
          //         } : undefined,
          //         "publisher": {
          //           "@type": "Organization",
          //           "name": "The Health Journal",
          //           "logo": {
          //             "@type": "ImageObject",
          //             "url": "https://thehealthjournal.in/LOGO.webp"
          //           }
          //         }
          //       },
          //       // ─── FAQ SCHEMA (If FAQs exist) ───
          //       ...(post.faqs && post.faqs.length > 0 ? [{
          //         "@type": "FAQPage",
          //         "mainEntity": post.faqs.map((faq: { question: string; answer: string }) => ({
          //           "@type": "Question",
          //           "name": faq.question,
          //           "acceptedAnswer": {
          //             "@type": "Answer",
          //             "text": faq.answer
          //           }
          //         }))
          //       }] : [])
          //     ]
          //   })
          // }}

          // type="application/ld+json"
          // dangerouslySetInnerHTML={{
          //   __html: JSON.stringify({
          //     "@context": "https://schema.org",
          //     "@graph": [
          //       {
          //         "@type": ["BlogPosting", "MedicalWebPage"], // Dual-type for both Rich Results & Trust
          //         "@id": `https://thehealthjournal.in/post/${slug}#post`,
          //         "mainEntityOfPage": `https://thehealthjournal.in/post/${slug}`,
          //         "headline": post.title,
          //         "description": post.summary,
          //         "image": post.image ? [urlFor(post.image).width(1200).height(630).url()] : [],
          //         "datePublished": post.publishedAt || post._createdAt,
          //         "dateModified": post._updatedAt || post.publishedAt || post._createdAt,
          //         "lastReviewed": post._updatedAt || post.publishedAt || post._createdAt,
          //         "author": {
          //           "@type": "Person",
          //           "name": post.author?.name || "Dr. Rajnandini Dubey",
          //           "url": post.author?.slug ? `https://thehealthjournal.in/author/${post.author.slug}` : "https://thehealthjournal.in"
          //         },
          //         "reviewedBy": post.reviewer ? {
          //           "@type": "Person",
          //           "name": post.reviewer.name,
          //           "jobTitle": "Medical Professional"
          //         } : undefined,
          //         "publisher": {
          //           "@type": "Organization",
          //           "name": "The Health Journal",
          //           "logo": {
          //             "@type": "ImageObject",
          //             "url": "https://thehealthjournal.in/LOGO.webp"
          //           }
          //         }
          //       },
          //       // FAQ Schema remains the same
          //       ...(post.faqs && post.faqs.length > 0 ? [{
          //         "@type": "FAQPage",
          //         "mainEntity": post.faqs.map((faq: any) => ({
          //           "@type": "Question",
          //           "name": faq.question,
          //           "acceptedAnswer": {
          //             "@type": "Answer",
          //             "text": faq.answer
          //           }
          //         }))
          //       }] : [])
          //     ]
          //   })
          // }}
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@graph": [
                {
                  "@type": ["BlogPosting", "MedicalWebPage"],
                  "@id": `https://thehealthjournal.in/post/${slug}#post`,
                  "mainEntityOfPage": `https://thehealthjournal.in/post/${slug}`,
                  "headline": post.title,
                  "description": post.summary,
                  "image": post.image ? [urlFor(post.image).width(1200).height(630).url()] : [],
                  "datePublished": post.publishedAt || post._createdAt,
                  "dateModified": post._updatedAt || post.publishedAt || post._createdAt,
                  "author": {
                    "@type": "Person",
                    "name": post.author?.name || "Dr. Rajnandini Dubey",
                    "url": post.author?.slug ? `https://thehealthjournal.in/author/${post.author.slug}` : "https://thehealthjournal.in"
                  },
                  "publisher": {
                    "@type": "Organization",
                    "name": "The Health Journal",
                    "logo": {
                      "@type": "ImageObject",
                      "url": "https://thehealthjournal.in/LOGO.webp"
                    }
                  }
                },
                // ─── NEW: BREADCRUMB SCHEMA ───
                {
                  "@type": "BreadcrumbList",
                  "itemListElement": [
                    {
                      "@type": "ListItem",
                      "position": 1,
                      "name": "Home",
                      "item": "https://thehealthjournal.in"
                    },
                    {
                      "@type": "ListItem",
                      "position": 2,
                      "name": post.title,
                      "item": `https://thehealthjournal.in/post/${slug}`
                    }
                  ]
                },
                // ─── FAQ SCHEMA ───
                ...(post.faqs && post.faqs.length > 0 ? [{
                  "@type": "FAQPage",
                  "mainEntity": post.faqs.map((faq: { question: string; answer: string }) => ({
                    "@type": "Question",
                    "name": faq.question,
                    "acceptedAnswer": {
                      "@type": "Answer",
                      "text": faq.answer
                    }
                  }))
                }] : [])
              ]
            })
          }}


        />
        {/* ─── BREADCRUMBS ─── */}
        <ArticleAnimations>
          <div className="max-w-300 mx-auto px-6 pt-6 article-entrance-crumb">
            <nav className="flex items-center gap-2 text-xs text-muted-foreground">
              <Link href="/" className="hover:text-foreground transition-colors">Home</Link>
              <span className="text-muted-foreground/40">›</span>
              <span className="text-foreground/70 truncate max-w-75">{post.title}</span>
            </nav>
          </div>

          {/* ─── ARTICLE HEADER ─── */}
          <div id="article-header" className="max-w-300 mx-auto px-6 pt-8 pb-8 relative">
            <div className="max-w-180">
              <div className="article-entrance-back">
                <BackButton />
              </div>

              <h1 className="article-entrance-title text-3xl sm:text-4xl md:text-[42px] font-extrabold tracking-tight leading-[1.15] mt-6 mb-5">
                {post.title.split(' ').map((word: string, i: number) => (
                  <span key={i} className="split-word inline-block mr-[0.25em]">
                    {word}
                  </span>
                ))}
              </h1>

              <div className="article-entrance-meta mt-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
                  <time dateTime={post.publishedAt || post._createdAt} className="font-medium">
                    <FormattedDate date={post.publishedAt || post._createdAt} options={{ month: 'long', day: 'numeric', year: 'numeric' }} />
                  </time>
                  <span className="w-1 h-1 rounded-full bg-muted-foreground/40" />
                  <ReadingTimeBadge minutes={readingTime} />
                </div>

                <div className="shrink-0 md:absolute md:right-6 md:mt-0">
                  <BookmarkButton articleId={post._id} initialIsBookmarked={isBookmarked} className="rounded-md px-4 py-2 w-auto gap-2 border">
                    <span className="text-sm font-medium">{isBookmarked ? "Saved" : "Save article"}</span>
                  </BookmarkButton>
                </div>
              </div>
            </div>
          </div>

          {/* ─── FEATURED IMAGE ─── */}
          {post.image && (
            <div className="max-w-300 mx-auto px-6 mb-10 article-entrance-image">
              <div className="rounded-2xl overflow-hidden border border-border bg-secondary">
                <Image
                  // ─── OPTIMIZATION: 1000px width + 80% quality ───
                  src={urlFor(post.image).width(1000).quality(80).auto('format').url()}
                  alt={post.image.alt || post.title}
                  width={1200}
                  height={600}
                  className="w-full h-auto object-cover max-h-125"
                  // ─── HIGH PRIORITY EAGER LOAD WITHOUT MISMATCHED PRELOAD TAG ───
                  loading="eager"
                  fetchPriority="high"
                  sizes="(max-width: 768px) 100vw, 1200px"
                />
              </div>
            </div>
          )}
        </ArticleAnimations>

        {/* ─── CONTENT AREA ─── */}
        <div className="max-w-300 mx-auto px-6 pb-20 w-full overflow-x-clip">
          <div className="grid gap-8 lg:grid-cols-[60px_1fr_300px] min-w-0 max-w-full">
            {/* Social Share Sidebar */}
            <aside className="hidden lg:block">
              <div className="sticky top-20">
                <SocialShareSidebar title={post.title} />
              </div>
            </aside>

            {/* Article Body */}
            <article className="min-w-0 max-w-full overflow-x-clip wrap-anywhere">
              <div className="prose prose-zinc dark:prose-invert md:prose-lg max-w-none min-w-0 wrap-anywhere
                                prose-headings:font-bold prose-headings:tracking-tight
                                prose-h2:text-2xl prose-h2:mt-10 prose-h2:mb-4
                                prose-h3:text-xl prose-h3:mt-8 prose-h3:mb-3
                                prose-p:leading-[1.8] prose-p:text-[15px] prose-p:text-foreground/85 prose-p:wrap-anywhere
                                prose-li:text-[15px] prose-li:leading-[1.8] prose-li:wrap-anywhere
                                prose-a:text-foreground prose-a:underline prose-a:underline-offset-2 prose-a:decoration-foreground/30 hover:prose-a:decoration-foreground prose-a:break-all
                                prose-blockquote:not-prose
                                prose-img:rounded-xl prose-img:border prose-img:border-border
                                prose-code:text-sm prose-code:bg-muted prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded-md prose-code:before:content-none prose-code:after:content-none
                                prose-strong:text-foreground prose-strong:font-semibold
                            ">
                <PortableText value={post.body} components={portableTextComponents} />
              </div>

              {/* Mobile Social Share */}
              <div className="lg:hidden mt-12 pt-8 border-t border-border flex flex-col items-center justify-center gap-4 text-center">
                <p className="text-sm font-medium text-muted-foreground">Share this article</p>
                <SocialShareSidebar title={post.title} className="flex-row" />
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
                  At The Health Journal, we create free, easy-to-read articles backed by real medical research and expert insights.
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
                  🧠 Stay informed. Stay healthy. Read The Health Journal.
                </p>

                <p className="text-sm font-semibold">
                  Better Health with The Health Journal
                </p>


              </div>
            </aside>
          </div>
        </div>

        {/* ─── FAQ SECTION ─── */}
        {post.faqs && post.faqs.length > 0 && (
          <div id="faq-section" className="max-w-180 mx-auto px-6 pb-16">
            <h2 className="text-2xl font-bold tracking-tight mb-6">Frequently Asked Questions</h2>
            <Accordion type="single" collapsible className="w-full space-y-2">
              {post.faqs.map((faq: { question: string; answer: string }, index: number) => (
                <AccordionItem
                  key={index}
                  value={`faq-${index}`}
                  className="border border-border rounded-xl px-5 data-[state=open]:bg-muted/40 transition-colors"
                >
                  <AccordionTrigger className="text-[15px] font-semibold text-foreground text-left hover:no-underline py-4">
                    {faq.question}
                  </AccordionTrigger>
                  <AccordionContent className="text-[14px] leading-[1.8] text-foreground/80 pb-4">
                    {faq.answer}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </div>
        )}

        {/* ─── AUTHOR & REVIEWER PROFILES ─── */}
        <div className="max-w-250 mx-auto px-6 pb-20 mt-10">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

            {/* WRITTEN BY (AUTHOR) */}
            <div className={`bg-card border border-border/60 rounded-2xl p-6 flex flex-col sm:flex-row items-center sm:items-start gap-5 shadow-sm ${!post.reviewer ? 'md:col-span-2 max-w-200 mx-auto' : ''}`}>
              {post.author?.image ? (
                <Link href={post.author.slug ? `/author/${post.author.slug}` : "#"} className="shrink-0">
                  <Image
                    src={urlFor(post.author.image)?.width(160).height(160).url() as string}
                    alt={post.author.name || "Publisher"}
                    width={80}
                    height={80}
                    className="rounded-full object-cover w-20 h-20 border-2 border-border/50 bg-secondary shrink-0 hover:ring-4 hover:ring-primary/20 transition-all cursor-pointer"
                  />
                </Link>
              ) : (
                <div className="w-20 h-20 rounded-full border-2 border-border/50 bg-muted flex items-center justify-center shrink-0">
                  <Stethoscope className="h-8 w-8 text-muted-foreground mt-1" />
                </div>
              )}
              <div className="text-center sm:text-left flex-1 min-w-0">
                <h3 className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground mb-1.5">Written By</h3>
                <h4 className="text-lg font-bold tracking-tight mb-2 flex items-center justify-center sm:justify-start gap-2">
                  <Link href={post.author?.slug ? `/author/${post.author.slug}` : "#"} className="hover:text-primary transition-colors hover:underline decoration-primary/30 underline-offset-4 truncate">
                    {post.author?.name || "Dr Rajnandini Dubey"}
                  </Link>
                  {post.author?.linkedin && (
                    <a
                      href={post.author.linkedin}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-muted-foreground hover:text-[#0A66C2] transition-colors p-1 shrink-0"
                      title="LinkedIn Profile"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" />
                      </svg>
                    </a>
                  )}
                </h4>
                {post.author?.bio ? (
                  <div className="text-[14px] leading-relaxed text-muted-foreground prose prose-zinc dark:prose-invert line-clamp-2">
                    <PortableText value={post.author.bio} />
                  </div>
                ) : (
                  <p className="text-[14px] leading-relaxed text-muted-foreground line-clamp-2">
                    Health professional and writer at The Health Journal, dedicated to providing accurate, research-backed insights for better wellbeing.
                  </p>
                )}
              </div>
            </div>

            {/* REVIEWED BY (REVIEWER) - Conditionally Rendered */}
            {post.reviewer && (
              <div className="bg-card border border-border/60 rounded-2xl p-6 flex flex-col sm:flex-row items-center sm:items-start gap-5 shadow-sm">
                {post.reviewer.image ? (
                  <Link href={post.reviewer.slug ? `/author/${post.reviewer.slug}` : "#"} className="shrink-0">
                    <Image
                      src={urlFor(post.reviewer.image)?.width(160).height(160).url() as string}
                      alt={post.reviewer.name || "Reviewer"}
                      width={80}
                      height={80}
                      className="rounded-full object-cover w-20 h-20 border-2 border-border/50 bg-secondary shrink-0 hover:ring-4 hover:ring-primary/20 transition-all cursor-pointer"
                    />
                  </Link>
                ) : (
                  <div className="w-20 h-20 rounded-full border-2 border-border/50 bg-muted flex items-center justify-center shrink-0">
                    <Stethoscope className="h-8 w-8 text-muted-foreground mt-1" />
                  </div>
                )}
                <div className="text-center sm:text-left flex-1 min-w-0">
                  <h3 className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground mb-1.5">Medical Reviewer</h3>
                  <h4 className="text-lg font-bold tracking-tight mb-2 flex items-center justify-center sm:justify-start gap-2">
                    <Link href={post.reviewer.slug ? `/author/${post.reviewer.slug}` : "#"} className="hover:text-primary transition-colors hover:underline decoration-primary/30 underline-offset-4 truncate">
                      {post.reviewer.name}
                    </Link>
                    {post.reviewer.linkedin && (
                      <a
                        href={post.reviewer.linkedin}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-muted-foreground hover:text-[#0A66C2] transition-colors p-1 shrink-0"
                        title="LinkedIn Profile"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                          <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" />
                        </svg>
                      </a>
                    )}
                  </h4>
                  {post.reviewer.bio && (
                    <div className="text-[14px] leading-relaxed text-muted-foreground prose prose-zinc dark:prose-invert line-clamp-2">
                      <PortableText value={post.reviewer.bio} />
                    </div>
                  )}
                </div>
              </div>
            )}

          </div>
        </div>

        {/* ─── READ NEXT ─── */}
        {recentArticles.length > 0 && (
          <div id="read-next" className="max-w-300 mx-auto px-6 pb-20 border-t border-border pt-16">
            <h2 className="text-2xl font-bold tracking-tight mb-8">Read Next</h2>
            <div className="grid gap-x-6 gap-y-8 sm:grid-cols-2 lg:grid-cols-3">
              {recentArticles.map((article: RecentArticleCard) => (
                <Link href={`/post/${article.slug}`} key={article.id} className="group">
                  <article className="flex flex-col rounded-2xl overflow-hidden bg-card border border-border/40 shadow-[0_1px_3px_rgba(0,0,0,0.08)] hover:shadow-[0_8px_30px_rgba(0,0,0,0.12)] hover:-translate-y-1 transition-all duration-300 ease-out h-full">
                    {/* Card Image */}
                    <div className="relative w-full aspect-16/11 bg-secondary overflow-hidden">
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
                      <p className="text-xs text-muted-foreground mt-auto">
                        <FormattedDate date={article.date} /> &bull; {article.readTime}
                      </p>
                    </div>
                  </article>
                </Link>
              ))}
            </div>
          </div>
        )}
      </main>

      <Footer />
    </div>
  )
}
