import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server"
import { NextResponse } from "next/server"

// 1. Define Public Routes (The "Gate" for Google and Auth)
const isPublicRoute = createRouteMatcher([
  "/",
  "/sitemap.xml",
  "/robots.txt",
  "/sign-in(.*)", // Allows all sub-pages under sign-in
  "/sign-up(.*)"  // Allows the /verify-email-address route
])

const isDashboardRoute = createRouteMatcher(["/dashboard(.*)"])
const isStudioRoute = createRouteMatcher(["/studio(.*)"])

export default clerkMiddleware(async (auth, req) => {
  // If it's a public route, don't run any protection logic
  if (isPublicRoute(req)) return;

  const { sessionClaims } = await auth();

  // 2. Protect the Studio by forcing authentication (Role check handles itself on the Studio Page)
  if (isStudioRoute(req)) {
    await auth.protect()
  }

  // 3. Protect the Dashboard
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