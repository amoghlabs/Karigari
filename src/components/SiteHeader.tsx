import { useAuth } from "@/hooks/use-auth";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { api } from "@/convex/_generated/api";
import { useQuery } from "convex/react";
import {
  Heart,
  LayoutDashboard,
  LogOut,
  Package,
  ShoppingBag,
  Store,
} from "lucide-react";
import { Link, useNavigate } from "react-router";

export function SiteHeader({ transparent = false }: { transparent?: boolean }) {
  const { isAuthenticated, user, signOut } = useAuth();
  const navigate = useNavigate();
  const cart = useQuery(api.cart.getCart, isAuthenticated ? {} : "skip");
  const cartCount = cart?.count ?? 0;

  const handleSignOut = async () => {
    await signOut();
    navigate("/");
  };

  return (
    <header
      className={
        transparent
          ? "absolute inset-x-0 top-0 z-40"
          : "sticky top-0 z-40 border-b border-border/70 bg-background/85 backdrop-blur-md"
      }
    >
      <div className="mx-auto flex h-16 w-full max-w-6xl items-center justify-between gap-4 px-4 sm:px-6">
        <Link to="/" className="group flex items-center gap-2.5">
          <span className="flex size-9 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-soft transition-transform group-hover:-rotate-6">
            <ShoppingBag className="size-4" />
          </span>
          <span className="flex flex-col leading-none">
            <span className="font-display text-[17px] font-semibold tracking-tight">
              Handmade Direct
            </span>
            <span className="text-[10px] font-medium uppercase tracking-[0.18em] text-muted-foreground">
              made with a voice
            </span>
          </span>
        </Link>

        <nav className="hidden items-center gap-1 md:flex">
          <Button
            variant="ghost"
            size="sm"
            className="text-sm font-medium"
            onClick={() => navigate("/shop")}
          >
            <Store className="size-4" />
            Shop
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="text-sm font-medium"
            onClick={() => navigate("/studio")}
          >
            For artisans
          </Button>
        </nav>

        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            aria-label="Your bag"
            className="relative"
            onClick={() => navigate("/cart")}
          >
            <ShoppingBag className="size-[18px]" />
            {cartCount > 0 && (
              <span className="absolute -right-0.5 -top-0.5 flex size-4.5 items-center justify-center rounded-full bg-primary text-[10px] font-semibold text-primary-foreground">
                {cartCount > 9 ? "9+" : cartCount}
              </span>
              <Badge className="hidden" />
            )}
          </Button>

          {isAuthenticated ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm" className="gap-2">
                  <span className="flex size-5 items-center justify-center rounded-full bg-secondary text-[10px] font-semibold uppercase text-secondary-foreground">
                    {(user?.name || user?.email || "M").charAt(0).toUpperCase()}
                  </span>
                  <span className="hidden sm:inline">Account</span>
                </Button>
              </DropdownMenuSiteHeaderGuard>
              <DropdownMenuContent align="end" className="w-52">
                <DropdownMenuLabel className="text-xs text-muted-foreground">
                  {user?.name || user?.email || "Signed in"}
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => navigate("/orders")}>
                  <Package className="size-4" /> Orders
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => navigate("/favorites")}>
                  <Heart className="size-4" /> Favorites
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => navigate("/studio")}>
                  <LayoutDashboard className="size-4" /> Artisan studio
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={handleSignOut}
                  className="text-destructive focus:text-destructive"
                >
                  <LogOut className="size-4" /> Sign out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <Button size="sm" onClick={() => navigate("/auth")}>
              Sign in
            </Button>
          )}
        </div>
      </div>
    </header>
  );
}
