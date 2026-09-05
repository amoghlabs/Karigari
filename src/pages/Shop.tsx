import { useMemo, useState } from "react";
import { useMutation, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { ProductCard, type ProductCardProduct } from "@/components/ProductCard";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useAuth } from "@/hooks/use-auth";
import { cn } from "@/lib/utils";
import { PRODUCT_CATEGORIES } from "@/lib/categories";
import { Search, SlidersHorizontal, Store } from "lucide-react";
import { toast } from "sonner";

type ShopProduct = ProductCardProduct & {
  maker: { _id: string; shopName: string } | null;
};

export default function Shop() {
  const { isAuthenticated } = useAuth();
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState<string>("All");
  const [sort, setSort] = useState<string>("featured");

  const products = useQuery(api.shop.listProducts, {
    category,
    search: search || undefined,
    sort,
  }) as ShopProduct[] | undefined;

  const favorites = useQuery(
    api.favorites.listFavorites,
    isAuthenticated ? {} : "skip",
  );
  const favoriteIds = useMemo(
    () => new Set((favorites ?? []).map((f) => f.productId)),
    [favorites],
  );

  const toggleFavorite = useMutation(api.favorites.toggleFavorite);
  const addToCart = useMutation(api.cart.addToCart);

  const handleToggleFavorite = (productId: string) => {
    if (!isAuthenticated) {
      toast.error("Sign in to save favorites.");
      return;
    }
    toggleFavorite({ productId })
      .then((nowFavorited) =>
        toast.success(nowFavorited ? "Saved to favorites" : "Removed from favorites"),
      )
      .catch((err: Error) => toast.error(err.message));
  };

  const handleAddToCart = (productId: string) => {
    if (!isAuthenticated) {
      toast.error("Sign in to add pieces to your bag.");
      return;
    }
    addToCart({ productId })
      .then(() => toast.success("Added to your bag"))
      .catch((err: Error) => toast.error(err.message));
  };

  const categories = ["All", ...PRODUCT_CATEGORIES];

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <SiteHeader />
      <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-10 sm:px-6">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <h1 className="font-display text-3xl font-semibold tracking-tight">
              The marketplace
            </h1>
            <p className="mt-1.5 text-sm text-muted-foreground">
              {products === undefined
                ? "Loading pieces…"
                : `${products.length} piece${products.length === 1 ? "" : "s"} from independent studios`}
            </p>
          </div>
          <div className="flex w-full items-center gap-2 sm:w-auto">
            <div className="relative flex-1 sm:w-64">
              <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search pieces, materials…"
                className="pl-9"
              />
            </div>
            <Select value={sort} onValueChange={setSort}>
              <SelectTrigger className="w-[150px] gap-2">
                <SlidersHorizontal className="size-3.5 text-muted-foreground" />
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="featured">Featured</SelectItem>
                <SelectItem value="newest">Newest</SelectItem>
                <SelectItem value="price-asc">Price: low to high</SelectItem>
                <SelectItem value="price-desc">Price: high to low</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="mt-6 flex flex-wrap gap-2">
          {categories.map((c) => (
            <button
              key={c}
              type="button"
              onClick={() => setCategory(c)}
              className={cn(
                "rounded-full border px-4 py-1.5 text-sm font-medium transition-colors",
                category === c
                  ? "border-primary bg-primary text-primary-foreground"
                  : "border-border bg-card text-muted-foreground hover:border-primary/40 hover:text-foreground",
              )}
            >
              {c}
            </button>
          ))}
        </div>

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
            Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="aspect-[4/5] animate-pulse rounded-xl bg-muted" />
            ))}
        </div>

        {products !== undefined && products.length === 0 && (
          <div className="flex flex-col items-center gap-3 rounded-xl border border-dashed border-border bg-card py-16 text-center">
            <Store className="size-8 text-muted-foreground/60" />
            <p className="font-display text-lg font-semibold">No pieces found</p>
            <p className="max-w-sm text-sm text-muted-foreground">
              Try a different search or category — new work lands every week.
            </p>
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setSearch("");
                setCategory("All");
              }}
            >
              Clear filters
            </Button>
          </div>
        )}
      </main>
      <SiteFooter />
    </div>
  );
}
