import { useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router";
import { useMutation, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { ProductCard, type ProductCardProduct } from "@/components/ProductCard";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { useAuth } from "@/hooks/use-auth";
import { categoryName, useI18n } from "@/lib/i18n";
import { formatPrice } from "@/lib/format";
import {
  ArrowLeft,
  ChevronRight,
  Hand,
  Heart,
  MapPin,
  Minus,
  Plus,
  ShoppingBag,
  Sparkles,
} from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import type { Id } from "@/convex/_generated/dataModel";

type DetailProduct = ProductCardProduct & {
  maker:
    | {
        _id: string;
        shopName: string;
        artisanName?: string;
        location: string;
        craft: string;
        crafts?: string[];
        story: string;
        bio: string;
        image?: string;
      }
    | null;
};

export default function ProductDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const { lang, t } = useI18n();
  const [quantity, setQuantity] = useState(1);

  const product = useQuery(
    api.shop.getProduct,
    id ? { id: id as Id<"products"> } : "skip",
  ) as DetailProduct | null | undefined;

  const makerId = product?.maker?._id as Id<"makers"> | undefined;
  const makerShop = useQuery(
    api.shop.getMaker,
    makerId ? { id: makerId } : "skip",
  );

  const favorites = useQuery(
    api.favorites.listFavorites,
    isAuthenticated ? {} : "skip",
  );
  const favorited = useMemo(
    () =>
      new Set<string>((favorites ?? []).map((f) => f.productId as string)).has(
        id ?? "",
      ),
    [favorites, id],
  );

  const toggleFavorite = useMutation(api.favorites.toggleFavorite);
  const addToCart = useMutation(api.cart.addToCart);

  const handleToggleFavorite = () => {
    if (!id) return;
    if (!isAuthenticated) {
      toast.error(t("toast.fav.signin"));
      return;
    }
    toggleFavorite({ productId: id as Id<"products"> })
      .then((now) =>
        toast.success(now ? t("toast.fav.added") : t("toast.fav.removed")),
      )
      .catch((err: Error) => toast.error(err.message));
  };

  const handleAddToCart = () => {
    if (!id) return;
    if (!isAuthenticated) {
      navigate(`/auth?returnTo=${encodeURIComponent(`/product/${id}`)}`);
      return;
    }
    addToCart({ productId: id as Id<"products">, quantity })
      .then(() => toast.success(t("toast.bag.added")))
      .catch((err: Error) => toast.error(err.message));
  };

  const soldOut = product !== undefined && product !== null && product.stock <= 0;
  const maxQty = product && product !== null ? Math.max(product.stock, 1) : 1;

  return (
    <div className="flex min-h-screen flex-col bg-background bg-paper">
      <SiteHeader />
      <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-8 sm:px-6">
        <button
          type="button"
          onClick={() => navigate(-1)}
          className="flex items-center gap-1.5 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
        >
          <ArrowLeft className="size-4" /> {t("pd.back")}
        </button>

        {product === undefined && (
          <div className="mt-8 grid gap-10 lg:grid-cols-2">
            <div className="aspect-square animate-pulse rounded-2xl bg-muted" />
            <div className="space-y-4 py-4">
              <div className="h-4 w-24 animate-pulse rounded bg-muted" />
              <div className="h-10 w-3/4 animate-pulse rounded bg-muted" />
              <div className="h-6 w-20 animate-pulse rounded bg-muted" />
              <div className="h-24 w-full animate-pulse rounded bg-muted" />
            </div>
          </div>
        )}

        {product === null && (
          <div className="mt-16 flex flex-col items-center gap-3 rounded-xl border border-dashed border-border bg-card py-16 text-center">
            <p className="font-display text-lg font-semibold">
              {t("pd.gone.title")}
            </p>
            <p className="text-sm text-muted-foreground">{t("pd.gone.body")}</p>
            <Button asChild size="sm">
              <Link to="/shop">{t("pd.gone.cta")}</Link>
            </Button>
          </div>
        )}

        {product && (
          <div className="mt-6 grid gap-10 lg:grid-cols-2">
            <div className="overflow-hidden rounded-2xl border border-border/70 bg-card shadow-soft">
              <img
                src={product.imageUrl}
                alt={product.title}
                className="aspect-square w-full object-cover"
              />
            </div>

            <div className="flex flex-col">
              <div className="flex items-center gap-2 text-xs font-medium text-muted-foreground">
                <span>{categoryName(product.category, lang)}</span>
                <ChevronRight className="size-3" />
                <span>
                  {product.madeToOrder ? t("card.madeToOrder") : t("pd.readyToShip")}
                </span>
              </div>

              <h1 className="mt-3 font-display text-3xl font-semibold leading-tight tracking-tight sm:text-4xl">
                {product.title}
              </h1>

              <div className="mt-3 flex items-baseline gap-3">
                <span className="font-display text-2xl font-semibold text-primary">
                  {formatPrice(product.price)}
                </span>
                {product.stock > 0 && product.stock <= 3 && (
                  <span className="text-sm font-medium text-primary">
                    {t("card.onlyLeft", { count: product.stock })}
                  </span>
                )}
              </div>

              {/* Meet the artisan — a human face on the piece, distinct from
                  the story about the craft itself. */}
              {product.maker && (
                <section className="mt-5 rounded-2xl border border-border/70 bg-card p-4 shadow-soft">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-primary">
                    {t("pd.meet.title")}
                  </p>
                  <div className="mt-3 flex items-start gap-3">
                    {product.maker.image ? (
                      <img
                        src={product.maker.image}
                        alt={product.maker.shopName}
                        className="size-14 shrink-0 rounded-xl border border-border object-cover"
                      />
                    ) : (
                      <span className="flex size-14 shrink-0 items-center justify-center rounded-xl bg-primary/10 font-display text-lg font-semibold text-primary">
                        {product.maker.shopName.charAt(0)}
                      </span>
                    )}
                    <div className="min-w-0 flex-1">
                      <p className="truncate font-display text-base font-semibold tracking-tight">
                        {product.maker.artisanName || product.maker.shopName}
                      </p>
                      {product.maker.artisanName && (
                        <p className="truncate text-xs font-medium text-muted-foreground">
                          {product.maker.shopName}
                        </p>
                      )}
                      <p className="mt-0.5 flex items-center gap-1 text-xs text-muted-foreground">
                        <MapPin className="size-3" />
                        {t("pd.meet.made")} {product.maker.location}
                      </p>
                      <p className="mt-1 text-xs text-muted-foreground">
                        {t("mf.craftsLabel")}:{" "}
                        {(product.maker.crafts ?? [product.maker.craft])
                          .slice(0, 4)
                          .map((c) => categoryName(c, lang))
                          .join(", ")}
                      </p>
                    </div>
                  </div>
                  <p className="mt-3 text-sm leading-6 text-muted-foreground">
                    {product.maker.bio}
                  </p>
                  <Link
                    to={`/maker/${product.maker._id}`}
                    className="mt-2 inline-flex items-center gap-1 text-xs font-semibold text-primary hover:underline"
                  >
                    {t("pd.maker.visit")}
                    <ChevronRight className="size-3" />
                  </Link>
                </section>
              )}

              <p className="mt-5 text-sm leading-7 text-muted-foreground">
                {lang === "hi" && product.descriptionHi
                  ? product.descriptionHi
                  : product.description}
              </p>

              {/* Cultural story — the artisan's own words, front and center
                  before the buy box. */}
              {product.maker?.story && (
                <aside className="mt-6 rounded-2xl border border-primary/25 bg-primary/5 p-5 shadow-soft">
                  <p className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-[0.14em] text-primary">
                    <Sparkles className="size-3.5" />
                    {t("pd.story.title")}
                  </p>
                  <p className="mt-2.5 border-l-2 border-primary/30 pl-4 text-sm italic leading-7 text-foreground/90">
                    {product.maker.story}
                  </p>
                  <Link
                    to={`/maker/${product.maker._id}`}
                    className="mt-3 inline-flex text-xs font-semibold text-primary hover:underline"
                  >
                    {t("pd.maker.visit")}
                  </Link>
                </aside>
              )}

              {(product.colors?.length || product.dimensions) && (
                <div className="mt-4 flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                  {product.dimensions && (
                    <span className="rounded-full border border-border bg-card px-3 py-1.5">
                      {product.dimensions}
                    </span>
                  )}
                  {(product.colors ?? []).map((c) => (
                    <span
                      key={c}
                      className="rounded-full border border-border bg-card px-3 py-1.5"
                    >
                      {c}
                    </span>
                  ))}
                </div>
              )}

              <div className="mt-5 flex flex-wrap gap-2">
                {product.materials.map((m) => (
                  <Badge key={m} variant="secondary" className="rounded-full font-normal">
                    {m}
                  </Badge>
                ))}
              </div>

              <Separator className="my-6" />

              <div className="mt-auto flex flex-col gap-3">
                <div className="flex items-center gap-3">
                  <div className="flex items-center rounded-full border border-border bg-card">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="size-9 rounded-full"
                      disabled={quantity <= 1}
                      onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                    >
                      <Minus className="size-3.5" />
                    </Button>
                    <span className="w-8 text-center text-sm font-semibold">
                      {quantity}
                    </span>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="size-9 rounded-full"
                      disabled={soldOut || quantity >= maxQty}
                      onClick={() => setQuantity((q) => Math.min(maxQty, q + 1))}
                    >
                      <Plus className="size-3.5" />
                    </Button>
                  </div>
                  {soldOut ? (
                    <span className="text-sm font-medium text-muted-foreground">
                      {t("card.soldOut")}
                    </span>
                  ) : (
                    <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
                      <Hand className="size-3.5" />
                      {product.madeToOrder ? t("pd.madeForYou") : t("pd.shipsSoon")}
                    </span>
                  )}
                </div>

                <div className="flex gap-2">
                  <Button
                    size="lg"
                    className="h-12 flex-1 rounded-full text-base shadow-soft"
                    disabled={soldOut}
                    onClick={handleAddToCart}
                  >
                    <ShoppingBag className="size-4" />
                    {soldOut ? t("card.soldOut") : t("pd.addToBag")}
                  </Button>
                  <Button
                    size="lg"
                    variant="outline"
                    aria-label={t("card.fav.add")}
                    className={cn(
                      "size-12 rounded-full p-0",
                      favorited && "border-primary/50 text-primary",
                    )}
                    onClick={handleToggleFavorite}
                  >
                    <Heart className={cn("size-5", favorited && "fill-current")} />
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}

        {makerShop && makerShop.products.filter((p) => p._id !== id).length > 0 && (
          <section className="mt-16 border-t border-border/70 pt-10">
            <div className="flex items-end justify-between">
              <h2 className="font-display text-2xl font-semibold tracking-tight">
                {t("pd.more", { name: makerShop.shopName })}
              </h2>
              <Button asChild variant="ghost" size="sm" className="text-primary hover:text-primary">
                <Link to={`/maker/${makerShop._id}`}>{t("pd.maker.visit")}</Link>
              </Button>
            </div>
            <div className="mt-6 grid grid-cols-2 gap-4 sm:gap-6 lg:grid-cols-4">
              {makerShop.products
                .filter((p) => p._id !== id)
                .slice(0, 4)
                .map((p, i) => (
                  <ProductCard key={p._id} product={{ ...p, maker: null }} index={i} />
                ))}
            </div>
          </section>
        )}
      </main>
      <SiteFooter />
    </div>
  );
}