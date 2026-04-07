import { MetadataRoute } from 'next'
import { client } from '@/sanity/lib/client'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  // Hardcode the fallback to .in to prevent any environment variable mishaps
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://thehealthjournal.in'

  const postsQuery = `*[_type == "post" && defined(slug.current)] {
    "slug": slug.current,
    _updatedAt,
    publishedAt
  }`

  const authorsQuery = `*[_type == "author" && defined(slug.current)] {
    "slug": slug.current,
    _updatedAt
  }`

  const [posts, authors] = await Promise.all([
    client.fetch(postsQuery),
    client.fetch(authorsQuery)
  ])

  const postEntries: MetadataRoute.Sitemap = posts.map((post: any) => ({
    url: `${baseUrl}/post/${post.slug}`,
    lastModified: post._updatedAt || post.publishedAt || new Date().toISOString(),
    changeFrequency: 'weekly',
    priority: 0.8,
  }))

  const authorEntries: MetadataRoute.Sitemap = authors.map((author: any) => ({
    url: `${baseUrl}/author/${author.slug}`,
    lastModified: author._updatedAt || new Date().toISOString(),
    changeFrequency: 'monthly',
    priority: 0.5,
  }))

  const staticRoutes: MetadataRoute.Sitemap = [
    {
      url: `${baseUrl}`,
      lastModified: new Date().toISOString(),
      changeFrequency: 'daily',
      priority: 1,
    },
    {
      url: `${baseUrl}/articles`,
      lastModified: new Date().toISOString(),
      changeFrequency: 'daily',
      priority: 0.9,
    },
  ]

  return [...staticRoutes, ...postEntries, ...authorEntries]
}