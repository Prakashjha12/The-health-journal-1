import { Navbar } from '@/components/Navbar'

export default function Loading() {
  return (
    <div className="flex min-h-screen flex-col bg-background text-foreground">
      <Navbar />

      <main className="flex-1 relative">
        <div className="absolute inset-0 z-0 bg-background/50 backdrop-blur-sm" />

        <div className="relative z-10 animate-pulse">
          
          {/* ─── AUTHOR HEADER SECTION SKELETON ─── */}
          <div className="bg-muted/30 border-b border-border">
            <div className="max-w-[1000px] mx-auto px-6 py-16 md:py-24">
              <div className="flex flex-col md:flex-row items-center md:items-start gap-8 md:gap-12">
                
                {/* Profile Image Skeleton */}
                <div className="w-[150px] h-[150px] md:w-[200px] md:h-[200px] rounded-full border-4 border-background shadow-xl shrink-0 bg-muted" />

                {/* Profile Details Skeleton */}
                <div className="flex-1 text-center md:text-left space-y-5 w-full">
                  
                  {/* Name Skeleton */}
                  <div>
                    <div className="h-12 w-64 bg-muted rounded-md mb-4 mx-auto md:mx-0" />
                    <div className="h-6 w-40 bg-muted rounded-md mx-auto md:mx-0" />
                  </div>

                  {/* Badges Skeleton */}
                  <div className="flex flex-wrap items-center justify-center md:justify-start gap-3">
                    <div className="h-6 w-32 bg-muted rounded-full" />
                    <div className="h-6 w-36 bg-muted rounded-full" />
                  </div>

                  {/* Bio Skeleton */}
                  <div className="space-y-3 max-w-2xl mx-auto md:mx-0">
                    <div className="h-4 w-full bg-muted rounded-md" />
                    <div className="h-4 w-11/12 bg-muted rounded-md" />
                    <div className="h-4 w-4/5 bg-muted rounded-md" />
                  </div>

                  {/* Social Links Skeleton */}
                  <div className="flex flex-wrap items-center justify-center md:justify-start gap-4 pt-2">
                    <div className="h-10 w-10 bg-muted rounded-full" />
                    <div className="h-10 w-10 bg-muted rounded-full" />
                    <div className="h-10 w-10 bg-muted rounded-full" />
                    <div className="h-10 w-10 bg-muted rounded-full" />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* ─── LATEST ARTICLES BOARD SKELETON ─── */}
          <div className="max-w-[1200px] mx-auto px-6 py-20">
            <div className="flex items-center gap-3 mb-10">
              <div className="h-8 w-48 bg-muted rounded-md" />
              <div className="h-8 w-12 bg-muted rounded-full" />
            </div>

            <div className="grid gap-x-6 gap-y-10 sm:grid-cols-2 lg:grid-cols-3">
              {[1, 2, 3].map((item) => (
                <article key={item} className="flex flex-col rounded-2xl overflow-hidden bg-card border border-border/40 h-full">
                  <div className="w-full aspect-[16/11] bg-muted" />
                  <div className="p-5 flex flex-col flex-1 space-y-3">
                    <div className="h-6 w-full bg-muted rounded-md mb-1" />
                    <div className="h-6 w-3/4 bg-muted rounded-md" />
                    <div className="h-4 w-1/2 bg-muted rounded-md mt-auto pt-2" />
                  </div>
                </article>
              ))}
            </div>
          </div>

        </div>
      </main>

      {/* ─── FOOTER SKELETON ─── */}
      <footer className="w-full border-t border-border bg-background">
        <div className="max-w-[1200px] mx-auto px-6 py-10">
          <div className="mt-8 pt-6 border-t border-border flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="h-4 w-64 bg-muted rounded-md" />
            <div className="h-4 w-32 bg-muted rounded-md" />
          </div>
        </div>
      </footer>
    </div>
  )
}
