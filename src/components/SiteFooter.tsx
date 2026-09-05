import { useI18n } from "@/lib/i18n";
import { Heart, Store } from "lucide-react";
import { Link } from "react-router";
import { Separator } from "@/components/ui/separator";

export function SiteFooter() {
  const { t } = useI18n();
  return (
    <footer className="border-t border-border/70 bg-card">
      <div className="mx-auto w-full max-w-6xl px-4 py-12 sm:px-6">
        <div className="divider-blockprint mb-10 opacity-60" />
        <div className="flex flex-col gap-10 md:flex-row md:justify-between">
          <div className="max-w-sm">
            <div className="flex items-center gap-2.5">
              <span className="flex size-9 items-center justify-center rounded-full bg-primary font-display text-base font-bold text-primary-foreground">
                क
              </span>
              <span className="font-display text-[21px] font-semibold tracking-tight">
                कारी<span className="text-primary">gari</span>
              </span>
            </div>
            <p className="mt-3 text-sm leading-6 text-muted-foreground">
              {t("footer.blurb")}
            </p>
          </div>
          <div className="grid grid-cols-2 gap-10 sm:grid-cols-3">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.14em] text-foreground">
                {t("footer.shop")}
              </p>
              <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
                <li>
                  <Link to="/shop" className="hover:text-foreground">
                    {t("footer.browseAll")}
                  </Link>
                </li>
                <li>
                  <Link to="/shop" className="hover:text-foreground">
                    {t("footer.newArrivals")}
                  </Link>
                </li>
                <li>
                  <Link to="/favorites" className="hover:text-foreground">
                    {t("nav.favorites")}
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.14em] text-foreground">
                {t("footer.makers")}
              </p>
              <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
                <li>
                  <Link to="/studio" className="hover:text-foreground">
                    {t("footer.openStudio")}
                  </Link>
                </li>
                <li>
                  <Link to="/dashboard" className="hover:text-foreground">
                    {t("footer.home")}
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.14em] text-foreground">
                {t("footer.account")}
              </p>
              <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
                <li>
                  <Link to="/orders" className="hover:text-foreground">
                    {t("nav.orders")}
                  </Link>
                </li>
                <li>
                  <Link to="/cart" className="hover:text-foreground">
                    {t("nav.bag")}
                  </Link>
                </li>
              </ul>
            </div>
          </div>
        </div>
        <Separator className="mt-10" />
        <div className="flex flex-col items-center justify-between gap-3 pt-6 text-xs text-muted-foreground sm:flex-row">
          <span>
            © {new Date().getFullYear()} कारीgari
          </span>
          <span className="flex items-center gap-1.5">
            <Store className="size-3.5" />
            {t("footer.direct")}
            <Heart className="size-3.5 text-primary" />
          </span>
        </div>
      </div>
    </footer>
  );
}