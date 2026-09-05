import { Link } from "react-router";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { ProductCard, type ProductCardProduct } from "@/components/ProductCard";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/use-auth";
import { formatPrice } from "@/lib/format";
import {
  ArrowRight,
  Heart,
  MapPin,
  Package,
  ShoppingBag,
  Sparkles,
  Store,
} from "lucide-react";

export default function Dashboard() {
  const { user } = useAuth();
  const cart = useQuery(api.cart.getCart);
  const favorites = useQuery(api.favorites.listFavorites);
  const orders = useQuery(api.orders.listMyOrders);
  const studio = useQuery(api.studio.myListings);
  const products = useQuery(api.shop.listProducts, { limit: 4 }) as
    | (ProductCardProduct & { maker: { _id: string; shopName: string } | null })[]
    | undefined;

  const firstName = (user?.name || user?.email || "maker").split(/[@\s]/)[0];

  const quickLinks = [
    {
      to: "/shop",
      icon: Store,
      title: "Browse the marketplace",
      body: "Fresh pieces from studios across the country.",
    },
    {
      to: "/orders",
      icon: Package,
      title: "Track your orders",
      body:
        !orders
          ? "Loading…"
          : orders.length === 0
            ? "No orders yet — your first one is waiting to happen."
            : `${orders.length} order${orders.length === 1 ? "" : "s"} placed.`,
    },
    {
      to: "/favorites",
      icon: Heart,
      title: "Your favorites",
      body:
        favorites === undefined
          ? "Loading…"
          : favorites.length === 0
            ? "Heart a piece to keep it here."
            : `${favorites.length} saved piece${favorites.length === 1 ? "" : "s"}.`,
    },
    {
      to: "/studio",
      icon: Sparkles,
      title:
        studio === null || studio === undefined
          ? "Open your studio"
          : studio.maker.shopName,
      body:
        studio === null || studio === undefined
          ? "Sell your own work with zero platform fees."
          : `${studio.products.length} listing${studio.products.length === 1 ? "" : "s"} · manage your storefront.`,
    },
  ];

  return (
    <div className="min-h-screen bg-background bg-dotted">
      <SiteHeader />
      <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-10 sm:px-6">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-primary">
              Welcome back
            </p>
            <h1 className="mt-1.5 font-display text-3xl font-semibold tracking-tight sm:text-4xl">
              Hey {firstName}
            </h1>
          </div>
          <Button asChild size="sm" className="rounded-full shadow-soft">
            <Link to="/shop">
              <ShoppingBag className="size-4" /> Continue shopping
            </Link>
          </Button>
        </div>

        {/* Stats row */}
        <div className="mt-8 grid grid-cols-3 gap-4">
          {[
            {
              icon: ShoppingBag,
              label: "In your bag",
              value:
                !cart ? "—" : cart.count === 0 ? "0" : String(cart.count),
              sub:
                cart && cart.subtotal > 0 ? formatPrice(cart.subtotal) : "Empty",
              to: "/cart",
            },
            {
              icon: Heart,
              label: "Favorites",
              value:
                favorites === undefined
                  ? "—"
                  : String(favorites.length),
              sub: "Saved pieces",
              to: "/favorites",
            },
            {
              icon: Package,
              label: "Orders",
              value: !orders ? "—" : String(orders.length),
              sub: "All time",
              to: "/orders",
            },
          ].map((stat) => (
            <Link
              key={stat.label}
              to={stat.to}
              className="group rounded-xl border border-border/70 bg-card p-5 shadow-soft transition-shadow hover:shadow-soft-lg"
            >
              <span className="flex size-9 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <stat.icon className="size-4" />
              </span>
              <p className="mt-3 font-display text-2xl font-semibold tracking-tight">
                {stat.value}
              </p>
              <p className="text-xs font-medium uppercase tracking-[0.1em] text-muted-foreground">
                {stat.label}
              </p>
              <p className="mt-1 text-xs text-muted-foreground/80">{stat.sub}</p>
            </Link>
          ))}
        </div>

        {/* Quick links */}
        <div className="mt-6 grid gap-4 sm:grid-cols-2">
          {quickLinks.map((link) => (
            <Link
              key={link.title}
              to={link.to}
              className="group flex items-start gap-4 rounded-xl border border-border/70 bg-card p-5 shadow-soft transition-shadow hover:shadow-soft-lg"
            >
              <span className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-secondary text-foreground">
                <link.icon className="size-5" />
              </span>
              <span className="min-w-0 flex-1">
                <span className="flex items-center gap-1 font-display text-base font-semibold tracking-tight">
                  {link.title}
                  <ArrowRight className="size-4 text-muted-foreground opacity-0 transition-all group-hover:translate-x-0.5 group-hover:opacity-100" />
                </span>
                <span className="mt-1 block text-sm leading-6 text-muted-foreground">
                  {link.body}
                </span>
              </span>
            </Link>
          ))}
        </div>

        {/* Studio CTA / summary */}
        {studio !== undefined && studio !== null && (
          <Link
            to="/studio"
            className="group mt-6 flex flex-wrap items-center gap-4 rounded-xl border border-primary/25 bg-primary/5 p-5 transition-colors hover:bg-primary/10"
          >
            <span className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-primary text-primary-foreground">
              <Store className="size-5" />
            </span>
            <span className="min-w-0 flex-1">
              <span className="font-display text-base font-semibold tracking-tight">
                {studio.maker.shopName}
              </span>
              <span className="mt-0.5 flex items-center gap-1 text-xs text-muted-foreground">
                <MapPin className="size-3" />
                {studio.maker.location} · your studio is live
              </span>
            </span>
            <span className="text-sm font-medium text-primary">
              Manage listings →
            </span>
          </Link>
        )}

        {/* Fresh pieces */}
        <section className="mt-12">
          <div className="flex items-end justify-between">
            <h2 className="font-display text-2xl font-semibold tracking-tight">
              New from the studios
            </h2>
            <Button asChild variant="ghost" size="sm" className="text-primary hover:text-primary">
              <Link to="/shop">
                See all <ArrowRight className="size-4" />
              </Link>
            </Button>
          </div>
          <div className="mt-6 grid grid-cols-2 gap-4 sm:gap-6 lg:grid-cols-4">
            {(products ?? []).map((product, i) => (
              <ProductCard key={product._id} product={product} index={i} />
            ))}
            {products === undefined &&
              Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="aspect-[4/5] animate-pulse rounded-xl bg-muted" />
              ))}
          </div>
        </section>
      </main>
      <SiteFooter />
    </div>
  );
}
