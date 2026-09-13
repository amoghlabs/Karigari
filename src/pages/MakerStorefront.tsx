import { Link, useParams } from "react-router";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { ProductCard, type ProductCardProduct } from "@/components/ProductCard";
import { Button } from "@/components/ui/button";
import { categoryName, useI18n } from "@/lib/i18n";
import type { Id } from "@/convex/_generated/dataModel";
import { MapPin, Package, Store } from "lucide-react";

type StorefrontMaker = ProductCardProduct & {
  products: ProductCardProduct[];
  shopName: string;
  artisanName?: string;
  location: string;
  craft: string;
  crafts?: string[];
  bio: string;
  story: string;
  image?: string;
  coverImage?: string;
};

export default function MakerStorefront() {
  const { id } = useParams<{ id: string }>();
  const { lang, t } = useI18n();

  const maker = useQuery(
    api.shop.getMaker,
    id ? { id: id as Id<"makers"> } : "skip",
  ) as StorefrontMaker | null | undefined;

  const makerCrafts = maker ? (maker.crafts ?? [maker.craft]) : [];

  return (
    <div className="flex min-h-screen flex-col bg-background bg-paper">
      <SiteHeader />
      <main className="flex-1">
        {maker === undefined && (
          <div className="mx-auto w-full max-w-6xl px-4 py-10 sm:px-6">
            <div className="aspect-[3/1] animate-pulse rounded-2xl bg-muted" />
            <div className="mt-6 h-8 w-64 animate-pulse rounded bg-muted" />
            <div className="mt-8 grid grid-cols-2 gap-6 lg:grid-cols-4">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="aspect-[4/5] animate-pulse rounded-xl bg-muted" />
              ))}
            </div>
          </div>
        )}

        {maker === null && (
          <div className="mx-auto flex w-full max-w-6xl flex-col items-center gap-3 px-4 py-24 text-center sm:px-6">
            <Store className="size-8 text-muted-foreground/60" />
            <p className="font-display text-lg font-semibold">{t("mf.notFound")}</p>
            <Button asChild size="sm">
              <Link to="/shop">{t("pd.gone.cta")}</Link>
            </Button>
          </div>
        )}

        {maker && (
          <>
            <section className="relative">
              <div className="h-52 w-full overflow-hidden sm:h-64">
                {maker.coverImage ? (
                  <img
                    src={maker.coverImage}
                    alt=""
                    className="size-full object-cover"
                  />
                ) : (
                  <div className="size-full bg-secondary" />
                )}
              </div>
              <div className="absolute inset-0 bg-gradient-to-t from-background/80 to-transparent" />
            </section>

            <div className="mx-auto w-full max-w-6xl px-4 sm:px-6">
              <div className="-mt-14 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
                <div className="flex items-end gap-4">
                  {maker.image ? (
                    <img
                      src={maker.image}
                      alt={maker.shopName}
                      className="size-20 rounded-2xl border-4 border-background object-cover shadow-soft-lg"
                    />
                  ) : (
                    <span className="flex size-20 items-center justify-center rounded-2xl border-4 border-background bg-primary font-display text-2xl font-semibold text-primary-foreground shadow-soft-lg">
                      {maker.shopName.charAt(0)}
                    </span>
                  )}
                  <div className="pb-1">
                    <h1 className="font-display text-3xl font-semibold tracking-tight">
                      {maker.shopName}
                    </h1>
                    {maker.artisanName && (
                      <p className="mt-0.5 text-sm font-medium text-foreground/80">
                        {t("mf.artisan")}: {maker.artisanName}
                      </p>
                    )}
                    <p className="mt-1 flex flex-wrap items-center gap-1.5 text-sm text-muted-foreground">
                      <MapPin className="size-3.5" />
                      {maker.location} · {makerCrafts.map((c) => categoryName(c, lang)).join(", ")}
                    </p>
                  </div>
                </div>
                <span className="flex items-center gap-1.5 self-start rounded-full border border-border bg-card px-4 py-1.5 text-xs font-medium text-muted-foreground shadow-soft sm:self-auto">
                  <Package className="size-3.5" />
                  {maker.products.length === 1
                    ? t("mf.onePiece")
                    : t("mf.pieces", { count: maker.products.length })}
                </span>
              </div>

              <div className="mt-8 grid gap-8 lg:grid-cols-[1fr_2fr]">
                <aside className="h-fit rounded-xl border border-border/70 bg-card p-6 shadow-soft lg:sticky lg:top-24">
                  <p className="text-xs font-semibold uppercase tracking-[0.14em] text-primary">
                    {t("mf.meet")}
                  </p>
                  <div className="mt-3 flex items-center gap-3">
                    {maker.image ? (
                      <img
                        src={maker.image}
                        alt={maker.shopName}
                        className="size-14 rounded-xl border border-border object-cover"
                      />
                    ) : (
                      <span className="flex size-14 items-center justify-center rounded-xl bg-primary/10 font-display text-lg font-semibold text-primary">
                        {maker.shopName.charAt(0)}
                      </span>
                    )}
                    <div className="min-w-0">
                      <p className="truncate font-display text-base font-semibold tracking-tight">
                        {maker.artisanName || maker.shopName}
                      </p>
                      {maker.artisanName && (
                        <p className="truncate text-xs font-medium text-muted-foreground">
                          {maker.shopName}
                        </p>
                      )}
                      <p className="mt-0.5 flex items-center gap-1 text-xs text-muted-foreground">
                        <MapPin className="size-3" />
                        {maker.location}
                      </p>
                    </div>
                  </div>
                  <p className="mt-3 text-sm leading-6 text-muted-foreground">
                    {maker.bio}
                  </p>
                  <div className="mt-3 flex flex-wrap gap-1.5">
                    {makerCrafts.map((c) => (
                      <span
                        key={c}
                        className="rounded-full border border-border bg-background px-2.5 py-1 text-[11px] font-medium text-muted-foreground"
                      >
                        {categoryName(c, lang)}
                      </span>
                    ))}
                  </div>

                  <div className="mt-5 border-t border-border/60 pt-5">
                    <p className="text-xs font-semibold uppercase tracking-[0.14em] text-primary">
                      {t("mf.craftStory")}
                    </p>
                    <p className="mt-2.5 border-l-2 border-primary/30 pl-4 text-sm italic leading-7 text-muted-foreground">
                      {maker.story}
                    </p>
                  </div>
                </aside>

                <div>
                  <h2 className="font-display text-xl font-semibold tracking-tight">
                    {t("mf.fromThisStudio")}
                  </h2>
                  {maker.products.length === 0 ? (
                    <p className="mt-6 rounded-xl border border-dashed border-border bg-card p-10 text-center text-sm text-muted-foreground">
                      {t("mf.empty")}
                    </p>
                  ) : (
                    <div className="mt-6 grid grid-cols-2 gap-4 sm:gap-6 xl:grid-cols-3">
                      {maker.products.map((product, i) => (
                        <ProductCard
                          key={product._id}
                          product={{ ...product, maker: null }}
                          index={i}
                        />
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </>
        )}
      </main>
      <SiteFooter />
    </div>
  );
}