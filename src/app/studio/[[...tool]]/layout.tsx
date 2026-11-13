export const metadata = {
  title: 'Sanity Studio',
  description: 'Manage content for the blog',
}

export default function StudioLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-background">
      {children}
    </div>
  )
}

