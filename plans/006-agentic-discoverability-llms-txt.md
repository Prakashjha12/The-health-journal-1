# Plan 006: Agentic Discoverability via Dynamic llms.txt and llms-full.txt

> **Executor instructions**: Follow this plan step by step. Run every
> verification command and confirm the expected result before moving to the
> next step. If anything in the "STOP conditions" section occurs, stop and
> report — do not improvise. When done, update the status row for this plan
> in `plans/README.md` — unless a reviewer dispatched you and told you they
> maintain the index.
>
> **Drift check (run first)**: `git diff --stat 0923812..HEAD -- 'src/app/robots.ts'`
> If any in-scope file changed since this plan was written, compare the
> "Current state" excerpts against the live code before proceeding; on a
> mismatch, treat it as a STOP condition.

## Status

- **Priority**: P1
- **Effort**: S
- **Risk**: LOW
- **Depends on**: none
- **Category**: direction / agentic
- **Planned at**: commit `0923812`, 2026-11-13

## Why this matters

The Lighthouse Agentic Browsing category audits for a machine-readable summary at the domain root (`/llms.txt`). AI search agents (ChatGPT Search, Claude, Perplexity, Cursor) check `/llms.txt` to understand the domain's authority, topical specialty, and key article links without burning tokens scraping HTML and CSS. Creating dynamic route handlers for `/llms.txt` and `/llms-full.txt` powered by Sanity CMS gives AI agents immediate, authoritative context about The Health Journal and Dr. Rajnandini Dubey's medical journalism.

## Current state

- Neither `/llms.txt` nor `/llms-full.txt` exists.
- `src/app/robots.ts` allows `/` by default, but doesn't mention `llms.txt`.
- `client` in `src/sanity/lib/client.ts` is available to fetch posts from Sanity.

## Commands you will need

| Purpose   | Command                  | Expected on success |
|-----------|--------------------------|---------------------|
| Typecheck | `pnpm typecheck`         | exit 0, no errors   |
| Tests     | `pnpm test`              | exit 0, all pass    |
| Lint      | `pnpm run lint`          | exit 0              |

## Scope

**In scope**:
- `src/app/llms.txt/route.ts` (create)
- `src/app/llms-full.txt/route.ts` (create)
- `src/app/robots.ts`

**Out of scope**:
- `src/app/page.tsx`
- Layout or CSS files

## Git workflow

- Branch: `advisor/006-agentic-discoverability-llms-txt`
- Commit style: `feat: add dynamic llms.txt and llms-full.txt route handlers for AI agents`
- Do NOT push or open a PR unless instructed.

## Steps

### Step 1: Create `src/app/llms.txt/route.ts`

Create a Next.js route handler that queries Sanity for the latest published articles and returns an authoritative markdown overview:

```typescript
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
```

**Verify**: `pnpm typecheck` → exit 0

### Step 2: Create `src/app/llms-full.txt/route.ts`

Create a comprehensive full-text index handler:

```typescript
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
```

**Verify**: `pnpm typecheck` → exit 0

### Step 3: Update `src/app/robots.ts`

In `src/app/robots.ts`, add explicit allows and links for `llms.txt`:
```typescript
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
```

**Verify**: `pnpm typecheck` → exit 0

## Test plan

- Run `pnpm test` → all existing tests pass.
- Run `pnpm typecheck` → exit 0.
- Run `pnpm run lint` → exit 0.

## Done criteria

- [ ] `src/app/llms.txt/route.ts` exists and compiles cleanly.
- [ ] `src/app/llms-full.txt/route.ts` exists and compiles cleanly.
- [ ] `src/app/robots.ts` allows `/llms.txt` and disallows `/dashboard/`.
- [ ] `pnpm typecheck` exits 0.
- [ ] `pnpm test` exits 0.
- [ ] `pnpm run lint` exits 0.

## STOP conditions

- If Sanity client errors during build time when dataset is unset, fallback to placeholder data.

