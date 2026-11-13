import { describe, it, expect, vi, beforeEach } from 'vitest'
import { NextRequest } from 'next/server'
import { GET } from './route'

vi.mock('@/sanity/lib/live', () => ({
  sanityFetch: vi.fn(),
}))

vi.mock('@/sanity/lib/client', () => ({
  client: {
    fetch: vi.fn(),
  },
}))

vi.mock('@/sanity/env', () => ({
  projectId: 'test-project',
  dataset: 'production',
}))

describe('/api/markdown-post/[slug] route handler', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('returns 404 text response when article is not found', async () => {
    const { sanityFetch } = await import('@/sanity/lib/live')
    vi.mocked(sanityFetch).mockResolvedValueOnce({
      data: null,
      sourceMap: null,
      tags: [],
    })

    const req = new NextRequest('https://thehealthjournal.in/api/markdown-post/missing-article')
    const response = await GET(req, {
      params: Promise.resolve({ slug: 'missing-article' }),
    })

    expect(response.status).toBe(404)
    expect(response.headers.get('content-type')).toContain('text/plain')
    const text = await response.text()
    expect(text).toBe('Article not found')
  })

  it('normalizes .md extension in slug and returns clean markdown with frontmatter', async () => {
    const { sanityFetch } = await import('@/sanity/lib/live')
    const mockPost = {
      _id: 'post-1',
      title: 'Cardiovascular Health Guide',
      summary: 'Essential advice for maintaining heart health.',
      slug: { current: 'cardiovascular-health-guide' },
      publishedAt: '2026-03-01T10:00:00Z',
      categories: [{ title: 'Cardiology' }, { title: 'Wellness' }],
      author: { name: 'Dr. Rajnandini Dubey' },
      body: [
        {
          _type: 'block',
          style: 'h2',
          children: [{ _type: 'span', text: 'Why Cardio Matters' }],
        },
        {
          _type: 'block',
          style: 'normal',
          children: [
            { _type: 'span', text: 'Regular exercise improves ' },
            { _type: 'span', text: 'vascular tone', marks: ['strong'] },
            { _type: 'span', text: '.' },
          ],
        },
        {
          _type: 'block',
          listItem: 'bullet',
          children: [{ _type: 'span', text: '30 mins of daily walking' }],
        },
      ],
      faqs: [
        {
          question: 'How much cardio do I need?',
          answer: 'At least 150 minutes of moderate activity per week.',
        },
      ],
    }

    vi.mocked(sanityFetch).mockResolvedValueOnce({
      data: mockPost,
      sourceMap: null,
      tags: [],
    })

    const req = new NextRequest(
      'https://thehealthjournal.in/api/markdown-post/cardiovascular-health-guide.md',
      {
        headers: { Accept: 'text/markdown' },
      }
    )

    const response = await GET(req, {
      params: Promise.resolve({ slug: 'cardiovascular-health-guide.md' }),
    })

    expect(response.status).toBe(200)
    expect(response.headers.get('content-type')).toContain('text/markdown')
    expect(response.headers.get('cache-control')).toBe(
      'public, s-maxage=3600, stale-while-revalidate=86400'
    )
    expect(response.headers.get('vary')).toBe('Accept')

    const markdown = await response.text()

    // Frontmatter checks
    expect(markdown).toContain('---')
    expect(markdown).toContain('title: "Cardiovascular Health Guide"')
    expect(markdown).toContain('slug: "cardiovascular-health-guide"')
    expect(markdown).toContain('date: "2026-03-01T10:00:00Z"')
    expect(markdown).toContain('author: "Dr. Rajnandini Dubey"')
    expect(markdown).toContain('category: "Cardiology"')
    expect(markdown).toContain('canonicalUrl: "https://thehealthjournal.in/post/cardiovascular-health-guide"')

    // Heading & Clinical Summary
    expect(markdown).toContain('# Cardiovascular Health Guide')
    expect(markdown).toContain('> Clinical Summary: Essential advice for maintaining heart health.')

    // Body
    expect(markdown).toContain('## Why Cardio Matters')
    expect(markdown).toContain('Regular exercise improves **vascular tone**.')
    expect(markdown).toContain('* 30 mins of daily walking')

    // FAQs
    expect(markdown).toContain('## Frequently Asked Questions')
    expect(markdown).toContain('### Q: How much cardio do I need?')
    expect(markdown).toContain('A: At least 150 minutes of moderate activity per week.')
  })
})
