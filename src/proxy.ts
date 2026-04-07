import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server"
import { NextResponse } from "next/server"

// 1. Define Public Routes (The "Gate" for Google and Auth)
const isPublicRoute = createRouteMatcher([
  "/",
  "/post(.*)",     // 🟢 CRITICAL: Allow Googlebot to see your blog posts!
  "/articles(.*)", // 🟢 Add this if you have an /articles page
  "/sitemap.xml",
  "/robots.txt",
  "/sign-in(.*)", 
  "/sign-up(.*)",  
  "/studio(.*)" 
])

const isDashboardRoute = createRouteMatcher(["/dashboard(.*)"])

export default clerkMiddleware(async (auth, req) => {
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