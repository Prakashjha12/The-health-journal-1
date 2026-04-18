// import { MetadataRoute } from 'next'
// import { client } from '@/sanity/lib/client'

// export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
//   // Use a strict canonical domain for SEO consistency.
//   const baseUrl = 'https://thehealthjournal.in'

//   const postsQuery = `*[_type == "post" && defined(slug.current)] {
//     "slug": slug.current,
//     _updatedAt,
//     publishedAt
//   }`

//   const authorsQuery = `*[_type == "author" && defined(slug.current)] {
//     "slug": slug.current,
//     _updatedAt
//   }`

//   const [posts, authors] = await Promise.all([
//     client.fetch(postsQuery),
//     client.fetch(authorsQuery)
//   ])

//   const postEntries: MetadataRoute.Sitemap = posts.map((post: any) => ({
//     url: `${baseUrl}/post/${post.slug}`,
//     lastModified: post._updatedAt || post.publishedAt || new Date().toISOString(),
//     changeFrequency: 'weekly',
//     priority: 0.8,
//   }))

//   const authorEntries: MetadataRoute.Sitemap = authors.map((author: any) => ({
//     url: `${baseUrl}/author/${author.slug}`,
//     lastModified: author._updatedAt || new Date().toISOString(),
//     changeFrequency: 'monthly',
//     priority: 0.5,
//   }))

//   const staticRoutes: MetadataRoute.Sitemap = [
//     {
//       url: `${baseUrl}`,
//       lastModified: new Date().toISOString(),
//       changeFrequency: 'daily',
//       priority: 1,
//     }
//   ]
//   const staticPages = [
//     {
//       url: baseUrl,
//       lastModified: new Date(),
//       changeFrequency: 'daily',
//       priority: 1.0,
//     },
//     {
//       url: `${baseUrl}/about`,
//       lastModified: new Date(),
//       changeFrequency: 'monthly',
//       priority: 0.7,
//     },
//     {
//       url: `${baseUrl}/privacy`,
//       lastModified: new Date(),
//       changeFrequency: 'monthly',
//       priority: 0.3, // Lower priority so it doesn't outrank articles
//     },
//     {
//       url: `${baseUrl}/terms`,
//       lastModified: new Date(),
//       changeFrequency: 'monthly',
//       priority: 0.3,
//     },
//   ]

//   return [...staticRoutes, ...postEntries, ...authorEntries, ...staticPages]
// }

import { MetadataRoute } from 'next'
import { client } from '@/sanity/lib/client'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = 'https://thehealthjournal.in'

  // 1. Fetch Dynamic Data
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

  // 2. Map Posts (High Priority)
  const postEntries: MetadataRoute.Sitemap = posts.map((post: any) => ({
    url: `${baseUrl}/post/${post.slug}`,
    lastModified: post._updatedAt || post.publishedAt || new Date().toISOString(),
    changeFrequency: 'weekly',
    priority: 0.8,
  }))

  // 3. Map Authors (Medium Priority)
  const authorEntries: MetadataRoute.Sitemap = authors.map((author: any) => ({
    url: `${baseUrl}/author/${author.slug}`,
    lastModified: author._updatedAt || new Date().toISOString(),
    changeFrequency: 'monthly',
    priority: 0.5,
  }))

  // 4. Static Pages (One clean array, NO duplicates)
  const staticPages: MetadataRoute.Sitemap = [
    {
      url: `${baseUrl}`,
      lastModified: new Date().toISOString(),
      changeFrequency: 'daily',
      priority: 1.0,
    },
    {
      url: `${baseUrl}/about`,
      lastModified: new Date().toISOString(),
      changeFrequency: 'monthly',
      priority: 0.7, // Proves Dr. Rajnandini's expertise
    },
    {
      url: `${baseUrl}/privacy`,
      lastModified: new Date().toISOString(),
      changeFrequency: 'monthly',
      priority: 0.3, // "Hidden" from outranking articles
    },
    {
      url: `${baseUrl}/terms`,
      lastModified: new Date().toISOString(),
      changeFrequency: 'monthly',
      priority: 0.3,
    },
  ]

  return [...staticPages, ...postEntries, ...authorEntries]
}