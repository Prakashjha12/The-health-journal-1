# Plan 010: Fix Combobox ARIA Supported Attributes on Search Input

## Goal
Resolve the Lighthouse Agentic Browsing audit failure:
`Elements must only use supported ARIA attributes: input#search-articles-input`.

## Problem & Root Cause
In `src/components/MedicalBlogUI.tsx`:
- The search `<Input>` uses `aria-expanded={isSuggestionsOpen && suggestions.length > 0}` and `aria-autocomplete="list"`.
- Without an explicit `role="combobox"`, the browser accessibility tree assigns an implicit role of `textbox` to `<input type="text">`.
- Under the W3C WAI-ARIA specification and Lighthouse / axe-core rule `aria-allowed-attr`, the `aria-expanded` state is **not supported on the `textbox` role**.
- Furthermore, `aria-controls="search-suggestions-list"` unconditionally references an ID that is only conditionally rendered in the DOM when suggestions are open.

## Fix
In `src/components/MedicalBlogUI.tsx`:
1. Add `role="combobox"` to the search `<Input>`.
2. Add `aria-haspopup="listbox"` to the search `<Input>`.
3. Set `aria-controls={isSuggestionsOpen && suggestions.length > 0 ? "search-suggestions-list" : undefined}` so it only references the suggestions list when mounted.
4. Keep `aria-expanded={isSuggestionsOpen && suggestions.length > 0}` and `aria-autocomplete="list"` (which are now 100% valid and recommended on `role="combobox"`).

## Verification Checklist
- [x] `pnpm test` (all 27 tests pass)
- [x] `pnpm typecheck` (zero TypeScript errors)
- [x] `pnpm run lint` (zero ESLint errors)
