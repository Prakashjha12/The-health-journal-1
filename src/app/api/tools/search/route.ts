import { NextRequest, NextResponse } from 'next/server'
import { client } from '@/sanity/lib/client'
import { searchPostsQuery } from '@/sanity/lib/queries'

export const dynamic = 'force-dynamic'

interface SanityPostItem {
  _id: string
  title: string
  summary?: string
  slug?: { current?: string } | string
  publishedAt?: string
  _createdAt?: string
  categories?: { title?: string }[]
  wordCount?: number
}

export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl
  const rawQuery = searchParams.get('query') ?? searchParams.get('q') ?? ''
  const categoryParam = searchParams.get('category') ?? ''

  const query = rawQuery.trim()
  const category = categoryParam.trim()

  if (!query) {
    return NextResponse.json({
      query: '',
      resultsCount: 0,
      articles: [],
    })
  }

  let posts: SanityPostItem[] = []

  try {
    const fetched = await client.fetch<SanityPostItem[]>(searchPostsQuery, {
      queryString: `*${query}*`,
      searchQuery: query,
      category: category || 'All',
    })
    posts = Array.isArray(fetched) ? fetched : []
  } catch (err) {
    console.warn('WebMCP search API tool Sanity fetch error:', err)
    posts = []
  }

  const articles = posts.map((post) => {
    const slugStr =
      typeof post.slug === 'string'
        ? post.slug
        : post.slug?.current || ''
    const mins = post.wordCount ? Math.max(1, Math.ceil(post.wordCount / 200)) : 1
    const postCategory =
      post.categories && post.categories.length > 0 && post.categories[0]?.title
        ? post.categories[0].title
        : category && category !== 'All'
          ? category
          : 'General'

    return {
      id: post._id,
      title: post.title,
      slug: slugStr,
      url: `https://thehealthjournal.in/post/${slugStr}`,
      summary: post.summary || '',
      readTime: `${mins} min read`,
      category: postCategory,
      publishedAt: post.publishedAt || post._createdAt || '',
    }
  })

  return NextResponse.json(
    {
      query,
      resultsCount: articles.length,
      articles,
    },
    {
      headers: {
        'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=600',
      },
    }
  )
}
