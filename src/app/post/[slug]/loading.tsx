import { Navbar } from '@/components/Navbar'

export default function Loading() {
  return (
    <div className="flex min-h-screen flex-col bg-background text-foreground">
      <Navbar />

      {/* ─── LOADING SKELETON WITH BLUR ─── */}
      <main className="flex-1 relative">
        <div className="absolute inset-0 z-0 bg-background/50 backdrop-blur-sm" />

        <div className="relative z-10 animate-pulse">
          {/* Breadcrumbs Skeleton */}
          <div className="max-w-[1200px] mx-auto px-6 pt-6">
            <div className="h-4 w-48 bg-muted rounded-md" />
          </div>

          {/* Article Header Skeleton */}
          <div className="max-w-[1200px] mx-auto px-6 pt-8 pb-8">
            <div className="max-w-[720px]">
              <div className="h-10 w-24 bg-muted rounded-full mb-6" />
              <div className="h-10 sm:h-12 w-full bg-muted rounded-md mb-3" />
              <div className="h-10 sm:h-12 w-3/4 bg-muted rounded-md mb-6" />

              <div className="mt-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="h-5 w-32 bg-muted rounded-md" />
                  <div className="w-2 h-2 rounded-full bg-muted" />
                  <div className="h-5 w-24 bg-muted rounded-md" />
                </div>
                <div className="h-10 w-32 bg-muted rounded-md" />
              </div>
            </div>
          </div>

          {/* Featured Image Skeleton */}
          <div className="max-w-[1200px] mx-auto px-6 mb-10">
            <div className="w-full aspect-[21/9] bg-muted rounded-2xl" />
          </div>

          {/* Content Area Skeleton */}
          <div className="max-w-[1200px] mx-auto px-6 pb-20">
            <div className="grid gap-8 lg:grid-cols-[60px_1fr_300px]">
              
              {/* Left Social Sidebar Space */}
              <aside className="hidden lg:block">
                <div className="h-48 w-full bg-muted rounded-xl" />
              </aside>

              {/* Article prose */}
              <article className="space-y-4">
                <div className="h-4 w-full bg-muted rounded-md" />
                <div className="h-4 w-11/12 bg-muted rounded-md" />
                <div className="h-4 w-full bg-muted rounded-md" />
                <div className="h-4 w-5/6 bg-muted rounded-md" />
                
                <div className="h-8 w-2/3 bg-muted rounded-md mt-10 mb-4" />
                
                <div className="h-4 w-full bg-muted rounded-md" />
                <div className="h-4 w-11/12 bg-muted rounded-md" />
                <div className="h-4 w-full bg-muted rounded-md" />
                <div className="h-4 w-4/5 bg-muted rounded-md" />
                
                <div className="h-32 w-full bg-muted rounded-xl mt-8" />
              </article>

              {/* Right Sidebar Space */}
              <aside className="hidden lg:block">
                <div className="h-64 w-full bg-muted rounded-xl" />
              </aside>
            </div>
          </div>

          {/* Publisher Card Skeleton */}
          <div className="max-w-[1000px] mx-auto px-6 pb-20 mt-10">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-card border border-border/60 rounded-2xl p-6 flex flex-col sm:flex-row items-center sm:items-start gap-5 shadow-sm">
                <div className="w-[80px] h-[80px] bg-muted rounded-full shrink-0" />
                <div className="flex-1 w-full space-y-2">
                   <div className="h-3 w-20 bg-muted rounded-md" />
                   <div className="h-6 w-48 bg-muted rounded-md" />
                   <div className="h-4 w-full bg-muted rounded-md mt-4" />
                   <div className="h-4 w-4/5 bg-muted rounded-md" />
                </div>
              </div>
            </div>
          </div>

        </div>
      </main>

      {/* Footer Skeleton */}
      <footer className="w-full border-t border-border bg-background">
        <div className="max-w-[1200px] mx-auto px-6 py-10">
          <div className="h-20 w-full bg-muted/50 rounded-lg animate-pulse" />
        </div>
      </footer>
    </div>
  )
}
