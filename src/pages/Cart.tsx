import { useState } from "react";
import { Link, useNavigate } from "react-router";
import { useMutation, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { formatPrice } from "@/lib/format";
import {
  ArrowRight,
  Hand,
  Loader2,
  Minus,
  Plus,
  ShoppingBag,
  Trash2,
  Truck,
} from "lucide-react";
import { toast } from "sonner";

export default function Cart() {
  const navigate = useNavigate();
  const cart = useQuery(api.cart.getCart);
  const updateItem = useMutation(api.cart.updateCartItem);
  const removeItem = useMutation(api.cart.removeCartItem);
  const placeOrder = useMutation(api.orders.placeOrder);

  const [checkoutOpen, setCheckoutOpen] = useState(false);
  const [placing, setPlacing] = useState(false);
  const [fullName, setFullName] = useState("");
  const [address, setAddress] = useState("");

  if (cart === undefined) {
    return (
      <div className="flex min-h-screen flex-col bg-background">
        <SiteHeader />
        <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-10 sm:px-6">
          <div className="h-8 w-40 animate-pulse rounded bg-muted" />
          <div className="mt-8 space-y-4">
            {Array.from({ length: 2 }).map((_, i) => (
              <div key={i} className="h-28 animate-pulse rounded-xl bg-muted" />
            ))}
          </div>
        </main>
      </div>
    );
  }

  const lines = cart?.items ?? [];
  const subtotal = cart?.subtotal ?? 0;
  const count = cart?.count ?? 0;

  const handlePlaceOrder = async () => {
    setPlacing(true);
    try {
      const result = await placeOrder({ fullName, address });
      setCheckoutOpen(false);
      toast.success("Order placed — thank you!");
      navigate("/orders", {
        state: { justPlaced: result.orderId, total: result.total },
      });
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Checkout failed.");
    } finally {
      setPlacing(false);
    }
  };

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <SiteHeader />
      <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-10 sm:px-6">
        <h1 className="font-display text-3xl font-semibold tracking-tight">
          Your bag
        </h1>
        <p className="mt-1.5 text-sm text-muted-foreground">
          {count === 0
            ? "Nothing here yet"
            : `${count} piece${count === 1 ? "" : "s"} from independent studios`}
        </p>

        {lines.length === 0 ? (
          <div className="mt-10 flex flex-col items-center gap-4 rounded-xl border border-dashed border-border bg-card py-20 text-center">
            <span className="flex size-14 items-center justify-center rounded-full bg-secondary">
              <ShoppingBag className="size-6 text-muted-foreground" />
            </span>
            <div>
              <p className="font-display text-lg font-semibold">
                Your bag is empty
              </p>
              <p className="mt-1 text-sm text-muted-foreground">
                Find something made by hand — you&apos;ll know the difference.
              </p>
            </div>
            <Button asChild className="rounded-full">
              <Link to="/shop">
                Browse the marketplace <ArrowRight className="size-4" />
              </Link>
            </Button>
          </div>
        ) : (
          <div className="mt-8 grid gap-8 lg:grid-cols-[1fr_360px]">
            <ul className="space-y-4">
              {lines.map((line) => (
                <li
                  key={line.itemId}
                  className="flex gap-4 rounded-xl border border-border/70 bg-card p-4 shadow-soft"
                >
                  <Link
                    to={`/product/${line.product._id}`}
                    className="shrink-0 overflow-hidden rounded-lg"
                  >
                    <img
                      src={line.product.imageUrl}
                      alt={line.product.title}
                      className="size-24 object-cover transition-transform hover:scale-105"
                    />
                  </Link>
                  <div className="flex min-w-0 flex-1 flex-col">
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <Link
                          to={`/product/${line.product._id}`}
                          className="font-display text-base font-semibold leading-snug tracking-tight hover:text-primary"
                        >
                          {line.product.title}
                        </Link>
                        <p className="mt-0.5 truncate text-xs text-muted-foreground">
                          by {line.makerName}
                        </p>
                      </div>
                      <button
                        type="button"
                        aria-label={`Remove ${line.product.title}`}
                        onClick={() =>
                          removeItem({ itemId: line.itemId }).catch(
                            (err: Error) => toast.error(err.message),
                          )
                        }
                        className="rounded-md p-1.5 text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive"
                      >
                        <Trash2 className="size-4" />
                      </button>
                    </div>
                    <div className="mt-auto flex items-center justify-between pt-2">
                      <div className="flex items-center rounded-full border border-border">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="size-7 rounded-full"
                          onClick={() =>
                            updateItem({
                              itemId: line.itemId,
                              quantity: line.quantity - 1,
                            }).catch((err: Error) => toast.error(err.message))
                          }
                        >
                          <Minus className="size-3" />
                        </Button>
                        <span className="w-7 text-center text-sm font-semibold">
                          {line.quantity}
                        </span>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="size-7 rounded-full"
                          disabled={line.quantity >= line.product.stock}
                          onClick={() =>
                            updateItem({
                              itemId: line.itemId,
                              quantity: line.quantity + 1,
                            }).catch((err: Error) => toast.error(err.message))
                          }
                        >
                          <Plus className="size-3" />
                        </Button>
                      </div>
                      <span className="font-display text-base font-semibold">
                        {formatPrice(line.lineTotal)}
                      </span>
                    </div>
                  </div>
                </li>
              ))}
            </ul>

            <aside className="h-fit rounded-xl border border-border/70 bg-card p-6 shadow-soft lg:sticky lg:top-24">
              <p className="font-display text-lg font-semibold tracking-tight">
                Order summary
              </p>
              <div className="mt-4 space-y-2.5 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Subtotal</span>
                  <span className="font-medium">{formatPrice(subtotal)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Shipping</span>
                  <span className="flex items-center gap-1 text-muted-foreground">
                    <Truck className="size-3.5" /> Set by each maker
                  </span>
                </div>
              </div>
              <Separator className="my-4" />
              <div className="flex justify-between font-display text-lg font-semibold">
                <span>Total</span>
                <span className="text-primary">{formatPrice(subtotal)}</span>
              </div>
              <Button
                size="lg"
                className="mt-5 h-12 w-full rounded-full text-base shadow-soft"
                onClick={() => setCheckoutOpen(true)}
              >
                Checkout <ArrowRight className="size-4" />
              </Button>
              <p className="mt-3 flex items-center justify-center gap-1.5 text-xs text-muted-foreground">
                <Hand className="size-3.5" />
                Every order ships straight from the studio
              </p>
            </aside>
          </div>
        )}
      </main>

      <Dialog open={checkoutOpen} onOpenChange={setCheckoutOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="font-display text-xl tracking-tight">
              Checkout
            </DialogTitle>
            <DialogDescription>
              {count} piece{count === 1 ? "" : "s"} · {formatPrice(subtotal)} —
              tell us where to send it.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="fullName">Recipient name</Label>
              <Input
                id="fullName"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="Alex Rivera"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="address">Shipping address</Label>
              <Textarea
                id="address"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder={"14 Cedar Lane\nAsheville, NC 28801"}
                rows={3}
              />
            </div>
          </div>
          <DialogFooter className="gap-2">
            <Button
              variant="ghost"
              onClick={() => setCheckoutOpen(false)}
              disabled={placing}
            >
              Cancel
            </Button>
            <Button
              onClick={handlePlaceOrder}
              disabled={placing || fullName.trim().length < 2 || address.trim().length < 8}
            >
              {placing && <Loader2 className="size-4 animate-spin" />}
              {placing ? "Placing order…" : `Place order · ${formatPrice(subtotal)}`}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      <SiteFooter />
    </div>
  );
}
