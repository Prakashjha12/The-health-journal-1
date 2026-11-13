# Plan 011: Format llms.txt with Standard Markdown Hyperlinks & Agent Guidance

## Goal
Update `/llms.txt` and `/llms-full.txt` so that AI agent fetch parsers (such as Claude's web browsing tool and OpenAI's web search) recognize links as valid markdown hyperlinks (`[Title](URL): Description`) rather than raw unlinked text, enabling autonomous crawlers to follow the archive and sitemap links without rejection.

## Problem & Root Cause
Claude's browsing engine stated:
> *"Failed to fetch: https://thehealthjournal.in/llms-full.txt ... The llms-full.txt address only appeared inside the text of llms.txt, not as a link, so my fetch tool rejected it twice."*

In `src/app/llms.txt/route.ts`:
The URL was output as plain text:
`- For complete archive and topics, see https://thehealthjournal.in/llms-full.txt`
Claude's web fetch security policy requires URLs in fetched documents to be properly formatted as standard Markdown hyperlinks (`[Link Text](URL)`) to be added to the allowed-fetch queue.

## Solution
1. In `src/app/llms.txt/route.ts`:
   - Add a dedicated `## Machine-Readable Resources` section formatted strictly per `llmstxt.org`:
     - `- [Full Article Catalog](https://thehealthjournal.in/llms-full.txt): Complete directory of all published health and medical articles.`
     - `- [XML Sitemap](https://thehealthjournal.in/sitemap.xml): Full XML sitemap of all canonical posts, authors, and site pages.`
     - `- [WebMCP Search Tool](https://thehealthjournal.in/api/tools/search?query=health): Standardized JSON search endpoint for AI agents.`
   - Add a `## When to Use This Site` section providing explicit instructions for AI agents.
2. In `src/app/llms-full.txt/route.ts`:
   - Add a `## Machine-Readable Index` section linking back to `/llms.txt` and `/sitemap.xml`.
3. Verify tests, TypeScript compilation, and linting.

## Verification Checklist
- [x] `vitest run` (27/27 tests pass)
- [x] `tsc --noEmit` (0 errors)
- [x] `eslint` (0 errors)
