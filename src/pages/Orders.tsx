import { Link, useLocation } from "react-router";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { formatDate, formatPrice } from "@/lib/format";
import {
  ArrowRight,
  CheckCircle2,
  MapPin,
  Package,
  PackageCheck,
  PackageOpen,
  Truck,
} from "lucide-react";

const STATUS_META = {
  paid: { label: "Paid", icon: CheckCircle2 },
  shipped: { label: "Shipped", icon: Truck },
  delivered: { label: "Delivered", icon: PackageCheck },
} as const;

export default function Orders() {
  const location = useLocation();
  const justPlaced = (location.state as { justPlaced?: string } | null)?.justPlaced;

  const orders = useQuery(api.orders.listMyOrders);

  const ordered = orders ?? [];

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <SiteHeader />
      <main className="mx-auto w-full max-w-4xl flex-1 px-4 py-10 sm:px-6">
        <h1 className="font-display text-3xl font-semibold tracking-tight">
          Your orders
        </h1>
        <p className="mt-1.5 text-sm text-muted-foreground">
          {orders === undefined
            ? "Loading…"
            : ordered.length === 0
              ? "No orders yet"
              : `${ordered.length} order${ordered.length === 1 ? "" : "s"} from independent studios`}
        </p>

        {orders !== undefined && ordered.length === 0 && (
          <div className="mt-10 flex flex-col items-center gap-4 rounded-xl border border-dashed border-border bg-card py-20 text-center">
            <span className="flex size-14 items-center justify-center rounded-full bg-secondary">
              <PackageOpen className="size-6 text-muted-foreground" />
            </span>
            <div>
              <p className="font-display text-lg font-semibold">
                Nothing ordered yet
              </p>
              <p className="mt-1 text-sm text-muted-foreground">
                When you buy from a maker, it&apos;ll show up here.
              </p>
            </div>
            <Button asChild className="rounded-full">
              <Link to="/shop">
                Start shopping <ArrowRight className="size-4" />
              </Link>
            </Button>
          </div>
        )}

        {justPlaced && (
          <div className="mt-6 flex items-start gap-3 rounded-xl border border-primary/30 bg-primary/5 p-4">
            <CheckCircle2 className="mt-0.5 size-5 shrink-0 text-primary" />
            <div className="text-sm">
              <p className="font-semibold">Order placed — thank you!</p>
              <p className="mt-0.5 text-muted-foreground">
                The makers you ordered from have been notified and will start
                preparing your pieces.
              </p>
            </div>
          </div>
        )}

        <div className="mt-8 space-y-5">
          {ordered.map((order) => {
            const meta = STATUS_META[order.status];
            const StatusIcon = meta.icon;
            return (
              <article
                key={order._id}
                className="overflow-hidden rounded-xl border border-border/70 bg-card shadow-soft"
              >
                <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border/60 bg-secondary/40 px-5 py-3.5">
                  <div className="flex items-center gap-4 text-sm">
                    <span className="flex items-center gap-1.5 font-medium">
                      <Package className="size-4 text-muted-foreground" />
                      {formatDate(order.createdAt)}
                    </span>
                    <span className="flex items-center gap-1.5 text-muted-foreground">
                      <StatusIcon className="size-4 text-primary" />
                      {meta.label}
                    </span>
                  </div>
                  <Badge
                    variant="secondary"
                    className="rounded-full font-normal text-muted-foreground"
                  >
                    Order · {order._id.slice(-6)}
                  </Badge>
                </div>

                <div className="px-5 py-4">
                  <ul className="space-y-3">
                    {order.items.map((item) => (
                      <li key={item._id} className="flex items-center gap-3">
                        <Link
                          to={`/product/${item.productId}`}
                          className="shrink-0 overflow-hidden rounded-lg"
                        >
                          <img
                            src={item.productImage}
                            alt={item.productTitle}
                            className="size-14 object-cover"
                          />
                        </Link>
                        <div className="min-w-0 flex-1">
                          <Link
                            to={`/product/${item.productId}`}
                            className="block truncate text-sm font-medium hover:text-primary"
                          >
                            {item.productTitle}
                          </Link>
                          <p className="mt-0.5 text-xs text-muted-foreground">
                            Qty {item.quantity} · {formatPrice(item.price)} each
                          </p>
                        </div>
                        <span className="text-sm font-semibold">
                          {formatPrice(item.price * item.quantity)}
                        </span>
                      </li>
                    ))}
                  </ul>

                  <Separator className="my-4" />

                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <span className="flex items-start gap-1.5 text-xs text-muted-foreground">
                      <MapPin className="mt-0.5 size-3.5 shrink-0" />
                      <span className="max-w-xs whitespace-pre-line">
                        {order.fullName} · {order.address}
                      </span>
                    </span>
                    <span className="font-display text-base font-semibold">
                      Total{" "}
                      <span className="text-primary">
                        {formatPrice(order.total)}
                      </span>
                    </span>
                  </div>
                </div>
              </article>
            );
          })}
          {orders === undefined &&
            Array.from({ length: 2 }).map((_, i) => (
              <div key={i} className="h-40 animate-pulse rounded-xl bg-muted" />
            ))}
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}
