// import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server"

// const isProtectedRoute = createRouteMatcher([
//   "/dashboard(.*)",
//   "/studio(.*)",
// ])

// export default clerkMiddleware(async (auth, req) => {
//   if (isProtectedRoute(req)) await auth.protect()
// })

// export const config = {
//   matcher: [
//     "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
//     "/(api|trpc)(.*)",
//   ],
// }


import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server"
import { NextResponse } from "next/server"

// 1. Define your protected routes
const isDashboardRoute = createRouteMatcher(["/dashboard(.*)"])
const isStudioRoute = createRouteMatcher(["/studio(.*)"])

export default clerkMiddleware(async (auth, req) => {
  // 2. Get the session claims (this contains your metadata)
  const { sessionClaims } = await auth();

  // 3. Protect the Studio (Admin Only)
  if (isStudioRoute(req)) {
    const role = sessionClaims?.metadata?.role;
    
    // Check if role is "admin" (handling both string or array format)
    const isAdmin = Array.isArray(role) ? role.includes("admin") : role === "admin";

    if (!isAdmin) {
      // If not admin, kick them back to the home page
      return NextResponse.redirect(new URL("/", req.url));
    }
  }

  // 4. Protect the Dashboard (Any logged-in user)
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