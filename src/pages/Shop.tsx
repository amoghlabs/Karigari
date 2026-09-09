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
import {
  ArrowRight,
  Search,
  SlidersHorizontal,
  Sparkles,
  Store,
  X,
} from "lucide-react";
import { toast } from "sonner";

type ShopProduct = ProductCardProduct & {
  maker: { _id: string; shopName: string } | null;
};

type RailsProduct = ProductCardProduct & {
  maker: {
    _id: string;
    shopName: string;
    location?: string;
    isFeatured?: boolean;
  } | null;
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

  const rails = useQuery(api.shop.getShopRails) as
    | { newArrivals: RailsProduct[]; featured: RailsProduct[] }
    | undefined;

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
  const browsingDefaults =
    search.trim() === "" && category === "All" && sort === "featured";

  const railCard = (product: RailsProduct, i: number) => (
    <ProductCard
      key={product._id}
      product={product}
      favorited={favoriteIds.has(product._id)}
      onToggleFavorite={handleToggleFavorite}
      onAddToCart={handleAddToCart}
      index={i}
    />
  );

  return (
    <div className="flex min-h-screen flex-col bg-background bg-paper">
      <SiteHeader />
      <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-10 sm:px-6">
        {/* Hero search — the primary way to find pieces */}
        <section className="relative overflow-hidden rounded-3xl border border-border/70 bg-card px-5 py-10 shadow-soft sm:px-10 sm:py-14">
          <div
            aria-hidden
            className="absolute inset-0 opacity-[0.05]"
            style={{
              backgroundImage:
                "url(https://images.unsplash.com/photo-1528459801416-a9e53bbf4e17?w=1200&q=50)",
              backgroundSize: "cover",
              backgroundPosition: "center",
            }}
          />
          <div className="relative mx-auto max-w-2xl text-center">
            <p className="flex items-center justify-center gap-1.5 text-xs font-semibold uppercase tracking-[0.18em] text-primary">
              <Sparkles className="size-3.5" />
              {t("shop.title")}
            </p>
            <h1 className="mt-3 font-display text-3xl font-semibold tracking-tight sm:text-4xl">
              {t("shop.search.hero")}
            </h1>
            <div className="mt-6">
              <div className="relative">
                <Search className="absolute left-5 top-1/2 size-5 -translate-y-1/2 text-muted-foreground" />
                <Input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder={t("shop.search")}
                  className="h-14 rounded-full border-2 border-border bg-background pl-13 pr-12 text-base shadow-soft transition-colors focus-visible:border-primary sm:text-lg"
                />
                {search && (
                  <button
                    type="button"
                    aria-label={t("shop.clear")}
                    onClick={() => setSearch("")}
                    className="absolute right-4 top-1/2 flex size-7 -translate-y-1/2 items-center justify-center rounded-full bg-secondary text-muted-foreground transition-colors hover:bg-primary hover:text-primary-foreground"
                  >
                    <X className="size-4" />
                  </button>
                )}
              </div>
              <p className="mt-3 text-sm text-muted-foreground">
                {products === undefined
                  ? t("shop.loading")
                  : products.length === 1
                    ? t("shop.countOne")
                    : t("shop.count", { count: products.length })}
              </p>
            </div>
          </div>
        </section>

        {/* Category chips */}
        <div className="mt-6 flex flex-wrap justify-center gap-2">
          {categories.map((c) => (
            <button
              key={c}
              type="button"
              onClick={() => setCategory(c)}
              className={cn(
                "rounded-full border px-4 py-2 text-sm font-medium transition-colors",
                category === c
                  ? "border-primary bg-primary text-primary-foreground"
                  : "border-border bg-card text-muted-foreground hover:border-primary/40 hover:text-foreground",
              )}
            >
              {c === "All" ? t("shop.all") : categoryName(c, lang)}
            </button>
          ))}
        </div>

        {/* Curated rails — default browse view */}
        {browsingDefaults && (
          <>
            <section className="mt-12">
              <div className="flex items-end justify-between gap-4">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.16em] text-primary">
                    {t("shop.newArrivals.sub")}
                  </p>
                  <h2 className="mt-1.5 font-display text-2xl font-semibold tracking-tight sm:text-3xl">
                    {t("shop.newArrivals")}
                  </h2>
                </div>
                <Button
                  asChild
                  variant="ghost"
                  className="shrink-0 gap-1.5 text-primary hover:text-primary"
                >
                  <a href="#market-grid">
                    {t("sec.latest.all")} <ArrowRight className="size-4" />
                  </a>
                </Button>
              </div>
              <div className="mt-6 flex snap-x snap-mandatory gap-4 overflow-x-auto pb-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden sm:gap-5">
                {(rails?.newArrivals ?? []).map((product, i) => (
                  <div key={product._id} className="w-[240px] shrink-0 snap-start sm:w-[280px]">
                    {railCard(product, i)}
                  </div>
                ))}
                {rails === undefined &&
                  Array.from({ length: 4 }).map((_, i) => (
                    <div
                      key={i}
                      className="aspect-[4/5] w-[240px] shrink-0 animate-pulse rounded-xl bg-muted sm:w-[280px]"
                    />
                  ))}
              </div>
            </section>

            <section className="mt-14">
              <div className="flex items-end justify-between gap-4">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.16em] text-primary">
                    {t("shop.featuredRail.sub")}
                  </p>
                  <h2 className="mt-1.5 font-display text-2xl font-semibold tracking-tight sm:text-3xl">
                    {t("shop.featuredRail")}
                  </h2>
                </div>
              </div>
              <div className="mt-6 grid grid-cols-2 gap-4 sm:gap-6 lg:grid-cols-4">
                {(rails?.featured ?? []).map((product, i) => railCard(product, i))}
                {rails === undefined &&
                  Array.from({ length: 4 }).map((_, i) => (
                    <div
                      key={i}
                      className="aspect-[4/5] animate-pulse rounded-xl bg-muted"
                    />
                  ))}
              </div>
            </section>
          </>
        )}

        {/* Everything in the market */}
        <section
          id="market-grid"
          className={cn("mt-12 scroll-mt-24", !browsingDefaults && "mt-8")}
        >
          <div className="flex items-end justify-between gap-4">
            <div>
              <h2 className="font-display text-2xl font-semibold tracking-tight sm:text-3xl">
                {t("shop.allRail")}
              </h2>
              <p className="mt-1 text-sm text-muted-foreground">
                {t("shop.allRail.sub", { count: products?.length ?? 0 })}
              </p>
            </div>
            <div className="hidden sm:block">
              <Select value={sort} onValueChange={setSort}>
                <SelectTrigger className="w-[180px] gap-2">
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

          <div className="mt-6 grid grid-cols-2 gap-4 sm:gap-6 lg:grid-cols-3 xl:grid-cols-4">
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
        </section>

        {/* Mobile sort fallback */}
        <div className="mt-8 sm:hidden">
          <Select value={sort} onValueChange={setSort}>
            <SelectTrigger className="w-full gap-2">
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
      </main>
      <SiteFooter />
    </div>
  );
}