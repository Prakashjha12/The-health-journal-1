import { sanityFetch } from '@/sanity/lib/live'
import { postsQuery } from '@/sanity/lib/queries'
import MedicalBlogUI from '@/components/MedicalBlogUI'
import { getBookmarks } from '@/lib/actions/user.actions'

// Define the type for a single post based on the postsQuery
// Assuming postsQuery returns an array of objects with at least _id, title, and slug.current
// You might need to adjust this interface based on the actual structure of your Sanity posts.
interface Post {
  _id: string;
  title: string;
  slug: {
    current: string;
  };
  publishedAt?: string;
  _createdAt?: string;
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

export default async function Home() {
  // Fetch from Sanity on the server only if configured
  const isConfigured = projectId !== 'placeholder' && dataset !== 'placeholder'

  const postsResponse = isConfigured
    ? await sanityFetch({ query: postsQuery })
    : { data: [] }
  const posts: Post[] = postsResponse.data

  // Fetch bookmarks
  const bookmarkedArticleIds: string[] = await getBookmarks()

  // Pass it to the showcase Next.js Client Component
  return <MedicalBlogUI posts={posts} bookmarkedArticleIds={bookmarkedArticleIds} />
}
