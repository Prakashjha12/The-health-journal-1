import { client } from '../../../sanity/lib/client'
import { postBySlugQuery } from '../../../sanity/lib/queries'
import { PortableText } from '@portabletext/react'
import Image from 'next/image'
import { urlFor } from '../../../sanity/lib/image'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'

export const revalidate = 60 // Revalidate cache every 60 seconds

export default async function PostPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const post = await client.fetch(postBySlugQuery, { slug })

  if (!post) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-24 text-center">
        <h1 className="text-3xl font-bold mb-4">Post not found</h1>
        <Link href="/" className="text-blue-600 hover:underline inline-flex items-center gap-2">
          <ArrowLeft size={16} /> Back to home
        </Link>
      </div>
    )
  }

  return (
    <article className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
      <div className="mb-8">
        <Link href="/" className="inline-flex items-center gap-2 text-sm font-medium text-zinc-500 hover:text-black dark:hover:text-white transition-colors">
          <ArrowLeft size={16} /> Back to all posts
        </Link>
      </div>
      
      <header className="mb-10 text-center sm:text-left">
        <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight mb-6 leading-tight">{post.title}</h1>
        <div className="flex items-center justify-center sm:justify-start gap-4 text-zinc-500 dark:text-zinc-400 font-medium">
          <time dateTime={post.publishedAt || post._createdAt}>
            {new Date(post.publishedAt || post._createdAt).toLocaleDateString('en-US', {
              month: 'long',
              day: 'numeric',
              year: 'numeric'
            })}
          </time>
          {post.author && (
            <>
              <span className="w-1 h-1 rounded-full bg-zinc-300 dark:bg-zinc-700" />
              <span>By {post.author.name || 'Author'}</span>
            </>
          )}
        </div>
      </header>
      
      {post.mainImage && (
        <div className="mb-12 rounded-3xl overflow-hidden shadow-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-100 dark:bg-zinc-900">
          <Image
            src={urlFor(post.mainImage)?.url() as string}
            alt={post.mainImage.alt || post.title}
            width={1200}
            height={600}
            className="w-full h-auto object-cover max-h-[600px]"
            priority
          />
        </div>
      )}

      <div className="prose prose-zinc dark:prose-invert md:prose-lg mx-auto prose-img:rounded-xl prose-a:text-blue-600 dark:prose-a:text-blue-400 max-w-none">
        <PortableText value={post.body} />
      </div>
    </article>
  )
}
