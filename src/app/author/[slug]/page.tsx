import { sanityFetch } from '../../../sanity/lib/live'
import { authorBySlugQuery } from '../../../sanity/lib/queries'
import { PortableText } from '@portabletext/react'
import Image from 'next/image'
import { urlFor } from '../../../sanity/lib/image'
import Link from 'next/link'
import { Stethoscope, Globe, Twitter, Instagram, Linkedin, Briefcase, Award, Clock } from 'lucide-react'
import { Navbar } from '@/components/Navbar'
import { calculateReadingTime } from '@/lib/utils'
import { BookmarkButton } from '@/components/BookmarkButton'
import { getBookmarks } from '@/lib/actions/user.actions'
import { dataset, projectId } from '@/sanity/env'

export default async function AuthorPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const isConfigured = projectId !== 'placeholder' && dataset !== 'placeholder'
  const authorResponse = isConfigured ? await sanityFetch({ query: authorBySlugQuery, params: { slug } }) : null
  const author = authorResponse?.data || null

  if (!author) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background text-foreground">
        <div className="text-center space-y-4">
          <h1 className="text-3xl font-bold">Author not found</h1>
          <Link href="/" className="text-sm text-muted-foreground hover:text-foreground transition-colors inline-flex items-center gap-2">
            ← Back to home
          </Link>
        </div>
      </div>
    )
  }

  const bookmarkedArticleIds = await getBookmarks()

  return (
    <div className="flex min-h-screen flex-col bg-background text-foreground">
      <Navbar />

      <main className="flex-1">
        {/* ─── AUTHOR HEADER SECTION ─── */}
        <div className="bg-muted/30 border-b border-border">
          <div className="max-w-[1000px] mx-auto px-6 py-16 md:py-24">
            <div className="flex flex-col md:flex-row items-center md:items-start gap-8 md:gap-12">
              
              {/* Profile Image */}
              {author.image ? (
                <Image
                  src={urlFor(author.image)?.width(300).height(300).url() as string}
                  alt={author.name}
                  width={150}
                  height={150}
                  className="rounded-full object-cover w-[150px] h-[150px] md:w-[200px] md:h-[200px] border-4 border-background shadow-xl shrink-0 bg-secondary"
                  priority
                />
              ) : (
                <div className="w-[150px] h-[150px] md:w-[200px] md:h-[200px] rounded-full border-4 border-background shadow-xl bg-muted flex items-center justify-center shrink-0">
                  <Stethoscope className="h-16 w-16 text-muted-foreground" />
                </div>
              )}

              {/* Profile Details */}
              <div className="flex-1 text-center md:text-left space-y-5">
                <div>
                  <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight mb-2">
                    {author.name}
                  </h1>
                  {author.profession && (
                    <div className="flex items-center justify-center md:justify-start gap-2 text-primary font-medium text-lg">
                      <Briefcase className="h-5 w-5" />
                      {author.profession}
                    </div>
                  )}
                </div>

                {/* Badges / Stats */}
                <div className="flex flex-wrap items-center justify-center md:justify-start gap-3">
                  {author.specializedIn && (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400">
                      <Award className="h-3.5 w-3.5" />
                      {author.specializedIn}
                    </span>
                  )}
                  {author.experience && (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400">
                      <Clock className="h-3.5 w-3.5" />
                      {author.experience} Experience
                    </span>
                  )}
                </div>

                {/* Bio */}
                {author.bio && (
                  <div className="text-muted-foreground leading-relaxed prose prose-zinc dark:prose-invert max-w-2xl mx-auto md:mx-0">
                    <PortableText value={author.bio} />
                  </div>
                )}

                {/* Social Links */}
                <div className="flex items-center justify-center md:justify-start gap-4 pt-2">
                  {author.website && (
                    <a href={author.website} target="_blank" rel="noopener noreferrer" className="p-2.5 rounded-full bg-background border border-border hover:border-primary hover:text-primary transition-all shadow-sm" title="Website">
                      <Globe className="h-5 w-5" />
                    </a>
                  )}
                  {author.linkedin && (
                    <a href={author.linkedin} target="_blank" rel="noopener noreferrer" className="p-2.5 rounded-full bg-background border border-border hover:border-[#0A66C2] hover:text-[#0A66C2] transition-all shadow-sm" title="LinkedIn">
                      <Linkedin className="h-5 w-5" />
                    </a>
                  )}
                  {author.twitter && (
                    <a href={author.twitter} target="_blank" rel="noopener noreferrer" className="p-2.5 rounded-full bg-background border border-border hover:border-[#1DA1F2] hover:text-[#1DA1F2] transition-all shadow-sm" title="Twitter / X">
                      <Twitter className="h-5 w-5" />
                    </a>
                  )}
                  {author.instagram && (
                    <a href={author.instagram} target="_blank" rel="noopener noreferrer" className="p-2.5 rounded-full bg-background border border-border hover:border-[#E1306C] hover:text-[#E1306C] transition-all shadow-sm" title="Instagram">
                      <Instagram className="h-5 w-5" />
                    </a>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ─── AUTHOR'S POSTS ─── */}
        <div className="max-w-[1200px] mx-auto px-6 py-20">
          <div className="flex items-center gap-3 mb-10">
            <h2 className="text-3xl font-bold tracking-tight">Articles by {author.name.split(' ')[0]}</h2>
            <span className="bg-primary/10 text-primary px-3 py-1 rounded-full text-sm font-bold">
              {author.posts?.length || 0}
            </span>
          </div>

          {author.posts && author.posts.length > 0 ? (
            <div className="grid gap-x-6 gap-y-10 sm:grid-cols-2 lg:grid-cols-3">
              {author.posts.map((post: any, index: number) => {
                const readTimeVal = calculateReadingTime(post.body)
                const displayDate = new Date(post.publishedAt || post._createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
                const category = post.categories && post.categories.length > 0 && post.categories[0].title 
                  ? post.categories[0].title 
                  : "Health"

                return (
                  <Link href={`/post/${post.slug}`} key={post._id} className="group">
                    <article className="flex flex-col rounded-2xl overflow-hidden bg-card border border-border/40 shadow-[0_1px_3px_rgba(0,0,0,0.08)] hover:shadow-[0_8px_30px_rgba(0,0,0,0.12)] hover:-translate-y-1 transition-all duration-300 ease-out h-full">
                      {/* Card Image */}
                      <div className="relative w-full aspect-16/11 bg-secondary overflow-hidden">
                        {post.image ? (
                          <Image
                            src={urlFor(post.image).width(800).height(500).url()}
                            alt={post.title}
                            fill
                            className="object-cover group-hover:scale-[1.03] transition-transform duration-500 ease-out"
                            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                          />
                        ) : (
                          <div className="flex items-center justify-center h-full">
                            <Stethoscope className="h-12 w-12 text-muted-foreground/20" />
                          </div>
                        )}
                        {/* Category Badge & Bookmark */}
                        <div className="absolute bottom-3 left-3 right-3 flex items-end justify-between z-10">
                          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-background/80 backdrop-blur-sm text-foreground">
                            <span className="w-2 h-2 rounded-full bg-foreground/70" />
                            {category}
                          </span>
                          <BookmarkButton
                            articleId={post._id}
                            initialIsBookmarked={bookmarkedArticleIds.includes(post._id)}
                          />
                        </div>
                      </div>
                      {/* Card Content */}
                      <div className="p-5 flex flex-col flex-1">
                        <h3 className="font-semibold text-lg leading-snug tracking-tight mb-3 group-hover:text-primary transition-colors line-clamp-2">
                          {post.title}
                        </h3>
                        <p className="text-xs font-medium text-muted-foreground mt-auto" suppressHydrationWarning>
                          {displayDate} &bull; {readTimeVal} min read
                        </p>
                      </div>
                    </article>
                  </Link>
                )
              })}
            </div>
          ) : (
            <div className="text-center py-20 bg-muted/20 rounded-2xl border border-dashed border-border">
              <p className="text-muted-foreground text-lg">No articles published by this author yet.</p>
            </div>
          )}
        </div>
      </main>

      {/* ─── FOOTER ─── */}
      <footer className="w-full border-t border-border bg-background">
        <div className="max-w-[1200px] mx-auto px-6 py-10">

          {/* Medical Disclaimer */}
          <div className="mt-8 mb-4 p-4 rounded-lg bg-muted/50 border border-border/50 text-center">
            <p className="text-xs text-muted-foreground leading-relaxed">
              <span className="font-semibold text-foreground/80">Disclaimer:</span> The content on this site is for informational purposes only and is not a substitute for professional medical advice, diagnosis, or treatment.
            </p>
          </div>

          <div className="mt-8 pt-6 border-t border-border flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-muted-foreground">
            <p suppressHydrationWarning>&copy; {new Date().getFullYear()} — The Health Journal. All Rights Reserved.</p>
            <p>
              Made by <a href="https://www.prakashjha.com" target="_blank" rel="noopener noreferrer" className="font-medium hover:text-foreground transition-colors underline underline-offset-4">Prakashjha</a>
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
}
