/**
 * This route is responsible for the built-in authoring environment using Sanity Studio.
 * All routes under your studio path is handled by this file using Next.js' catch-all routes:
 * https://nextjs.org/docs/routing/dynamic-routes#catch-all-routes
 *
 * You can learn more about the next-sanity package here:
 * https://github.com/sanity-io/next-sanity
 */

import { NextStudio } from 'next-sanity/studio'
import config from '../../../../../sanity.config'
import { auth, clerkClient } from "@clerk/nextjs/server"
import { redirect } from "next/navigation"

export const dynamic = 'force-dynamic'

export { metadata, viewport } from 'next-sanity/studio'

export default async function StudioPage() {
  const { userId } = await auth()
  if (!userId) redirect("/sign-in?redirect_url=/studio")

  let isSuperUser = false;
  
  try {
    const client = await clerkClient()
    const user = await client.users.getUser(userId)

    isSuperUser = user.publicMetadata?.role === "admin" || user.publicMetadata?.isSuperUser === true
  } catch (error) {
    console.error("Clerk API Error fetching user for Studio:", error)
    // If Clerk throws an error (e.g., Secret Key mismatch), safely redirect instead of white-screening taking down the app
    redirect("/")
  }

  if (!isSuperUser) redirect("/")

  return <NextStudio config={config} />
}
