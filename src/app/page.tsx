import { client } from '@/sanity/lib/client'
import { postsQuery } from '@/sanity/lib/queries'
import MedicalBlogUI from '@/components/MedicalBlogUI'

export const revalidate = 60 // Revalidate cache every 60 seconds

export default async function Home() {
  // Fetch from Sanity on the server
  const posts = await client.fetch(postsQuery)

  // Pass it to the showcase Next.js Client Component
  return <MedicalBlogUI posts={posts} />
}
