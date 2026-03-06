import { client } from "@/sanity/lib/client"
import { urlFor } from "@/sanity/lib/image"
import Link from "next/link"
import Image from "next/image"
import { Stethoscope, BookmarkX } from "lucide-react"
import { getBookmarks } from "@/lib/actions/user.actions"

interface SavedArticle {
    _id: string
    title: string
    slug: { current: string }
    publishedAt: string
    mainImage?: {
        _type: 'image'
        asset: {
            _ref: string
            _type: 'reference'
        }
    } | null
}

export default async function SavedArticles() {
    const bookmarkIds = await getBookmarks()

    if (bookmarkIds.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center py-20 text-center border-2 border-dashed border-zinc-200 dark:border-zinc-800 rounded-2xl">
                <BookmarkX className="h-12 w-12 text-zinc-300 dark:text-zinc-700 mb-4" />
                <h3 className="text-lg font-semibold text-zinc-900 dark:text-zinc-50">No saved articles yet</h3>
                <p className="text-zinc-500 dark:text-zinc-400 max-w-xs mx-auto mt-2">
                    Articles you bookmark will appear here for easy access later.
                </p>
                <Link href="/#articles" className="mt-6 text-sm font-bold text-blue-600 dark:text-blue-400 hover:underline">
                    Browse Articles
                </Link>
            </div>
        )
    }

    // Fetch details for bookmarked articles from Sanity
    const query = `*[_type == "post" && _id in $ids] {
        _id,
        title,
        slug,
        publishedAt,
        "mainImage": image
    }`
    
    const articles: SavedArticle[] = await client.fetch(query, { ids: bookmarkIds })

    return (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {articles.map((article) => (
                <Link href={`/post/${article.slug.current}`} key={article._id} className="group">
                    <article className="flex flex-col h-full rounded-2xl overflow-hidden bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-sm hover:shadow-md transition-all duration-300">
                        <div className="relative aspect-[16/10] bg-zinc-100 dark:bg-zinc-800 overflow-hidden">
                            {article.mainImage ? (
                                <Image
                                    src={urlFor(article.mainImage).width(600).url()}
                                    alt={article.title}
                                    fill
                                    className="object-cover group-hover:scale-105 transition-transform duration-500"
                                />
                            ) : (
                                <div className="flex items-center justify-center h-full">
                                    <Stethoscope className="h-10 w-10 text-zinc-300" />
                                </div>
                            )}
                        </div>
                        <div className="p-5 flex flex-col flex-1">
                            <h3 className="font-bold text-zinc-900 dark:text-zinc-50 leading-tight mb-3 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                                {article.title}
                            </h3>
                            <div className="mt-auto flex items-center justify-between text-[11px] text-zinc-500 uppercase tracking-wider font-semibold">
                                <span>{new Date(article.publishedAt).toLocaleDateString()}</span>
                                <span className="px-2 py-0.5 rounded bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400">
                                    Saved
                                </span>
                            </div>
                        </div>
                    </article>
                </Link>
            ))}
        </div>
    )
}
