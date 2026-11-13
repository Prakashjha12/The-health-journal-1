import { describe, it, expect, vi, beforeEach } from 'vitest'
import { NextRequest } from 'next/server'
import { GET } from './route'

vi.mock('@/sanity/lib/client', () => ({
  client: {
    fetch: vi.fn(),
  },
}))

describe('/api/tools/search route handler', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('returns empty results when query is missing', async () => {
    const req = new NextRequest('https://thehealthjournal.in/api/tools/search')
    const response = await GET(req)

    expect(response.status).toBe(200)
    const json = await response.json()
    expect(json).toEqual({
      query: '',
      resultsCount: 0,
      articles: [],
    })
  })

  it('returns empty results when query is only whitespace', async () => {
    const req = new NextRequest('https://thehealthjournal.in/api/tools/search?query=%20%20')
    const response = await GET(req)

    expect(response.status).toBe(200)
    const json = await response.json()
    expect(json).toEqual({
      query: '',
      resultsCount: 0,
      articles: [],
    })
  })

  it('accepts query via "q" parameter and returns mapped articles with Cache-Control headers', async () => {
    const { client } = await import('@/sanity/lib/client')
    const mockPosts = [
      {
        _id: 'post-123',
        title: 'Hypertension Management Guidelines',
        summary: 'Clinical advice for blood pressure management.',
        slug: { current: 'hypertension-management-guidelines' },
        publishedAt: '2026-02-15T10:00:00Z',
        categories: [{ title: 'Cardiology' }],
        wordCount: 450,
      },
      {
        _id: 'post-456',
        title: 'Dietary Approaches to Stop Hypertension (DASH)',
        summary: 'Nutritional strategies for heart health.',
        slug: { current: 'dash-diet-overview' },
        _createdAt: '2026-01-20T08:00:00Z',
        categories: [],
        wordCount: 150,
      },
    ]

    const mockFetch = client.fetch as unknown as {
      mockResolvedValueOnce: (val: unknown) => void
    }
    mockFetch.mockResolvedValueOnce(mockPosts)

    const req = new NextRequest('https://thehealthjournal.in/api/tools/search?q=hypertension')
    const response = await GET(req)

    expect(response.status).toBe(200)
    expect(response.headers.get('cache-control')).toBe(
      'public, s-maxage=300, stale-while-revalidate=600'
    )

    const json = await response.json()
    expect(json.query).toBe('hypertension')
    expect(json.resultsCount).toBe(2)
    expect(json.articles).toEqual([
      {
        id: 'post-123',
        title: 'Hypertension Management Guidelines',
        slug: 'hypertension-management-guidelines',
        url: 'https://thehealthjournal.in/post/hypertension-management-guidelines',
        summary: 'Clinical advice for blood pressure management.',
        readTime: '3 min read',
        category: 'Cardiology',
        publishedAt: '2026-02-15T10:00:00Z',
      },
      {
        id: 'post-456',
        title: 'Dietary Approaches to Stop Hypertension (DASH)',
        slug: 'dash-diet-overview',
        url: 'https://thehealthjournal.in/post/dash-diet-overview',
        summary: 'Nutritional strategies for heart health.',
        readTime: '1 min read',
        category: 'General',
        publishedAt: '2026-01-20T08:00:00Z',
      },
    ])

    expect(client.fetch).toHaveBeenCalledWith(
      expect.anything(),
      expect.objectContaining({
        queryString: '*hypertension*',
        searchQuery: 'hypertension',
        category: 'All',
      })
    )
  })

  it('respects optional category parameter and passes it to Sanity', async () => {
    const { client } = await import('@/sanity/lib/client')
    const mockFetch = client.fetch as unknown as {
      mockResolvedValueOnce: (val: unknown) => void
    }
    mockFetch.mockResolvedValueOnce([])

    const req = new NextRequest(
      'https://thehealthjournal.in/api/tools/search?query=yoga&category=Wellness'
    )
    const response = await GET(req)

    expect(response.status).toBe(200)
    const json = await response.json()
    expect(json.query).toBe('yoga')
    expect(json.resultsCount).toBe(0)
    expect(json.articles).toEqual([])

    expect(client.fetch).toHaveBeenCalledWith(
      expect.anything(),
      expect.objectContaining({
        queryString: '*yoga*',
        searchQuery: 'yoga',
        category: 'Wellness',
      })
    )
  })

  it('recovers gracefully from Sanity fetch error returning an empty article list', async () => {
    const { client } = await import('@/sanity/lib/client')
    vi.mocked(client.fetch).mockRejectedValueOnce(new Error('Sanity timeout'))

    const req = new NextRequest('https://thehealthjournal.in/api/tools/search?query=diabetes')
    const response = await GET(req)

    expect(response.status).toBe(200)
    const json = await response.json()
    expect(json.query).toBe('diabetes')
    expect(json.resultsCount).toBe(0)
    expect(json.articles).toEqual([])
  })
})
