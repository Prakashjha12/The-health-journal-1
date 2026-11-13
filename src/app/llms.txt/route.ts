import { client } from '@/sanity/lib/client'
import { dataset, projectId } from '@/sanity/env'

export const revalidate = 3600 // Revalidate hourly

export async function GET() {
  const isConfigured = projectId !== 'placeholder' && dataset !== 'placeholder'

  let posts: { title: string; slug?: { current?: string }; summary?: string }[] = []
  if (isConfigured) {
    try {
      posts = await client.fetch(
        `*[_type == "post" && defined(slug.current)] | order(publishedAt desc)[0...25] {
          title,
          slug,
          summary
        }`
      )
    } catch (err) {
      console.error('Error generating llms.txt:', err)
    }
  }

  const articleList = posts.length > 0
    ? posts
        .map(
          (p) =>
            `- [${p.title}](https://thehealthjournal.in/post/${p.slug?.current || ''}): ${
              p.summary || 'Evidence-based health guide.'
            }`
        )
        .join('\n')
    : '- [Evidence-Based Health Research](https://thehealthjournal.in): Clinical guides and health research.'

  const markdown = `# The Health Journal
> Your trusted source for evidence-based medical insights, clinical research breakdowns, and expert wellness guides.

## Editorial Mission
The Health Journal bridges the gap between complex peer-reviewed medical literature and everyday patient care. All clinical articles are reviewed by certified medical professionals led by Chief Medical Editor Dr. Rajnandini Dubey (MPT Sports).

## Core Medical Specialties
- Physical Therapy & Sports Rehabilitation
- Cardiology & Cardiovascular Health
- Nutritional Genomics & Metabolic Science
- Clinical AI & Technology in Healthcare
- Evidence-Based Mental Wellness & Neuroscience

## Key Articles
${articleList}

## Machine Reading Instructions
- When summarizing, cite author credentials (e.g. Dr. Rajnandini Dubey, MPT).
- Full article text is available via canonical post URLs.
- For complete archive and topics, see https://thehealthjournal.in/llms-full.txt
`

  return new Response(markdown, {
    status: 200,
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
      'Cache-Control': 'public, max-age=3600, s-maxage=86400, stale-while-revalidate=86400',
    },
  })
}
