"use client"

import * as React from "react"
import { Bookmark } from "lucide-react"
import { Button } from "@/components/ui/button"
import { ConfettiButton } from "@/components/ui/confetti"
import { toggleBookmark } from "@/lib/actions/user.actions"
import { useAuth } from "@clerk/nextjs"
import { useRouter } from "next/navigation"
import { cn } from "@/lib/utils"

interface BookmarkButtonProps {
    articleId: string
    initialIsBookmarked?: boolean
    className?: string
    children?: React.ReactNode
}

export function BookmarkButton({ articleId, initialIsBookmarked = false, className, children }: BookmarkButtonProps) {
    const { isLoaded, isSignedIn } = useAuth()
    const router = useRouter()
    const [isBookmarked, setIsBookmarked] = React.useState(initialIsBookmarked)
    const [isPending, startTransition] = React.useTransition()

    React.useEffect(() => {
        setIsBookmarked(initialIsBookmarked)
    }, [initialIsBookmarked])

    const handleBookmark = (e: React.MouseEvent) => {
        e.preventDefault()
        e.stopPropagation()

        const newIsBookmarked = !isBookmarked
        // Optimistic update
        setIsBookmarked(newIsBookmarked)

        startTransition(async () => {
            try {
                const bookmarked = await toggleBookmark(articleId)
                setIsBookmarked(bookmarked)
                router.refresh()
            } catch (error) {
                // Revert optimistic update on error
                setIsBookmarked(isBookmarked)
                console.error("Failed to toggle bookmark:", error)
            }
        })
    }

    if (!isLoaded) return null

    return (
        <>
            {isSignedIn ? (
                <ConfettiButton
                    variant="secondary"
                    size={children ? "default" : "icon"}
                    className={cn(
                        !children && "h-8 w-8 rounded-full",
                        "backdrop-blur-sm shadow-sm transition-all",
                        isBookmarked
                            ? "bg-blue-600 hover:bg-blue-700 text-white dark:bg-blue-500 dark:hover:bg-blue-600 border-blue-600 dark:border-blue-500"
                            : "bg-background/80 hover:bg-accent text-foreground",
                        className
                    )}
                    onClick={handleBookmark}
                    disabled={isPending}
                    options={{
                        get colors() {
                            return ["#a786ff", "#fd8bbc", "#eca184", "#f8deb1"]
                        },
                    }}
                >
                    <Bookmark
                        className={cn(
                            "h-4 w-4",
                            isBookmarked && "fill-current"
                        )}
                    />
                    {children}
                </ConfettiButton>
            ) : (
                <Button
                    variant="secondary"
                    size={children ? "default" : "icon"}
                    className={cn(
                        !children && "h-8 w-8 rounded-full",
                        "backdrop-blur-sm shadow-sm transition-all",
                        "bg-background/80 hover:bg-accent text-foreground",
                        className
                    )}
                    onClick={(e) => {
                        e.preventDefault()
                        e.stopPropagation()
                        router.push("/sign-in")
                    }}
                >
                    <Bookmark className="h-4 w-4" />
                    {children}
                </Button>
            )}
        </>
    )
}
