import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useI18n } from "@/lib/i18n";
import { api } from "@/convex/_generated/api";
import { useQuery } from "convex/react";
import {
  Heart,
  Languages,
  LayoutDashboard,
  LogOut,
  Package,
  ShoppingBag,
  Store,
} from "lucide-react";
import { Link, useNavigate } from "react-router";

export function SiteHeader({ transparent = false }: { transparent?: boolean }) {
  const { isAuthenticated, user, signOut } = useAuth();
  const { lang, setLang, t } = useI18n();
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
      <div className="mx-auto flex h-16 w-full max-w-6xl items-center justify-between gap-3 px-4 sm:px-6">
        <Link to="/" className="group flex items-center gap-2.5">
          <span className="flex size-9 items-center justify-center rounded-full bg-primary font-display text-base font-bold text-primary-foreground shadow-soft transition-transform group-hover:-rotate-6">
            क
          </span>
          <span className="font-display text-[21px] font-semibold tracking-tight">
            कारी<span className="text-primary">gari</span>
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
            {t("nav.shop")}
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="text-sm font-medium"
            onClick={() => navigate("/studio")}
          >
            {t("nav.artisans")}
          </Button>
        </nav>

        <div className="flex items-center gap-1.5">
          <button
            type="button"
            aria-label={t("lang.label")}
            onClick={() => setLang(lang === "en" ? "hi" : "en")}
            className="flex items-center gap-1.5 rounded-full border border-border bg-card px-3 py-1.5 text-xs font-semibold text-muted-foreground shadow-soft transition-colors hover:text-foreground"
          >
            <Languages className="size-3.5" />
            {lang === "en" ? "हिंदी" : "EN"}
          </button>

          <Button
            variant="ghost"
            size="icon"
            aria-label={t("nav.bag")}
            className="relative"
            onClick={() => navigate("/cart")}
          >
            <ShoppingBag className="size-[18px]" />
            {cartCount > 0 && (
              <span className="absolute -right-0.5 -top-0.5 flex size-4 items-center justify-center rounded-full bg-primary text-[10px] font-semibold text-primary-foreground">
                {cartCount > 9 ? "9+" : cartCount}
              </span>
            )}
          </Button>

          {isAuthenticated ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm" className="gap-2">
                  <span className="flex size-5 items-center justify-center rounded-full bg-secondary text-[10px] font-semibold uppercase text-secondary-foreground">
                    {(user?.name || user?.email || "M").charAt(0).toUpperCase()}
                  </span>
                  <span className="hidden sm:inline">{t("nav.account")}</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel className="truncate text-xs text-muted-foreground">
                  {user?.name || user?.email || t("nav.account")}
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => navigate("/orders")}>
                  <Package className="size-4" /> {t("nav.orders")}
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => navigate("/favorites")}>
                  <Heart className="size-4" /> {t("nav.favorites")}
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => navigate("/studio")}>
                  <LayoutDashboard className="size-4" /> {t("nav.studio")}
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={handleSignOut}
                  className="text-destructive focus:text-destructive"
                >
                  <LogOut className="size-4" /> {t("nav.signOut")}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <Button size="sm" onClick={() => navigate("/auth")}>
              {t("nav.signIn")}
            </Button>
          )}
        </div>
      </div>
    </header>
  );
}