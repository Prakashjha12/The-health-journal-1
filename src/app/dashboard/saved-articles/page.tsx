import SavedArticles from "@/components/SavedArticles"
import { Bookmark } from "lucide-react"

export const metadata = {
    title: "My Saved Blogs | Komal's Blog",
}

export default function SavedArticlesPage() {
    return (
        <div className="space-y-8">
            <div className="flex items-center gap-3 pb-6 border-b border-zinc-200 dark:border-zinc-800">
                <div className="h-10 w-10 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                    <Bookmark className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                </div>
                <div>
                    <h1 className="text-2xl font-extrabold text-zinc-900 dark:text-zinc-50 tracking-tight">Saved Articles</h1>
                    <p className="text-sm text-zinc-500 dark:text-zinc-400">Everything you&apos;ve bookmarked for later reading.</p>
                </div>
            </div>
            
            <SavedArticles />
        </div>
    )
}
