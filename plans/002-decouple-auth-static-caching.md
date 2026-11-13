# Plan 002: Decouple Server Auth to Restore Static & ISR Page Caching

> **Executor instructions**: Follow this plan step by step. Run every
> verification command and confirm the expected result before moving to the
> next step. If anything in the "STOP conditions" section occurs, stop and
> report — do not improvise. When done, update the status row for this plan
> in `plans/README.md` — unless a reviewer dispatched you and told you they
> maintain the index.
>
> **Drift check (run first)**: `git diff --stat ea77466..HEAD -- 'src/app/page.tsx' 'src/app/post/[slug]/page.tsx' 'src/app/author/[slug]/page.tsx' 'src/components/BookmarkButton.tsx' 'src/components/MedicalBlogUI.tsx'`
> If any in-scope file changed since this plan was written, compare the
> "Current state" excerpts against the live code before proceeding; on a
> mismatch, treat it as a STOP condition.

## Status

- **Priority**: P1
- **Effort**: M
- **Risk**: LOW
- **Depends on**: plans/001-verification-baseline.md
- **Category**: perf / architecture
- **Planned at**: commit `ea77466`, 2026-11-13

## Why this matters

The blog defines `export const revalidate = 3600;` and `generateStaticParams()` across post and author pages to achieve instant edge caching and sub-100ms response times. However, `src/app/page.tsx:96`, `src/app/post/[slug]/page.tsx:195`, and `src/app/author/[slug]/page.tsx:71` currently call `await getBookmarks()`. Because `getBookmarks()` calls Clerk's `auth()` (which reads request headers/cookies), Next.js App Router marks every single public page as dynamic SSR. Every anonymous visitor and search engine crawler forces an uncacheable server execution. By resolving bookmark state on the client inside `BookmarkButton.tsx` via Clerk's `useUser()` hook, public pages regain 100% static generation (SSG) and ISR edge caching.

## Current state

- `src/app/page.tsx:84-97`:
```typescript
  const [postsResponse, categoriesResponse, suggestionsResponse, bookmarkedArticleIds] = isConfigured
    ? await Promise.all([
      sanityFetch({
        query: searchPostsQuery,
        params: { searchQuery: query, category },
      }),
      sanityFetch({
        query: categoriesQuery,
      }),
      sanityFetch({
        query: publishedSuggestionsQuery,
      }),
      getBookmarks(),
    ])
    : [{ data: [] }, { data: { postCategories: [], allCategories: [] } }, { data: [] }, []]
```
- `src/app/post/[slug]/page.tsx:190-196`:
```typescript
  const [post, recentPostsResponse, bookmarkedArticleIds] = await Promise.all([
    getPost(slug),
    isConfigured
      ? sanityFetch({ query: recentPostsQuery, params: { slug } })
      : Promise.resolve({ data: [] }),
    getBookmarks(),
  ])
```
- `src/app/author/[slug]/page.tsx:69-72`:
```typescript
  const [author, bookmarkedArticleIds] = await Promise.all([
    getAuthor(slug),
    getBookmarks(),
  ])
```
- `src/components/BookmarkButton.tsx`: Currently accepts `initialIsBookmarked` as a prop from the server, but is already a `"use client"` component that imports `useAuth()` from `@clerk/nextjs`.

## Commands you will need

| Purpose   | Command                  | Expected on success |
|-----------|--------------------------|---------------------|
| Typecheck | `pnpm typecheck`         | exit 0, no errors   |
| Tests     | `pnpm test`              | exit 0, all pass    |
| Lint      | `pnpm run lint`          | exit 0              |

## Scope

**In scope**:
- `src/components/BookmarkButton.tsx`
- `src/components/MedicalBlogUI.tsx`
- `src/app/page.tsx`
- `src/app/post/[slug]/page.tsx`
- `src/app/author/[slug]/page.tsx`

**Out of scope**:
- `src/app/dashboard/saved-articles/page.tsx` (remains server-authenticated)
- `src/components/SavedArticles.tsx` (remains server-authenticated)
- `src/lib/actions/user.actions.ts` (`toggleBookmark` and `getBookmarks` remain server actions)

## Git workflow

- Branch: `advisor/002-decouple-auth-static-caching`
- Commit style: `perf: decouple bookmark auth from server components to enable static caching`
- Do NOT push or open a PR unless instructed.

## Steps

### Step 1: Update `BookmarkButton.tsx` to read user bookmark state directly on the client

In `src/components/BookmarkButton.tsx`:
1. Import `useUser` alongside `useAuth` from `@clerk/nextjs`.
2. Compute `isBookmarked` from `user?.publicMetadata?.bookmarks`:
```typescript
export function BookmarkButton({ articleId, initialIsBookmarked, className, children }: BookmarkButtonProps) {
    const { isLoaded, isSignedIn } = useAuth()
    const { user } = useUser()
    const router = useRouter()

    const userBookmarks = Array.isArray(user?.publicMetadata?.bookmarks)
        ? (user.publicMetadata.bookmarks as string[])
        : []

    const serverOrClientState = initialIsBookmarked !== undefined
        ? initialIsBookmarked
        : userBookmarks.includes(articleId)

    const [isBookmarked, setIsBookmarked] = React.useState(serverOrClientState)
    const [isPending, startTransition] = React.useTransition()

    React.useEffect(() => {
        if (userBookmarks.length > 0) {
            setIsBookmarked(userBookmarks.includes(articleId))
        }
    }, [userBookmarks, articleId])
```
3. Make `initialIsBookmarked` optional in `BookmarkButtonProps`.

**Verify**: `pnpm typecheck` → exit 0

### Step 2: Remove `getBookmarks` and `bookmarkedArticleIds` from `src/app/page.tsx` and `MedicalBlogUI.tsx`

1. In `src/app/page.tsx`:
   - Remove `import { getBookmarks } from '@/lib/actions/user.actions'`
   - Change `Promise.all` to fetch only the 3 Sanity queries: `[postsResponse, categoriesResponse, suggestionsResponse]`
   - Remove `bookmarkedArticleIds={bookmarkedArticleIds}` from `<MedicalBlogUI />`
2. In `src/components/MedicalBlogUI.tsx`:
   - Remove `bookmarkedArticleIds` prop and its interface definitions
   - For `<BookmarkButton articleId={...} />`, omit `initialIsBookmarked`

**Verify**: `pnpm typecheck` → exit 0

### Step 3: Remove `getBookmarks` from `src/app/post/[slug]/page.tsx` and `src/app/author/[slug]/page.tsx`

1. In `src/app/post/[slug]/page.tsx`:
   - Remove `import { getBookmarks } from '@/lib/actions/user.actions'`
   - In `PostPage`: change `Promise.all` to fetch only `[post, recentPostsResponse]`
   - In `BookmarkButton` calls (for main post and read next cards), pass only `articleId={...}`
2. In `src/app/author/[slug]/page.tsx`:
   - Remove `import { getBookmarks } from '@/lib/actions/user.actions'`
   - In `AuthorPage`: fetch only `getAuthor(slug)` (or remove `bookmarkedArticleIds` from `Promise.all`)
   - In article cards: render `<BookmarkButton articleId={post._id} />` without `initialIsBookmarked`

**Verify**: `pnpm typecheck` → exit 0

## Test plan

- Run `pnpm test` to verify existing tests.
- Run `pnpm typecheck` to verify no dangling props or broken interfaces.
- Run `pnpm run lint` to verify code quality.

## Done criteria

- [ ] `grep -rn "getBookmarks" src/app/` only matches `src/app/dashboard/` (zero matches in `page.tsx`, `post/[slug]`, or `author/[slug]`).
- [ ] `pnpm typecheck` exits 0.
- [ ] `pnpm test` exits 0.
- [ ] `pnpm run lint` exits 0.

## STOP conditions

- If Clerk client metadata does not synchronize with `user.publicMetadata`, stop and report.
- If removing `bookmarkedArticleIds` breaks layout or hydration in `MedicalBlogUI`, stop and report.

## Maintenance notes

- Any future public pages (e.g., category pages or search pages) should NEVER call `auth()` or `getBookmarks()` on the server; let `BookmarkButton` read user state on the client.

