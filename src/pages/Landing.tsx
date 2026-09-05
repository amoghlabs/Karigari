import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router";
import { useMutation, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { ProductCard, type ProductCardProduct } from "@/components/ProductCard";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/hooks/use-auth";
import { motion } from "framer-motion";
import {
  ArrowRight,
  Hand,
  Leaf,
  MapPin,
  Package,
  Sparkles,
  Store,
  Truck,
} from "lucide-react";

const fadeUp = {
  initial: { opacity: 0, y: 20 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: "-60px" },
};

function Hero() {
  const navigate = useNavigate();
  return (
    <section className="relative overflow-hidden">
      {/* Ambient editorial backdrop */}
      <div
        aria-hidden
        className="absolute inset-0 -z-10"
        style={{
          backgroundImage:
            "url(https://images.unsplash.com/photo-1459908676235-d5f02a50144b?w=1600&q=70)",
        }}
      />
      <div
        aria-hidden
        className="absolute inset-0 -z-10 bg-gradient-to-b from-background/70 via-background/85 to-background"
      />
      <div className="mx-auto flex w-full max-w-6xl flex-col items-center px-4 pb-20 pt-24 text-center sm:px-6 sm:pt-32">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <Badge
            variant="outline"
            className="gap-2 rounded-full border-border bg-card/80 px-4 py-1.5 text-xs font-medium backdrop-blur"
          >
            <Sparkles className="size-3.5 text-primary" />
            900+ independent studios · zero middlemen
          </Badge>
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.55, delay: 0.08 }}
          className="mt-6 max-w-3xl font-display text-4xl font-semibold leading-[1.08] tracking-tight sm:text-6xl"
        >
          Buy straight from
          <br />
          the <span className="text-primary italic">maker&apos;s bench</span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.55, delay: 0.16 }}
          className="mt-5 max-w-xl text-base leading-7 text-muted-foreground sm:text-lg"
        >
          Handmade Direct connects you directly with the ceramicists, weavers,
          and woodworkers behind the work — every piece ships from the studio
          that made it.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.55, delay: 0.24 }}
          className="mt-8 flex flex-col gap-3 sm:flex-row"
        >
          <Button
            size="lg"
            className="h-12 rounded-full px-7 text-base shadow-soft"
            onClick={() => navigate("/shop")}
          >
            Explore the marketplace
            <ArrowRight className="size-4" />
          </Button>
          <Button
            size="lg"
            variant="outline"
            className="h-12 rounded-full bg-card/70 px-7 text-base backdrop-blur"
            onClick={() => navigate("/studio")}
          >
            <Store className="size-4" />
            Sell your work
          </Button>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="mt-12 flex flex-wrap items-center justify-center gap-x-8 gap-y-3 text-xs font-medium text-muted-foreground"
        >
          <span className="flex items-center gap-2">
            <Truck className="size-4 text-primary" /> Studio-to-door shipping
          </span>
          <span className="flex items-center gap-2">
            <Leaf className="size-4 text-primary" /> Small-batch materials
          </span>
          <span className="flex items-center gap-2">
            <Hand className="size-4 text-primary" /> Made by a real person
          </span>
        </motion.div>
      </div>
    </section>
  );
}

function FeaturedProducts() {
  const products = useQuery(api.shop.listProducts, { limit: 8 }) as
    | (ProductCardProduct & { maker: { _id: string; shopName: string } | null })[]
    | undefined;

  return (
    <section className="mx-auto w-full max-w-6xl px-4 py-16 sm:px-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-primary">
            Fresh from the kiln
          </p>
          <h2 className="mt-2 font-display text-3xl font-semibold tracking-tight">
            This week&apos;s standouts
          </h2>
        </div>
        <Button asChild variant="ghost" className="gap-1.5 text-primary hover:text-primary">
          <Link to="/shop">
            View all pieces <ArrowRight className="size-4" />
          </Link>
        </Button>
      </div>

      <div className="mt-8 grid grid-cols-2 gap-4 sm:gap-6 lg:grid-cols-4">
        {(products ?? []).slice(0, 8).map((product, i) => (
          <ProductCard key={product._id} product={product} index={i} />
        ))}
        {products === undefined &&
          Array.from({ length: 4 }).map((_, i) => (
            <div
              key={i}
              className="aspect-[4/5] animate-pulse rounded-xl bg-muted"
            />
          ))}
      </div>
    </section>
  );
}

function Makers() {
  const makers = useQuery(api.shop.listFeaturedMakers);

  return (
    <section className="border-y border-border/70 bg-secondary/40">
      <div className="mx-auto w-full max-w-6xl px-4 py-16 sm:px-6">
        <div className="max-w-2xl">
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-primary">
            The studios
          </p>
          <h2 className="mt-2 font-display text-3xl font-semibold tracking-tight">
            Meet the people behind the pieces
          </h2>
          <p className="mt-3 text-sm leading-6 text-muted-foreground">
            No warehouses, no white-label resellers. Every studio is run by the
            maker who answers your questions and signs your package.
          </p>
        </div>

        <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {(makers ?? []).map((maker, i) => (
            <motion.div
              key={maker._id}
              {...fadeUp}
              transition={{ duration: 0.4, delay: i * 0.06 }}
            >
              <Link
                to={`/maker/${maker._id}`}
                className="group block overflow-hidden rounded-xl border border-border/70 bg-card shadow-soft transition-shadow hover:shadow-soft-lg"
              >
                <div className="aspect-[3/1.2] overflow-hidden">
                  {maker.coverImage ? (
                    <img
                      src={maker.coverImage}
                      alt={maker.shopName}
                      loading="lazy"
                      className="size-full object-cover transition-transform duration-500 group-hover:scale-[1.04]"
                    />
                  ) : (
                    <div className="size-full bg-secondary" />
                  )}
                </div>
                <div className="flex items-start gap-3 p-4">
                  {maker.image ? (
                    <img
                      src={maker.image}
                      alt=""
                      className="size-11 shrink-0 rounded-full border border-border object-cover"
                    />
                  ) : (
                    <div className="flex size-11 shrink-0 items-center justify-center rounded-full bg-primary/10 font-display text-base font-semibold text-primary">
                      {maker.shopName.charAt(0)}
                    </div>
                  )}
                  <div className="min-w-0">
                    <p className="truncate font-display text-base font-semibold tracking-tight">
                      {maker.shopName}
                    </p>
                    <p className="mt-0.5 flex items-center gap-1 text-xs text-muted-foreground">
                      <MapPin className="size-3" />
                      {maker.location} · {maker.craft}
                    </p>
                  </div>
                  <span className="ml-auto shrink-0 text-xs font-medium text-muted-foreground">
                    {maker.productCount} piece{maker.productCount === 1 ? "" : "s"}
                  </span>
                </div>
              </Link>
            </motion.div>
          ))}
          {makers === undefined &&
            Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="aspect-[3/2] animate-pulse rounded-xl bg-muted" />
            ))}
        </div>
      </div>
    </section>
  );
}

const STEPS = [
  {
    icon: Store,
    title: "Discover a studio",
    body: "Browse by craft — ceramics, textiles, woodwork, jewelry — and read the maker's story before you buy.",
  },
  {
    icon: Package,
    title: "Order the piece",
    body: "Many pieces are made to order, so your mug or board is made for you, not pulled from a shelf.",
  },
  {
    icon: Truck,
    title: "It ships from the bench",
    body: "Your package leaves the maker's own studio, wrapped by the hands that made it. No middlemen, ever.",
  },
];

function HowItWorks() {
  return (
    <section className="mx-auto w-full max-w-6xl px-4 py-16 sm:px-6">
      <div className="text-center">
        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-primary">
          How it works
        </p>
        <h2 className="mt-2 font-display text-3xl font-semibold tracking-tight">
          From studio bench to your doorstep
        </h2>
      </div>
      <div className="mt-10 grid gap-5 md:grid-cols-3">
        {STEPS.map((step, i) => (
          <motion.div
            key={step.title}
            {...fadeUp}
            transition={{ duration: 0.4, delay: i * 0.08 }}
            className="rounded-xl border border-border/70 bg-card p-6 shadow-soft"
          >
            <div className="flex size-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <step.icon className="size-5" />
            </div>
            <p className="mt-4 font-display text-base font-semibold tracking-tight">
              <span className="mr-2 text-muted-foreground/60">0{i + 1}</span>
              {step.title}
            </p>
            <p className="mt-2 text-sm leading-6 text-muted-foreground">
              {step.body}
            </p>
          </motion.div>
        ))}
      </div>
    </section>
  );
}

function ArtisanCta() {
  const navigate = useNavigate();
  return (
    <section className="mx-auto w-full max-w-6xl px-4 pb-20 sm:px-6">
      <motion.div
        {...fadeUp}
        transition={{ duration: 0.45 }}
        className="relative overflow-hidden rounded-2xl bg-primary px-6 py-14 text-center text-primary-foreground shadow-soft-lg sm:px-12"
      >
        <div
          aria-hidden
          className="absolute inset-0 opacity-20"
          style={{
            backgroundImage:
              "url(https://images.unsplash.com/photo-1452860606245-08befc0ff44b?w=1400&q=60)",
          }}
        />
        <div className="relative">
          <h2 className="mx-auto max-w-2xl font-display text-3xl font-semibold tracking-tight sm:text-4xl">
            Make things for a living, not a platform
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-sm leading-6 text-primary-foreground/85 sm:text-base">
            Keep 100% of your customer relationship. List your pieces, tell
            your story, and ship your work — Handmade Direct takes no cut of
            your order.
          </p>
          <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
            <Button
              size="lg"
              variant="secondary"
              className="h-12 rounded-full px-7 text-base"
              onClick={() => navigate("/studio")}
            >
              Open your studio
              <ArrowRight className="size-4" />
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="h-12 rounded-full border-primary-foreground/40 bg-transparent px-7 text-base text-primary-foreground hover:bg-primary-foreground/10 hover:text-primary-foreground"
              onClick={() => navigate("/shop")}
            >
              See what sells
            </Button>
          </div>
        </div>
      </motion.div>
    </section>
  );
}

function CommunityStrip() {
  return (
    <section className="border-t border-border/70 bg-card">
      <div className="mx-auto grid w-full max-w-6xl grid-cols-2 gap-6 px-4 py-12 text-center sm:px-6 md:grid-cols-4">
        {[
          { value: "900+", label: "Independent studios" },
          { value: "7", label: "Craft categories" },
          { value: "100%", label: "Sold by the maker" },
          { value: "0", label: "Middlemen" },
        ].map((stat) => (
          <div key={stat.label}>
            <p className="font-display text-3xl font-semibold tracking-tight text-primary">
              {stat.value}
            </p>
            <p className="mt-1 text-xs font-medium uppercase tracking-[0.12em] text-muted-foreground">
              {stat.label}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}

export default function Landing() {
  const { isAuthenticated } = useAuth();
  const ensureSeeded = useMutation(api.bootstrap.ensureSeeded);
  const [seeded, setSeeded] = useState(false);

  useEffect(() => {
    if (!isAuthenticated || seeded) return;
    setSeeded(true);
    ensureSeeded().catch(() => undefined);
  }, [isAuthenticated, seeded, ensureSeeded]);

  return (
    <div className="min-h-screen bg-background">
      <SiteHeader transparent />
      <main>
        <Hero />
        <FeaturedProducts />
        <Makers />
        <HowItWorks />
        <CommunityStrip />
        <ArtisanCta />
      </main>
      <SiteFooter />
    </div>
  );
}
