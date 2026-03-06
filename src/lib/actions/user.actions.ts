"use server"

import { auth, clerkClient } from "@clerk/nextjs/server"

export async function toggleBookmark(articleId: string) {
    const { userId } = await auth()

    if (!userId) {
        throw new Error("Unauthorized")
    }

    try {
        const client = await clerkClient()
        const user = await client.users.getUser(userId)

        const bookmarks = Array.isArray(user.publicMetadata?.bookmarks)
            ? (user.publicMetadata.bookmarks as string[])
            : []

        const isBookmarked = bookmarks.includes(articleId)

        let newBookmarks: string[]
        if (isBookmarked) {
            newBookmarks = bookmarks.filter((id) => id !== articleId)
        } else {
            newBookmarks = [...bookmarks, articleId]
        }

        await client.users.updateUserMetadata(userId, {
            publicMetadata: {
                ...(user.publicMetadata ?? {}),
                bookmarks: newBookmarks,
            }
        })

        return !isBookmarked
    } catch (error) {
        console.error("Error toggling bookmark:", error)
        throw new Error("Failed to toggle bookmark")
    }
}

export async function getBookmarks(): Promise<string[]> {
    const { userId } = await auth()

    if (!userId) return []

    try {
        const client = await clerkClient()
        const user = await client.users.getUser(userId)
        const bookmarks = Array.isArray(user.publicMetadata?.bookmarks)
            ? (user.publicMetadata.bookmarks as string[])
            : []
        return bookmarks
    } catch (error) {
        console.error("Error fetching bookmarks:", error)
        return []
    }
}
