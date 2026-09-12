import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { formatPrice } from "@/lib/format";
import { categoryName, useI18n } from "@/lib/i18n";
import { cn } from "@/lib/utils";
import { Heart, Plus } from "lucide-react";
import { motion } from "framer-motion";
import { Link } from "react-router";

export type ProductCardProduct = {
  _id: string;
  title: string;
  description: string;
  descriptionHi?: string;
  category: string;
  price: number;
  imageUrl: string;
  materials: string[];
  madeToOrder: boolean;
  stock: number;
  colors?: string[];
  dimensions?: string;
  tags?: string[];
  maker?: { _id: string; shopName: string; location?: string } | null;
};

type Props = {
  product: ProductCardProduct;
  favorited?: boolean;
  onToggleFavorite?: (productId: string) => void;
  onAddToCart?: (productId: string) => void;
  index?: number;
};

/** Product tile used across shop, landing, favorites. */
export function ProductCard({
  product,
  favorited,
  onToggleFavorite,
  onAddToCart,
  index = 0,
}: Props) {
  const { lang, t } = useI18n();
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, delay: Math.min(index * 0.04, 0.3) }}
    >
      <Card className="group h-full gap-0 overflow-hidden border-border/70 bg-card py-0 shadow-soft transition-shadow duration-300 hover:shadow-soft-lg">
        <div className="relative overflow-hidden">
          <Link to={`/product/${product._id}`} className="block">
            <img
              src={product.imageUrl}
              alt={product.title}
              loading="lazy"
              className="aspect-[4/5] w-full object-cover transition-transform duration-500 group-hover:scale-[1.05]"
            />
          </Link>
          {onAddToCart && product.stock > 0 && (
            <button
              type="button"
              onClick={() => onAddToCart(product._id)}
              className="absolute inset-x-3 bottom-3 hidden translate-y-2 items-center justify-center gap-1.5 rounded-full bg-background/95 py-2.5 text-sm font-semibold text-foreground opacity-0 shadow-soft backdrop-blur transition-all duration-300 hover:bg-primary hover:text-primary-foreground group-hover:translate-y-0 group-hover:opacity-100 sm:flex"
            >
              <Plus className="size-4" />
              {t("card.addToBag")}
            </button>
          )}
          {onToggleFavorite && (
            <button
              type="button"
              aria-label={
                favorited ? t("card.fav.remove") : t("card.fav.add")
              }
              onClick={(e) => {
                e.preventDefault();
                onToggleFavorite(product._id);
              }}
              className={cn(
                "absolute right-3 top-3 flex size-9 items-center justify-center rounded-full border border-border/60 bg-background/90 backdrop-blur transition-all hover:scale-110",
                favorited
                  ? "text-primary"
                  : "text-muted-foreground hover:text-foreground",
              )}
            >
              <Heart className={cn("size-4", favorited && "fill-current")} />
            </button>
          )}
          {product.madeToOrder && (
            <Badge className="absolute left-3 top-3 bg-background/90 text-foreground backdrop-blur">
              {t("card.madeToOrder")}
            </Badge>
          )}
        </div>
        <CardContent className="flex flex-1 flex-col gap-1.5 p-4">
          <p className="text-[11px] font-medium uppercase tracking-[0.14em] text-muted-foreground">
            {categoryName(product.category, lang)}
          </p>
          <Link
            to={`/product/${product._id}`}
            className="font-display text-[17px] font-semibold leading-snug tracking-tight hover:text-primary transition-colors"
          >
            {product.title}
          </Link>
          {product.maker && (
            <Link
              to={`/maker/${product.maker._id}`}
              className="w-fit text-xs text-muted-foreground underline-offset-2 hover:text-foreground hover:underline"
            >
              {t("card.by", { name: product.maker.shopName })}
            </Link>
          )}
          <div className="mt-auto flex items-center justify-between pt-2">
            <span className="font-display text-lg font-semibold">
              {formatPrice(product.price)}
            </span>
            {product.stock <= 3 && (
              <span className="text-xs font-medium text-primary">
                {product.stock === 0
                  ? t("card.soldOut")
                  : t("card.onlyLeft", { count: product.stock })}
              </span>
            )}
          </div>
          {onAddToCart && product.stock > 0 && (
            <Button
              size="sm"
              variant="outline"
              className="mt-2 w-full gap-1.5 rounded-full sm:hidden"
              onClick={() => onAddToCart(product._id)}
            >
              <Plus className="size-3.5" />
              {t("card.addToBag")}
            </Button>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
}