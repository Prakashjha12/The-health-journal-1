# Plan 003: Isolate Sanity Studio Layout and Disable Root Smooth Scroll on Studio Route

> **Executor instructions**: Follow this plan step by step. Run every
> verification command and confirm the expected result before moving to the
> next step. If anything in the "STOP conditions" section occurs, stop and
> report — do not improvise. When done, update the status row for this plan
> in `plans/README.md` — unless a reviewer dispatched you and told you they
> maintain the index.
>
> **Drift check (run first)**: `git diff --stat ea77466..HEAD -- 'src/app/studio/[[...tool]]/layout.tsx' 'src/components/SmoothScrollProvider.tsx'`
> If any in-scope file changed since this plan was written, compare the
> "Current state" excerpts against the live code before proceeding; on a
> mismatch, treat it as a STOP condition.

## Status

- **Priority**: P1
- **Effort**: S
- **Risk**: LOW
- **Depends on**: plans/001-verification-baseline.md
- **Category**: correctness / ui
- **Planned at**: commit `ea77466`, 2026-11-13

## Why this matters

In Next.js App Router, `src/app/layout.tsx` defines the application's root `<html>` and `<body>` tags. However, `src/app/studio/[[...tool]]/layout.tsx` also renders its own `<html>` and `<body>` tags, creating illegal nested DOM documents (`html > body > ... > html > body`) that cause React hydration failures and browser DOM validation warnings. Additionally, `SmoothScrollProvider` (Lenis) wraps the root layout and intercepts mousewheel and pointer events across all routes, causing scroll stuttering or lockups inside Sanity Studio's virtualized list and split-pane containers.

## Current state

- `src/app/studio/[[...tool]]/layout.tsx:11-17`:
```tsx
export default function StudioLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body style={{ margin: 0, padding: 0 }}>
        {children}
      </body>
    </html>
  )
}
```
- `src/components/SmoothScrollProvider.tsx:28-44`:
```tsx
    return (
        <ReactLenis
            ref={lenisRef}
            root
            options={{
                autoRaf: false,
                duration: 1.15,
                easing: (t: number) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
                smoothWheel: true,
                syncTouch: false,
                allowNestedScroll: true,
                anchors: true,
            }}
        >
            {children}
        </ReactLenis>
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
- `src/app/studio/[[...tool]]/layout.tsx`
- `src/components/SmoothScrollProvider.tsx`

**Out of scope**:
- `src/app/studio/[[...tool]]/page.tsx`
- `sanity.config.ts`

## Git workflow

- Branch: `advisor/003-isolate-studio-layout`
- Commit style: `fix: remove nested html/body tags in studio layout and bypass lenis scroll on studio`
- Do NOT push or open a PR unless instructed.

## Steps

### Step 1: Remove nested `<html>` and `<body>` tags from `src/app/studio/[[...tool]]/layout.tsx`

Replace the nested document tags with a clean wrapper element that ensures Sanity Studio fills the full viewport without margin/padding:

```tsx
export const metadata = {
  title: 'Sanity Studio',
  description: 'Manage content for the blog',
}

export default function StudioLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-background">
      {children}
    </div>
  )
}
```

**Verify**: `pnpm typecheck` → exit 0

### Step 2: Bypass Lenis smooth scrolling on `/studio` in `src/components/SmoothScrollProvider.tsx`

In `src/components/SmoothScrollProvider.tsx`:
1. Import `usePathname` from `next/navigation`.
2. Inspect `const pathname = usePathname()`.
3. If `pathname?.startsWith('/studio')`, bypass `ReactLenis` and return `<>{children}</>` directly to avoid intercepting Sanity Studio scroll panes.

```tsx
"use client"

import * as React from "react"
import { ReactLenis, type LenisRef } from "lenis/react"
import gsap from "gsap"
import { usePathname } from "next/navigation"

interface SmoothScrollProviderProps {
    children: React.ReactNode
}

export function SmoothScrollProvider({ children }: SmoothScrollProviderProps) {
    const pathname = usePathname()
    const isStudio = pathname?.startsWith('/studio')
    const lenisRef = React.useRef<LenisRef>(null)

    React.useEffect(() => {
        if (isStudio) return

        function update(time: number) {
            lenisRef.current?.lenis?.raf(time * 1000)
        }

        gsap.ticker.add(update)
        gsap.ticker.lagSmoothing(0)

        return () => {
            gsap.ticker.remove(update)
        }
    }, [isStudio])

    if (isStudio) {
        return <>{children}</>
    }

    return (
        <ReactLenis
            ref={lenisRef}
            root
            options={{
                autoRaf: false,
                duration: 1.15,
                easing: (t: number) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
                smoothWheel: true,
                syncTouch: false, // Preserves natural responsive mobile touch momentum
                allowNestedScroll: true,
                anchors: true,
            }}
        >
            {children}
        </ReactLenis>
    )
}
```

**Verify**: `pnpm typecheck` → exit 0

## Test plan

- Run `pnpm test` → all tests pass.
- Run `pnpm typecheck` → exit 0.
- Run `pnpm run lint` → exit 0.

## Done criteria

- [ ] `grep -rn "<html" src/app/` returns ONLY `src/app/layout.tsx`.
- [ ] `grep -rn "<body" src/app/` returns ONLY `src/app/layout.tsx`.
- [ ] `SmoothScrollProvider` bypasses `ReactLenis` when on `/studio` routes.
- [ ] `pnpm typecheck` exits 0.
- [ ] `pnpm test` exits 0.

## STOP conditions

- If NextStudio styles break when wrapped in a container `div`, stop and report.

## Maintenance notes

- Any future embedded tools or sub-applications under `src/app/` should follow the same pattern: never declare nested `<html>` or `<body>` inside an App Router segment.

