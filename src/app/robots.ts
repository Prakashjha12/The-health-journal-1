import { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://thehealthjournal.in'

  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: [
        '/studio/',       // Sanity Studio
        '/api/',          // Internal API routes
        '/sign-in',       // Clerk Sign-in page
        '/sign-up',       // Clerk Sign-up page
        '/user-profile',  // Clerk User Profile
        '/_clerk',        // Internal Clerk routes
      ],
    },
    sitemap: `${baseUrl}/sitemap.xml`,
  }
}