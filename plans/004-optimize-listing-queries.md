# Plan 004: Optimize Listing Queries and Display Real Post Summaries on Cards

> **Executor instructions**: Follow this plan step by step. Run every
> verification command and confirm the expected result before moving to the
> next step. If anything in the "STOP conditions" section occurs, stop and
> report — do not improvise. When done, update the status row for this plan
> in `plans/README.md` — unless a reviewer dispatched you and told you they
> maintain the index.
>
> **Drift check (run first)**: `git diff --stat ea77466..HEAD -- 'src/sanity/lib/queries.ts' 'src/components/MedicalBlogUI.tsx' 'src/app/page.tsx' 'src/app/author/[slug]/page.tsx'`
> If any in-scope file changed since this plan was written, compare the
> "Current state" excerpts against the live code before proceeding; on a
> mismatch, treat it as a STOP condition.

## Status

- **Priority**: P2
- **Effort**: S
- **Risk**: LOW
- **Depends on**: plans/001-verification-baseline.md
- **Category**: perf / correctness
- **Planned at**: commit `ea77466`, 2026-11-13

## Why this matters

Currently, `searchPostsQuery`, `recentPostsQuery`, and `authorBySlugQuery` all fetch the complete PortableText `body` array for every post listed on the homepage, recent posts widget, and author pages. Transferring massive JSON trees for dozens of articles severely bloats network payload and increases client memory consumption. Furthermore, despite authors crafting concise summaries in Sanity CMS (`summary` field in `postType`), `searchPostsQuery` omits `summary`, forcing `MedicalBlogUI.tsx` to display a generic hardcoded sentence (`"Read this full article in our Medical Insights portal."`) on every post card and hero block.

## Current state

- `src/sanity/lib/queries.ts:86-98` (`searchPostsQuery`):
```groq
export const searchPostsQuery = groq`*[_type == "post" && defined(slug.current) && 
  ($searchQuery == "" || title match $searchQuery + "*" || summary match $searchQuery + "*" || pt::text(body) match $searchQuery + "*") &&
  ($category == "All" || $category in categories[]->title || ($category + " ") in categories[]->title)
] | order(publishedAt desc) {
  _id,
  title,
  slug,
  publishedAt,
  _createdAt,
  image,
  categories[]->{ title },
  body
}`
```
- `src/components/MedicalBlogUI.tsx:374-395`:
```typescript
    const mappedArticles = React.useMemo(() =>
        posts.map((post) => {
            const displayDate = post.publishedAt || post._createdAt || "2024-01-01"
            const readingTime = calculateReadingTime(post.body)
            const postCategory = post.categories && post.categories.length > 0 && post.categories[0].title
                ? post.categories[0].title
                : "Health"

            return {
                id: post._id,
                title: post.title,
                slug: post.slug?.current || '#',
                excerpt: "Read this full article in our Medical Insights portal.",
                category: postCategory,
                readTime: `${readingTime} min read`,
                date: displayDate,
                image: post.image,
                imageUrl: post.image ? urlFor(post.image).width(800).height(500).url() : null
            }
        }),
        [posts]
    )
```

## Commands you will need

| Purpose   | Command                  | Expected on success |
|-----------|--------------------------|---------------------|
| Typecheck | `pnpm typecheck`         | exit 0, no errors   |
| Tests     | `pnpm test`              | exit 0, all pass    |
| Lint      | `pnpm run lint`          | exit 0              |

## Scope

**In scope**:
- `src/sanity/lib/queries.ts`
- `src/app/page.tsx`
- `src/components/MedicalBlogUI.tsx`
- `src/app/author/[slug]/page.tsx`

**Out of scope**:
- `src/app/post/[slug]/page.tsx` (the individual post page still needs `body` to render article contents)
- `src/sanity/schemaTypes/postType.ts`

## Git workflow

- Branch: `advisor/004-optimize-listing-queries`
- Commit style: `perf: project summary instead of full body in listing queries`
- Do NOT push or open a PR unless instructed.

## Steps

### Step 1: Update GROQ queries in `src/sanity/lib/queries.ts`

In `searchPostsQuery`, `recentPostsQuery`, and `authorBySlugQuery`:
1. Add `summary` to the projection.
2. Add `"wordCount": count(string::split(pt::text(body), " "))` to allow computing reading time on the server without downloading the entire body array.
3. Remove `body` from `searchPostsQuery`, `recentPostsQuery`, and `authorBySlugQuery`.

```groq
export const searchPostsQuery = groq`*[_type == "post" && defined(slug.current) && 
  ($searchQuery == "" || title match $searchQuery + "*" || summary match $searchQuery + "*" || pt::text(body) match $searchQuery + "*") &&
  ($category == "All" || $category in categories[]->title || ($category + " ") in categories[]->title)
] | order(publishedAt desc) {
  _id,
  title,
  summary,
  slug,
  publishedAt,
  _createdAt,
  image,
  categories[]->{ title },
  "wordCount": count(string::split(pt::text(body), " "))
}`

export const recentPostsQuery = groq`*[_type == "post" && defined(slug.current) && slug.current != $slug] | order(publishedAt desc)[0...3] {
  _id,
  title,
  summary,
  slug,
  publishedAt,
  _createdAt,
  image,
  categories[]->{ title },
  author->{
    name,
    image
  },
  "wordCount": count(string::split(pt::text(body), " "))
}`
```

**Verify**: `pnpm typecheck` → exit 0

### Step 2: Update `src/app/page.tsx` and `src/components/MedicalBlogUI.tsx`

1. Update `Post` interface in `src/app/page.tsx` and `SanityPost` in `src/components/MedicalBlogUI.tsx` to include `summary?: string; wordCount?: number;`.
2. In `mappedArticles` in `src/components/MedicalBlogUI.tsx`:
   - Calculate reading time using `post.wordCount ? Math.max(1, Math.ceil(post.wordCount / 200)) : calculateReadingTime(post.body)`.
   - Set `excerpt: post.summary || "Explore evidence-based health research and wellness insights."`.
3. In `src/app/author/[slug]/page.tsx`:
   - Update reading time calculation for author articles to use `post.wordCount ? Math.max(1, Math.ceil(post.wordCount / 200)) : 1`.

**Verify**: `pnpm typecheck` → exit 0

## Test plan

- Run `pnpm test` → all tests pass.
- Run `pnpm typecheck` → exit 0.
- Run `pnpm run lint` → exit 0.

## Done criteria

- [ ] `searchPostsQuery` in `src/sanity/lib/queries.ts` does NOT fetch `body`.
- [ ] `MedicalBlogUI` maps `post.summary` into the article card excerpt.
- [ ] `pnpm typecheck` exits 0.
- [ ] `pnpm test` exits 0.

## STOP conditions

- If `string::split` or `pt::text` in GROQ fails on older Sanity dataset API versions, fall back to calculating reading time from `summary` length.

## Maintenance notes

- When adding new post card layouts or grids, always query `summary` and `wordCount` rather than downloading the entire `body` payload.

