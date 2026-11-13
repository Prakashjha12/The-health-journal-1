import { client } from '@/sanity/lib/client'
import { dataset, projectId } from '@/sanity/env'

export const revalidate = 3600

export async function GET() {
  const isConfigured = projectId !== 'placeholder' && dataset !== 'placeholder'

  let posts: {
    title: string
    slug?: { current?: string }
    summary?: string
    publishedAt?: string
    categories?: { title: string }[]
    author?: { name: string; profession?: string }
  }[] = []

  if (isConfigured) {
    try {
      posts = await client.fetch(
        `*[_type == "post" && defined(slug.current)] | order(publishedAt desc) {
          title,
          slug,
          summary,
          publishedAt,
          categories[]->{ title },
          author->{ name, profession }
        }`
      )
    } catch (err) {
      console.error('Error generating llms-full.txt:', err)
    }
  }

  const entries = posts
    .map((p) => {
      const category = p.categories?.[0]?.title || 'General Health'
      const author = p.author?.name ? ` by ${p.author.name}` : ''
      const date = p.publishedAt ? ` (${p.publishedAt.slice(0, 10)})` : ''
      return `### [${p.title}](https://thehealthjournal.in/post/${p.slug?.current || ''})
- **Topic**: ${category}${author}${date}
- **Summary**: ${p.summary || 'Clinical overview.'}
`
    })
    .join('\n')

  const markdown = `# The Health Journal — Full Machine-Readable Knowledge Base

Website: https://thehealthjournal.in
Chief Medical Editor: Dr. Rajnandini Dubey (MPT Sports)
Location: India (Global reach)

---

## All Published Articles

${entries || 'No articles indexed yet.'}
`

  return new Response(markdown, {
    status: 200,
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
      'Cache-Control': 'public, max-age=3600, s-maxage=86400',
    },
  })
}
