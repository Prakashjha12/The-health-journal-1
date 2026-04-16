import { sanityFetch } from '@/sanity/lib/live'
import { searchPostsQuery } from '@/sanity/lib/queries'
import MedicalBlogUI from '@/components/MedicalBlogUI'
import { getBookmarks } from '@/lib/actions/user.actions'
import { urlFor } from '@/sanity/lib/image'

interface Post {
  _id: string;
  title: string;
  slug: {
    current: string;
  };
  publishedAt?: string;
  _createdAt?: string;
  categories?: { title: string }[];
  image?: {
    _type: 'image';
    asset: {
      _ref: string;
      _type: 'reference';
    };
  } | null;
  body?: unknown[];
}

import { dataset, projectId } from '@/sanity/env'

export default async function Home({
  searchParams,
}: {
  searchParams: Promise<{ query?: string; category?: string }>;
}) {
  const { query = "", category = "All" } = await searchParams;

  // const jsonLd = {
  //   "@context": "https://schema.org",
  //   "@type": "WebSite",
  //   "name": "The Health Journal",
  //   "url": "https://thehealthjournal.in/",
  //   "alternateName": ["THJ", "The Health Journal"]
  // };
  // Fetch from Sanity on the server only if configured


  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebSite",
        "@id": "https://thehealthjournal.in/#website",
        "url": "https://thehealthjournal.in/",
        "name": "The Health Journal",
        "alternateName": ["THJ"],
        "publisher": { "@id": "https://thehealthjournal.in/#organization" },
        // This adds the "Search Box" feature in Google results
        "potentialAction": {
          "@type": "SearchAction",
          "target": "https://thehealthjournal.in/?query={search_term_string}",
          "query-input": "required name=search_term_string"
        }
      },
      {
        "@type": "MedicalOrganization",
        "@id": "https://thehealthjournal.in/#organization",
        "name": "The Health Journal",
        "url": "https://thehealthjournal.in/",
        "logo": "https://thehealthjournal.in/LOGO.webp", // Ensure this path is correct
        "description": "A premier medical journal providing evidence-based health insights and professional wellness guides.",
        "medicalSpecialty": "General Medicine",
        "address": {
          "@type": "PostalAddress",
          "addressCountry": "IN"
        },
        "sameAs": [
          "https://www.instagram.com/thehealthjournal", // Add your actual social links here
          "https://www.linkedin.com/company/thehealthjournal"
        ]
      }
    ]
  };
  const isConfigured = projectId !== 'placeholder' && dataset !== 'placeholder'

  const postsResponse = isConfigured
    ? await sanityFetch({
      query: searchPostsQuery,
      params: { query, category } as any,
    })
    : { data: [] }
  const posts: Post[] = postsResponse.data

  // Fetch bookmarks
  const bookmarkedArticleIds: string[] = await getBookmarks()
  const featuredPost = posts[0] // The first post is the "Hero"
  const lcpImageUrl = featuredPost?.image
    ? urlFor(featuredPost.image).width(1000).quality(80).auto('format').url()
    : null

  // Pass it to the showcase Next.js Client Component
  return (
    <div className="contents">
      {/* ─── 2. Place Script at the very top of the body ─── */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      {/* ─── 3. Preload in Head ─── */}
      {lcpImageUrl && (
        <head>
          <link
            rel="preload"
            as="image"
            href={lcpImageUrl}
            fetchPriority="high"
          />
        </head>
      )}

      <MedicalBlogUI
        posts={posts}
        bookmarkedArticleIds={bookmarkedArticleIds}
        initialQuery={query}
        initialCategory={category}
      />
    </div>
  );
}