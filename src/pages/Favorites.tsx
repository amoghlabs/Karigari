import { useMemo } from "react";
import { Link } from "react-router";
import { useMutation, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { ProductCard, type ProductCardProduct } from "@/components/ProductCard";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/use-auth";
import { ArrowRight, Heart } from "lucide-react";
import { toast } from "sonner";

type FavProduct = ProductCardProduct & {
  maker: { _id: string; shopName: string } | null;
};

export default function Favorites() {
  const { isAuthenticated } = useAuth();

  const products = useQuery(
    api.favorites.listFavoriteProducts,
    isAuthenticated ? {} : "skip",
  ) as FavProduct[] | undefined;

  const favorites = useQuery(
    api.favorites.listFavorites,
    isAuthenticated ? {} : "skip",
  );
  const favoriteIds = useMemo(
    () => new Set((favorites ?? []).map((f) => f.productId)),
    [favorites],
  );

  const toggleFavorite = useMutation(api.favorites.toggleFavorite);

  const handleToggleFavorite = (productId: string) => {
    toggleFavorite({ productId })
      .then((now) =>
        toast.success(now ? "Saved to favorites" : "Removed from favorites"),
      )
      .catch((err: Error) => toast.error(err.message));
  };

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <SiteHeader />
      <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-10 sm:px-6">
        <h1 className="font-display text-3xl font-semibold tracking-tight">
          Favorites
        </h1>
        <p className="mt-1.5 text-sm text-muted-foreground">
          {products === undefined
            ? "Loading…"
            : products.length === 0
              ? "Nothing saved yet"
              : `${products.length} piece${products.length === 1 ? "" : "s"} you love`}
        </p>

        {products !== undefined && products.length === 0 && (
          <div className="mt-10 flex flex-col items-center gap-4 rounded-xl border border-dashed border-border bg-card py-20 text-center">
            <span className="flex size-14 items-center justify-center rounded-full bg-secondary">
              <Heart className="size-6 text-muted-foreground" />
            </span>
            <div>
              <p className="font-display text-lg font-semibold">
                No favorites yet
              </p>
              <p className="mt-1 max-w-sm text-sm text-muted-foreground">
                Tap the heart on any piece to keep it here while you decide.
              </p>
            </div>
            <Button asChild className="rounded-full">
              <Link to="/shop">
                Browse the marketplace <ArrowRight className="size-4" />
              </Link>
            </Button>
          </div>
        )}

        <div className="mt-8 grid grid-cols-2 gap-4 sm:gap-6 lg:grid-cols-4">
          {products?.map((product, i) => (
            <ProductCard
              key={product._id}
              product={product}
              favorited={favoriteIds.has(product._id)}
              onToggleFavorite={handleToggleFavorite}
              index={i}
            />
          ))}
          {products === undefined &&
            Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="aspect-[4/5] animate-pulse rounded-xl bg-muted" />
            ))}
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}
