import { Heart, ShoppingBag, Store } from "lucide-react";
import { Link } from "react-router";
import { Separator } from "@/components/ui/separator";

export function SiteFooter() {
  return (
    <footer className="border-t border-border/70 bg-card">
      <div className="mx-auto w-full max-w-6xl px-4 py-12 sm:px-6">
        <div className="flex flex-col gap-10 md:flex-row md:justify-between">
          <div className="max-w-sm">
            <div className="flex items-center gap-2.5">
              <span className="flex size-9 items-center justify-center rounded-full bg-primary text-primary-foreground">
                <ShoppingBag className="size-4" />
              </span>
              <span className="font-display text-[17px] font-semibold tracking-tight">
                Handmade Direct
              </span>
            </div>
            <p className="mt-3 text-sm leading-6 text-muted-foreground">
              A marketplace with no middlemen. Every piece ships straight from
              the studio bench where it was made.
            </p>
          </div>
          <div className="grid grid-cols-2 gap-10 sm:grid-cols-3">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.14em] text-foreground">
                Shop
              </p>
              <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
                <li>
                  <Link to="/shop" className="hover:text-foreground">
                    Browse all
                  </Link>
                </li>
                <li>
                  <Link to="/shop" className="hover:text-foreground">
                    New arrivals
                  </Link>
                </li>
                <li>
                  <Link to="/favorites" className="hover:text-foreground">
                    Favorites
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.14em] text-foreground">
                Makers
              </p>
              <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
                <li>
                  <Link to="/studio" className="hover:text-foreground">
                    Open a studio
                  </Link>
                </li>
                <li>
                  <Link to="/dashboard" className="hover:text-foreground">
                    Home
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.14em] text-foreground">
                Account
              </p>
              <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
                <li>
                  <Link to="/orders" className="hover:text-foreground">
                    Orders
                  </Link>
                </li>
                <li>
                  <Link to="/cart" className="hover:text-foreground">
                    Bag
                  </Link>
                </li>
              </ul>
            </div>
          </div>
        </div>
        <Separator className="mt-10" />
        <div className="flex flex-col items-center justify-between gap-3 pt-6 text-xs text-muted-foreground sm:flex-row">
          <span>© {new Date().getFullYear()} Handmade Direct</span>
          <span className="flex items-center gap-1.5">
            <Store className="size-3.5" />
            Buy straight from the maker
            <Heart className="size-3.5 text-primary" />
          </span>
        </div>
      </div>
    </footer>
  );
}
