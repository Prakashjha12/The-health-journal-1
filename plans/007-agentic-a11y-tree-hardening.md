# Plan 007: Agent-Centric Accessibility Tree Hardening & Semantic Landmarks

## Goal
Harden the DOM and Accessibility (a11y) tree across all key pages (`/`, `/post/[slug]`, `Navbar`, `MedicalBlogUI`, and `BlogPostClient`) so that AI agents, screen readers, and automated browsers can reliably parse the page semantics, navigate landmarks, and locate form controls with unambiguous programmatic names and ARIA relationships.

## Background & Alignment
According to the Lighthouse Agentic Browsing standard and WebMCP specifications:
- Agents rely on the Accessibility Tree as their primary data model.
- Key audits check:
  1. **Names and labels**: Every interactive element (inputs, buttons, tabs) must have an explicit programmatic name via `aria-label`, visible text, or form association.
  2. **Tree integrity**: Valid parent-child relationships (`role="tablist"` with `role="tab"`, `role="listbox"` with `role="option"`, explicit landmark regions).
  3. **Visibility & Cleanliness**: Unused or broken tags (such as commented-out `<script>` blocks in JSX) must not pollute the DOM; structured data (`application/ld+json`) must be valid JSON-LD.
  4. **Form Association**: Search inputs must have an explicit `name="query"` attribute and `id` to enable declarative form inspection by AI agents.

## Target Files
1. `src/components/Navbar.tsx`
2. `src/components/ThemeToggle.tsx`
3. `src/components/MedicalBlogUI.tsx`
4. `src/components/BlogPostClient.tsx`
5. `src/app/post/[slug]/page.tsx`

## Detailed Implementation Steps

### 1. `src/components/Navbar.tsx`
- Add `aria-label="Main navigation"` to the desktop `<nav>` element.
- Add `aria-label="Mobile navigation"` and `id="mobile-navigation-menu"` to the mobile `<nav>` container.
- Update the mobile toggle button:
  - Add `aria-expanded={isMenuOpen}`
  - Add `aria-controls="mobile-navigation-menu"`
  - Set `aria-label={isMenuOpen ? "Close navigation menu" : "Open navigation menu"}`

### 2. `src/components/ThemeToggle.tsx`
- Ensure `<button>` has explicit `aria-label="Toggle dark and light theme"`.

### 3. `src/components/MedicalBlogUI.tsx`
- Search Form:
  - Add `role="search"` and `aria-label="Search medical articles"` to `<form>`.
  - Add `id="search-articles-input"`, `name="query"`, and `aria-label="Search articles by condition, topic, or keyword"` to the search `<Input>`.
  - Add `aria-controls="search-suggestions-list"` on the search input.
- Suggestions List:
  - On the `<ul>` container: add `id="search-suggestions-list"`, `role="listbox"`, `aria-label="Search suggestions"`.
  - On each `<li>` item or suggestion link: add `role="option"` and `aria-selected={isHighlighted}`.
- Categories Tablist:
  - On the category scroll container: add `role="tablist"` and `aria-label="Article categories"`.
  - On each category button: add `role="tab"`, `aria-selected={isActive}`, and `aria-controls="articles"`.

### 4. `src/components/BlogPostClient.tsx`
- In `SocialShareSidebar`:
  - Add `aria-label={`Share article on ${link.label}`}` to each share button.
  - Add `aria-label={copied ? "Link copied to clipboard" : "Copy article link"}` to copy button.
- In `BackButton`:
  - Add `aria-label="Return to all articles"` to the link.

### 5. `src/app/post/[slug]/page.tsx`
- Clean up the commented-out `<script>` blocks:
  - Activate the structured JSON-LD `<script type="application/ld+json">` with `@context: "https://schema.org"`, `@graph: [...]` containing `MedicalWebPage` and `BlogPosting` schemas and FAQ entities when available.
  - Ensure it produces valid JSON without raw JSX comments inside HTML `<script>` tags.

## Verification Checklist
- [ ] `pnpm test` (all tests pass)
- [ ] `pnpm typecheck` (zero TypeScript errors)
- [ ] `pnpm run lint` (zero ESLint errors)
- [ ] Verify accessibility tree attributes in git diff (aria-label, role, aria-expanded, name="query", application/ld+json)

