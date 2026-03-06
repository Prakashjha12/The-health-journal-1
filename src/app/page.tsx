import { client } from '@/sanity/lib/client'
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

export const revalidate = 60 // Revalidate cache every 60 seconds

export default async function Home() {
  // Fetch from Sanity on the server
  const posts: Post[] = await client.fetch(postsQuery)

  // Fetch bookmarks
  const bookmarkedArticleIds: string[] = await getBookmarks()

  // Pass it to the showcase Next.js Client Component
  return <MedicalBlogUI posts={posts} bookmarkedArticleIds={bookmarkedArticleIds} />
}
