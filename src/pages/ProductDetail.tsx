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
} from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

type DetailProduct = ProductCardProduct & {
  maker: {
    _id: string;
    shopName: string;
    location: string;
    craft: string;
    bio: string;
    image?: string;
  } | null;
};

export default function ProductDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const [quantity, setQuantity] = useState(1);

  const product = useQuery(
    api.shop.getProduct,
    id ? { id } : "skip",
  ) as DetailProduct | null | undefined;

  const makerId = product?.maker?._id;
  const makerShop = useQuery(
    api.shop.getMaker,
    makerId ? { id: makerId } : "skip",
  );

  const favorites = useQuery(
    api.favorites.listFavorites,
    isAuthenticated ? {} : "skip",
  );
  const favorited = useMemo(
    () => new Set((favorites ?? []).map((f) => f.productId)).has(id ?? ""),
    [favorites, id],
  );

  const toggleFavorite = useMutation(api.favorites.toggleFavorite);
  const addToCart = useMutation(api.cart.addToCart);

  const handleToggleFavorite = () => {
    if (!id) return;
    if (!isAuthenticated) {
      toast.error("Sign in to save favorites.");
      return;
    }
    toggleFavorite({ productId: id })
      .then((now) =>
        toast.success(now ? "Saved to favorites" : "Removed from favorites"),
      )
      .catch((err: Error) => toast.error(err.message));
  };

  const handleAddToCart = () => {
    if (!id) return;
    if (!isAuthenticated) {
      navigate(`/auth?returnTo=${encodeURIComponent(`/product/${id}`)}`);
      return;
    }
    addToCart({ productId: id, quantity })
      .then(() => toast.success("Added to your bag"))
      .catch((err: Error) => toast.error(err.message));
  };

  const soldOut = product !== undefined && product !== null && product.stock <= 0;
  const maxQty = product && product !== null ? Math.max(product.stock, 1) : 1;

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <SiteHeader />
      <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-8 sm:px-6">
        <button
          type="button"
          onClick={() => navigate(-1)}
          className="flex items-center gap-1.5 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
        >
          <ArrowLeft className="size-4" /> Back
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
              This piece is no longer listed
            </p>
            <p className="text-sm text-muted-foreground">
              It may have sold out or been retired by the maker.
            </p>
            <Button asChild size="sm">
              <Link to="/shop">Back to the marketplace</Link>
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
                <span>{product.category}</span>
                <ChevronRight className="size-3" />
                <span>
                  {product.madeToOrder ? "Made to order" : "Ready to ship"}
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
                    Only {product.stock} left
                  </span>
                )}
              </div>

              {product.maker && (
                <Link
                  to={`/maker/${product.maker._id}`}
                  className="group mt-5 flex items-center gap-3 rounded-xl border border-border/70 bg-card p-3 shadow-soft transition-shadow hover:shadow-soft-lg"
                >
                  {product.maker.image ? (
                    <img
                      src={product.maker.image}
                      alt={product.maker.shopName}
                      className="size-11 rounded-full border border-border object-cover"
                    />
                  ) : (
                    <span className="flex size-11 items-center justify-center rounded-full bg-primary/10 font-display text-base font-semibold text-primary">
                      {product.maker.shopName.charAt(0)}
                    </span>
                  )}
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold">
                      {product.maker.shopName}
                    </p>
                    <p className="mt-0.5 flex items-center gap-1 text-xs text-muted-foreground">
                      <MapPin className="size-3" />
                      {product.maker.location} · {product.maker.craft}
                    </p>
                  </div>
                  <span className="shrink-0 text-xs font-medium text-primary opacity-0 transition-opacity group-hover:opacity-100">
                    Visit studio →
                  </span>
                </Link>
              )}

              <p className="mt-5 text-sm leading-7 text-muted-foreground">
                {product.description}
              </p>

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
                      Sold out
                    </span>
                  ) : (
                    <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
                      <Hand className="size-3.5" />
                      {product.madeToOrder
                        ? "Made for you after ordering"
                        : "Ships within a few days"}
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
                    {soldOut ? "Sold out" : "Add to bag"}
                  </Button>
                  <Button
                    size="lg"
                    variant="outline"
                    aria-label="Toggle favorite"
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
                More from {makerShop.shopName}
              </h2>
              <Button asChild variant="ghost" size="sm" className="text-primary hover:text-primary">
                <Link to={`/maker/${makerShop._id}`}>Visit studio</Link>
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
