import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server"
import { NextResponse } from "next/server"

// 1. Define Public Routes (The "Gate" for Google and Auth)
const isPublicRoute = createRouteMatcher([
  "/",
  "/about",
  "/privacy",
  "/terms",
  "/post(.*)",     // 🟢 CRITICAL: Allow Googlebot to see your blog posts!
  "/author(.*)",
  "/articles(.*)", // 🟢 Add this if you have an /articles page
  "/sitemap.xml",
  "/robots.txt",
  "/llms.txt",
  "/llms-full.txt",
  "/sign-in(.*)", 
  "/sign-up(.*)",  
  "/studio(.*)",
  "/api/revalidate-sanity(.*)",
  "/api/markdown-post(.*)",
  "/api/tools(.*)"
])

const isDashboardRoute = createRouteMatcher(["/dashboard(.*)"])

export default clerkMiddleware(async (auth, req) => {
  const { pathname } = req.nextUrl
  if (pathname.startsWith("/post/")) {
    const accept = req.headers.get("accept") || ""
    const isMarkdownAccept = accept.includes("text/markdown") && !accept.includes("text/html")
    const isMdExt = pathname.endsWith(".md")
    if (isMarkdownAccept || isMdExt) {
      const postSlug = pathname.replace(/^\/post\//, "").replace(/\.md$/, "")
      return NextResponse.rewrite(new URL(`/api/markdown-post/${postSlug}`, req.url))
    }
  }

  // If it's a public route, don't run any protection logic
  if (isPublicRoute(req)) return;

  // 2. Protect the Dashboard
  if (isDashboardRoute(req)) {
    await auth.protect()
  }
})

export const config = {
  matcher: [
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    "/(api|trpc)(.*)",
  ],
}
