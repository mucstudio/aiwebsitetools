import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { redirect } from "next/navigation"
import { ToolCard } from "@/components/tools/ToolCard"
import { Sparkles } from "lucide-react"

export const dynamic = 'force-dynamic'

export default async function FavoritesPage() {
  const session = await auth()
  if (!session?.user?.id) {
    redirect("/login")
  }

  const favorites = await prisma.favorite.findMany({
    where: {
      userId: session.user.id,
    },
    include: {
      tool: true,
    },
    orderBy: {
      createdAt: "desc",
    },
  })

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="mb-8 space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">My Favorites</h1>
        <p className="text-muted-foreground text-lg">
          Manage your favorite tools for quick access.
        </p>
      </div>

      {favorites.length === 0 ? (
        <div className="text-center py-20 bg-muted/30 rounded-3xl border border-dashed border-muted-foreground/25">
          <Sparkles className="h-12 w-12 mx-auto text-muted-foreground mb-4 opacity-50" />
          <p className="text-xl text-muted-foreground mb-2">No favorites yet.</p>
          <p className="text-sm text-muted-foreground">
            Browse tools and click the star icon to add them to your favorites.
          </p>
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {favorites.map((fav) => (
            <ToolCard key={fav.tool.id} tool={fav.tool} />
          ))}
        </div>
      )}
    </div>
  )
}