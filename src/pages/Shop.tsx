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
import { categoryName, useI18n } from "@/lib/i18n";
import { cn } from "@/lib/utils";
import { PRODUCT_CATEGORIES } from "@/lib/categories";
import type { Id } from "@/convex/_generated/dataModel";
import { Search, SlidersHorizontal, Store } from "lucide-react";
import { toast } from "sonner";

type ShopProduct = ProductCardProduct & {
  maker: { _id: string; shopName: string } | null;
};

export default function Shop() {
  const { isAuthenticated } = useAuth();
  const { lang, t } = useI18n();
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
    () => new Set<string>((favorites ?? []).map((f) => f.productId as string)),
    [favorites],
  );

  const toggleFavorite = useMutation(api.favorites.toggleFavorite);
  const addToCart = useMutation(api.cart.addToCart);

  const handleToggleFavorite = (productId: string) => {
    if (!isAuthenticated) {
      toast.error(t("toast.fav.signin"));
      return;
    }
    toggleFavorite({ productId: productId as Id<"products"> })
      .then((nowFavorited) =>
        toast.success(nowFavorited ? t("toast.fav.added") : t("toast.fav.removed")),
      )
      .catch((err: Error) => toast.error(err.message));
  };

  const handleAddToCart = (productId: string) => {
    if (!isAuthenticated) {
      toast.error(t("toast.bag.signin"));
      return;
    }
    addToCart({ productId: productId as Id<"products"> })
      .then(() => toast.success(t("toast.bag.added")))
      .catch((err: Error) => toast.error(err.message));
  };

  const categories = ["All", ...PRODUCT_CATEGORIES];

  return (
    <div className="flex min-h-screen flex-col bg-background bg-paper">
      <SiteHeader />
      <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-10 sm:px-6">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <h1 className="font-display text-3xl font-semibold tracking-tight">
              {t("shop.title")}
            </h1>
            <p className="mt-1.5 text-sm text-muted-foreground">
              {products === undefined
                ? t("shop.loading")
                : products.length === 1
                  ? t("shop.countOne")
                  : t("shop.count", { count: products.length })}
            </p>
          </div>
          <div className="flex w-full items-center gap-2 sm:w-auto">
            <div className="relative flex-1 sm:w-64">
              <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder={t("shop.search")}
                className="pl-9"
              />
            </div>
            <Select value={sort} onValueChange={setSort}>
              <SelectTrigger className="w-[150px] gap-2">
                <SlidersHorizontal className="size-3.5 text-muted-foreground" />
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="featured">{t("shop.sort.featured")}</SelectItem>
                <SelectItem value="newest">{t("shop.sort.newest")}</SelectItem>
                <SelectItem value="price-asc">{t("shop.sort.asc")}</SelectItem>
                <SelectItem value="price-desc">{t("shop.sort.desc")}</SelectItem>
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
              {c === "All" ? t("shop.all") : categoryName(c, lang)}
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
              onAddToCart={handleAddToCart}
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
            <p className="font-display text-lg font-semibold">
              {t("shop.empty.title")}
            </p>
            <p className="max-w-sm text-sm text-muted-foreground">
              {t("shop.empty.body")}
            </p>
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setSearch("");
                setCategory("All");
              }}
            >
              {t("shop.clear")}
            </Button>
          </div>
        )}
      </main>
      <SiteFooter />
    </div>
  );
}