# Plan 009: WebMCP Declarative Form & Origin Trial Token Integration

## Goal
Integrate the experimental WebMCP (Web Model Context Protocol) standard evaluated by Chrome 150+ and Lighthouse's Agentic Browsing category. Expose declarative and imperative tools so AI agents can query and interact with "The Health Journal .in" directly via standardized agentic browser protocols.

## Background & Specifications
From the Lighthouse Agentic Browsing documentation:
> **WebMCP Integration**: Lighthouse calls the Chrome DevTools Protocol (CDP) `WebMCP` domain to monitor tool registration events. It verifies both declarative tools (defined in HTML) and imperative tools (defined in JS).
> **Origin Trial**: Requires registering for the WebMCP origin trial and including the token via `<meta http-equiv="origin-trial" content="...">`.

## Target Files
1. `.env.example` (add `NEXT_PUBLIC_WEBMCP_ORIGIN_TRIAL_TOKEN`)
2. `src/app/layout.tsx` (inject Origin Trial meta tag if token is present)
3. `src/components/MedicalBlogUI.tsx` (add declarative WebMCP tool attributes `toolname`, `tooldescription`, `toolparam-description`)
4. `src/app/api/tools/search/route.ts` (new API endpoint serving tool requests)
5. `src/components/WebMCPProvider.tsx` (new client provider for imperative WebMCP registration with feature detection)

## Detailed Implementation Steps

### 1. `.env.example`
Add:
```bash
# WebMCP Origin Trial Token (Chrome 150+ Agentic Browsing)
NEXT_PUBLIC_WEBMCP_ORIGIN_TRIAL_TOKEN=
```

### 2. `src/app/layout.tsx`
Inject the origin trial token defensively in the `<head>` of the root document:
```tsx
{process.env.NEXT_PUBLIC_WEBMCP_ORIGIN_TRIAL_TOKEN && (
  <meta
    httpEquiv="origin-trial"
    content={process.env.NEXT_PUBLIC_WEBMCP_ORIGIN_TRIAL_TOKEN}
  />
)}
```

### 3. `src/components/MedicalBlogUI.tsx` (Declarative WebMCP Tool)
Decorate the search form with declarative WebMCP attributes so automated agents and Lighthouse CDP audits detect the tool declaratively:
- `<form role="search" toolname="search_articles" tooldescription="Search The Health Journal for evidence-based medical articles by symptom, diagnosis, or health topic" action="/api/tools/search" method="GET" ...>`
- On the query input:
  `toolparam-description="Keywords, disease names, symptoms, or health topics to search for"`

### 4. `src/app/api/tools/search/route.ts`
Implement standard JSON endpoint:
- Extract `query` and optional `category` from query parameters.
- Query Sanity using `client.fetch(searchPostsQuery, { queryString: `*${query}*` })`.
- Return structured tool execution response:
  ```json
  {
    "query": "...",
    "resultsCount": 3,
    "articles": [
      {
        "title": "...",
        "slug": "...",
        "url": "https://thehealthjournal.in/post/...",
        "summary": "...",
        "categories": [...]
      }
    ]
  }
  ```

### 5. `src/components/WebMCPProvider.tsx`
- Client-side component mounted in `RootLayout`.
- Feature-detects `navigator.agent` or `window.webmcp`.
- Imperatively registers the `search_articles` tool for browsers with the WebMCP Origin Trial active.
- Safely degrades without error in browsers that do not support WebMCP.

## Verification Checklist
- [ ] `pnpm test` (all tests pass)
- [ ] `pnpm typecheck` (zero TypeScript errors)
- [ ] `pnpm run lint` (zero ESLint errors)
- [ ] Verify Origin Trial meta tag rendering and declarative tool attributes in DOM

