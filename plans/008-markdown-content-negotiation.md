# Plan 008: Markdown Content Negotiation & Structured Metadata for AI Readers

## Goal
Enable automated AI agents, LLMs, and research tools (such as Claude, Perplexity, Gemini, OpenAI web browsing agents, or curl CLI) to retrieve clean, token-efficient, formatted Markdown for any article instead of parsing noisy HTML, through HTTP content negotiation (`Accept: text/markdown`) and direct `.md` URLs.

## Background & Alignment
- **Agent Token Efficiency**: LLM web navigation agents spend up to 80% fewer tokens and avoid parsing hydration scripts, CSS, SVG icons, and DOM nodes when served clean Markdown.
- **HTTP Content Negotiation**: RFC 9110 standard content negotiation using the `Accept: text/markdown` or `Accept: text/plain` header.
- **Next.js App Router Architecture**:
  In Next.js, a page (`src/app/post/[slug]/page.tsx`) and a route handler cannot share the exact same filesystem directory `/post/[slug]`.
  Instead:
  1. We implement a lightweight rewrite rule in `src/proxy.ts`:
     When a request arrives at `/post/:slug` (or `/post/:slug.md`) with `Accept: text/markdown` (or ending in `.md`), rewrite to `/api/markdown-post/:slug`.
  2. Implement `src/app/api/markdown-post/[slug]/route.ts` to fetch article data from Sanity and stream clean, formatted Markdown with YAML frontmatter, medical disclaimers, headings, and FAQ blocks.
  3. In `src/app/post/[slug]/page.tsx`, add an `<link rel="alternate" type="text/markdown" href="/post/${slug}.md" />` tag in metadata so AI web search crawlers discover the markdown endpoint automatically.

## Target Files
1. `src/proxy.ts`
2. `src/app/api/markdown-post/[slug]/route.ts` (new)
3. `src/lib/portabletext-to-markdown.ts` (new utility helper)
4. `src/lib/portabletext-to-markdown.test.ts` (new unit tests)
5. `src/app/post/[slug]/page.tsx` (add metadata `alternates.types`)

## Detailed Implementation Steps

### 1. `src/lib/portabletext-to-markdown.ts`
A strict, zero-dependency helper that converts Sanity PortableText block arrays into standard GitHub Flavored Markdown:
- Headings (`h1`, `h2`, `h3`, `h4`) -> `#`, `##`, `###`, `####`
- Normal paragraphs -> clean paragraphs separated by double newlines
- List items (`bullet` / `number`) -> `* ` / `1. `
- Strong / Emphasis / Link marks -> `**bold**`, `*italic*`, `[text](url)`
- Fallback gracefully for unknown blocks without throwing.

### 2. `src/lib/portabletext-to-markdown.test.ts`
Add unit tests verifying:
- Formatting of headings, paragraphs, and list items.
- Formatting of bold, italic, and hyperlink marks.
- Handling of empty or invalid input without runtime errors.

### 3. `src/app/api/markdown-post/[slug]/route.ts`
- Extract `slug` parameter (handling potential `.md` suffix by stripping it).
- Fetch article using existing `postBySlugQuery` in `src/sanity/lib/queries.ts`.
- Return 404 with plain text message if post not found.
- Format Markdown document:
  ```markdown
  ---
  title: "Understanding Cardiovascular Health"
  slug: "understanding-cardiovascular-health"
  publishedAt: "2024-01-15T00:00:00Z"
  author: "Dr. Rajnandini Dubey"
  categories: ["Health", "Cardiology"]
  canonicalUrl: "https://thehealthjournal.in/post/understanding-cardiovascular-health"
  ---

  # Understanding Cardiovascular Health

  **Clinical Summary:** Explore the latest research on heart health, preventive measures, and innovative treatments.

  [Body in Markdown]

  ## Frequently Asked Questions
  ### Q: How often should I get my heart checked?
  A: It is recommended to...
  ```
- Return response with headers:
  - `Content-Type: text/markdown; charset=utf-8`
  - `Cache-Control: public, s-maxage=3600, stale-while-revalidate=86400`
  - `Vary: Accept`

### 4. `src/proxy.ts`
Update routing logic:
- Add `/api/markdown-post(.*)` to public routes.
- Detect if request matches `/post/([^/]+)`:
  - Check if `req.headers.get("accept")?.includes("text/markdown")` OR `req.nextUrl.pathname.endsWith(".md")`.
  - If true, rewrite to `/api/markdown-post/${slug}`.

### 5. `src/app/post/[slug]/page.tsx`
In `generateMetadata`:
- Add `alternates: { canonical: ..., types: { "text/markdown": `https://thehealthjournal.in/post/${slug}.md` } }`.

## Verification Checklist
- [ ] `pnpm test` (all tests pass, including new markdown conversion unit tests)
- [ ] `pnpm typecheck` (zero TypeScript errors)
- [ ] `pnpm run lint` (zero ESLint errors)
- [ ] Test markdown response endpoint with simulated `Accept: text/markdown`

