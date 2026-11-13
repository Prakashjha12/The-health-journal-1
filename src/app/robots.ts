import { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://thehealthjournal.in'

  return {
    rules: {
      userAgent: '*',
      allow: ['/', '/llms.txt', '/llms-full.txt'],
      disallow: [
        '/studio/',
        '/api/',
        '/sign-in',
        '/sign-up',
        '/dashboard/',
        '/_clerk',
      ],
    },
    sitemap: `${baseUrl}/sitemap.xml`,
  }
}
