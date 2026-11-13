import { NextRequest, NextResponse } from 'next/server'
import { sanityFetch } from '@/sanity/lib/live'
import { client } from '@/sanity/lib/client'
import { dataset, projectId } from '@/sanity/env'
import { postBySlugQuery } from '@/sanity/lib/queries'
import { portableTextToMarkdown } from '@/lib/portabletext-to-markdown'

export const revalidate = 3600

interface PostQueryResult {
  _id?: string
  title?: string
  summary?: string
  slug?: { current?: string }
  publishedAt?: string
  _createdAt?: string
  _updatedAt?: string
  categories?: { title?: string }[]
  author?: {
    name?: string
    slug?: string
  }
  reviewer?: {
    name?: string
    slug?: string
  }
  body?: unknown[]
  faqs?: {
    question?: string
    answer?: string
  }[]
  tags?: string[]
}

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const rawSlug = (await params).slug
  const slug = rawSlug.replace(/\.md$/, '')

  const isConfigured = projectId !== 'placeholder' && dataset !== 'placeholder'
  let post: PostQueryResult | null = null

  if (isConfigured) {
    try {
      const response = await sanityFetch({
        query: postBySlugQuery,
        params: { slug },
        tags: ['posts', `post:${slug}`],
      })
      post = (response?.data as PostQueryResult) || null
    } catch {
      try {
        post = await client.fetch<PostQueryResult>(postBySlugQuery, { slug })
      } catch (err) {
        console.error('Error fetching post for markdown route:', err)
        post = null
      }
    }
  }

  if (!post || !post.title) {
    return new NextResponse('Article not found', {
      status: 404,
      headers: {
        'Content-Type': 'text/plain; charset=utf-8',
      },
    })
  }

  const title = post.title
  const date = post.publishedAt || post._createdAt || ''
  const authorName = post.author?.name || 'Dr. Rajnandini Dubey'
  const categories = Array.isArray(post.categories)
    ? post.categories
        .map((c) => c?.title)
        .filter((t): t is string => Boolean(t && t.trim()))
    : []
  const category = categories[0] || 'Health'
  const canonicalUrl = `https://thehealthjournal.in/post/${slug}`

  const frontmatterLines = [
    '---',
    `title: ${JSON.stringify(title)}`,
    `slug: ${JSON.stringify(slug)}`,
    `date: ${JSON.stringify(date)}`,
    `author: ${JSON.stringify(authorName)}`,
    `category: ${JSON.stringify(category)}`,
    `categories: ${JSON.stringify(categories.length > 0 ? categories : [category])}`,
    `canonicalUrl: ${JSON.stringify(canonicalUrl)}`,
    '---',
  ]

  const sections: string[] = [frontmatterLines.join('\n'), `# ${title}`]

  if (post.summary && post.summary.trim()) {
    sections.push(`> Clinical Summary: ${post.summary.trim()}`)
  }

  const bodyMarkdown = portableTextToMarkdown(post.body)
  if (bodyMarkdown) {
    sections.push(bodyMarkdown)
  }

  if (Array.isArray(post.faqs) && post.faqs.length > 0) {
    const faqBlocks = post.faqs
      .filter((faq) => faq && faq.question && faq.answer)
      .map((faq) => `### Q: ${faq.question?.trim()}\n\nA: ${faq.answer?.trim()}`)

    if (faqBlocks.length > 0) {
      sections.push(
        `## Frequently Asked Questions\n\n${faqBlocks.join('\n\n')}`
      )
    }
  }

  const markdownContent = sections.join('\n\n') + '\n'

  return new NextResponse(markdownContent, {
    status: 200,
    headers: {
      'Content-Type': 'text/markdown; charset=utf-8',
      'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=86400',
      Vary: 'Accept',
    },
  })
}
