import { useState } from "react";
import { useMutation, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { PRODUCT_CATEGORIES } from "@/lib/categories";
import { formatPrice } from "@/lib/format";
import {
  Eye,
  HeartHandshake,
  Loader2,
  MapPin,
  Package,
  Pencil,
  Plus,
  Settings2,
  Sparkles,
  Store,
} from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import type { Id } from "@/convex/_generated/dataModel";

type Maker = {
  _id: string;
  shopName: string;
  bio: string;
  location: string;
  craft: string;
  story: string;
};

type Listing = {
  _id: string;
  title: string;
  description: string;
  category: string;
  price: number;
  imageUrl: string;
  materials: string[];
  madeToOrder: boolean;
  stock: number;
  isActive: boolean;
};

/* ---------- Studio onboarding ---------- */

function Onboarding() {
  const createMaker = useMutation(api.studio.createMaker);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    shopName: "",
    craft: "Ceramics",
    location: "",
    bio: "",
    story: "",
  });

  const set = (key: keyof typeof form) => (value: string) =>
    setForm((f) => ({ ...f, [key]: value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await createMaker(form);
      toast.success("Your studio is live!");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="mx-auto w-full max-w-2xl">
      <div className="text-center">
        <span className="mx-auto flex size-12 items-center justify-center rounded-full bg-primary/10 text-primary">
          <Sparkles className="size-5" />
        </span>
        <h1 className="mt-4 font-display text-3xl font-semibold tracking-tight">
          Open your studio
        </h1>
        <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-muted-foreground">
          Tell buyers who you are and what you make. Your story is what sells
          handmade work — platforms can&apos;t fake it.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="mt-8 space-y-5 rounded-xl border border-border/70 bg-card p-6 shadow-soft sm:p-8">
        <div className="space-y-2">
          <Label htmlFor="shopName">Shop name</Label>
          <Input
            id="shopName"
            value={form.shopName}
            onChange={(e) => set("shopName")(e.target.value)}
            placeholder="Kiln & Ember"
            required
          />
        </div>
        <div className="grid gap-5 sm:grid-cols-2">
          <div className="space-y-2">
            <Label>Primary craft</Label>
            <Select value={form.craft} onValueChange={set("craft")}>
              <SelectTrigger className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {PRODUCT_CATEGORIES.map((c) => (
                  <SelectItem key={c} value={c}>
                    {c}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="location">Location</Label>
            <Input
              id="location"
              value={form.location}
              onChange={(e) => set("location")(e.target.value)}
              placeholder="Asheville, NC"
            />
          </div>
        </div>
        <div className="space-y-2">
          <Label htmlFor="bio">Short bio</Label>
          <Textarea
            id="bio"
            value={form.bio}
            onChange={(e) => set("bio")(e.target.value)}
            placeholder="Wheel-thrown stoneware fired in a wood kiln in the hills outside Asheville."
            rows={2}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="story">Your story</Label>
          <Textarea
            id="story"
            value={form.story}
            onChange={(e) => set("story")(e.target.value)}
            placeholder="Why do you make what you make? Buyers fall in love with the person, not the product."
            rows={4}
          />
        </div>
        <Button
          type="submit"
          size="lg"
          className="h-12 w-full rounded-full text-base shadow-soft"
          disabled={saving || form.shopName.trim().length < 2}
        >
          {saving && <Loader2 className="size-4 animate-spin" />}
          {saving ? "Setting up…" : "Launch my studio"}
        </Button>
      </form>
    </div>
  );
}

/* ---------- Listing create / edit dialog ---------- */

type ListingDialogState =
  | { mode: "closed" }
  | { mode: "create" }
  | { mode: "edit"; listing: Listing };

function ListingDialog({
  state,
  onClose,
}: {
  state: ListingDialogState;
  onClose: () => void;
}) {
  const createProduct = useMutation(api.studio.createProduct);
  const updateProduct = useMutation(api.studio.updateProduct);
  const [saving, setSaving] = useState(false);
  const isEdit = state.mode === "edit";
  const listing = state.mode === "edit" ? state.listing : null;

  const [form, setForm] = useState(() => ({
    title: listing?.title ?? "",
    description: listing?.description ?? "",
    category: listing?.category ?? "Ceramics",
    price: listing?.price?.toString() ?? "",
    imageUrl: listing?.imageUrl ?? "",
    materials: listing?.materials.join(", ") ?? "",
    madeToOrder: listing?.madeToOrder ?? true,
    stock: listing?.stock?.toString() ?? "1",
    isActive: listing?.isActive ?? true,
  }));

  const set = <K extends keyof typeof form>(key: K, value: (typeof form)[K]) =>
    setForm((f) => ({ ...f, [key]: value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const payload = {
        title: form.title,
        description: form.description,
        category: form.category as (typeof PRODUCT_CATEGORIES)[number],
        price: Number(form.price) || 0,
        imageUrl: form.imageUrl,
        materials: form.materials.split(",").map((m) => m.trim()),
        madeToOrder: form.madeToOrder,
        stock: Number(form.stock) || 0,
      };
      if (isEdit && listing) {
        await updateProduct({
          productId: listing._id as Id<"products">,
          ...payload,
          isActive: form.isActive,
        });
        toast.success("Listing updated");
      } else {
        await createProduct(payload);
        toast.success("Listing published");
      }
      onClose();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="font-display text-xl tracking-tight">
            {isEdit ? "Edit listing" : "New listing"}
          </DialogTitle>
          <DialogDescription>
            {isEdit
              ? "Update the details of this piece."
              : "Describe the piece so buyers know exactly what they're getting."}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">Piece name</Label>
            <Input
              id="title"
              value={form.title}
              onChange={(e) => set("title", e.target.value)}
              placeholder="Ember Speckled Mug"
              required
            />
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label>Category</Label>
              <Select value={form.category} onValueChange={(v) => set("category", v)}>
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {PRODUCT_CATEGORIES.map((c) => (
                    <SelectItem key={c} value={c}>
                      {c}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="price">Price (USD)</Label>
              <Input
                id="price"
                type="number"
                min="0.5"
                step="0.01"
                value={form.price}
                onChange={(e) => set("price", e.target.value)}
                placeholder="42"
                required
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="imageUrl">Image URL</Label>
            <Input
              id="imageUrl"
              value={form.imageUrl}
              onChange={(e) => set("imageUrl", e.target.value)}
              placeholder="https://images.unsplash.com/…"
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="materials">Materials (comma-separated)</Label>
            <Input
              id="materials"
              value={form.materials}
              onChange={(e) => set("materials", e.target.value)}
              placeholder="Stoneware clay, Wood-ash glaze"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={form.description}
              onChange={(e) => set("description", e.target.value)}
              placeholder="What is it, how is it made, how is it used?"
              rows={3}
            />
          </div>
          <div className="flex flex-wrap items-center gap-x-6 gap-y-3">
            <div className="flex items-center gap-2">
              <Switch
                id="madeToOrder"
                checked={form.madeToOrder}
                onCheckedChange={(v) => set("madeToOrder", v)}
              />
              <Label htmlFor="madeToOrder" className="text-sm font-normal">
                Made to order
              </Label>
            </div>
            {isEdit && (
              <div className="flex items-center gap-2">
                <Switch
                  id="isActive"
                  checked={form.isActive}
                  onCheckedChange={(v) => set("isActive", v)}
                />
                <Label htmlFor="isActive" className="text-sm font-normal">
                  Listed publicly
                </Label>
              </div>
            )}
            <div className="ml-auto flex items-center gap-2">
              <Label htmlFor="stock" className="text-sm font-normal">
                Stock
              </Label>
              <Input
                id="stock"
                type="number"
                min="0"
                className="w-20"
                value={form.stock}
                onChange={(e) => set("stock", e.target.value)}
              />
            </div>
          </div>
          <DialogFooter className="gap-2">
            <Button type="button" variant="ghost" onClick={onClose} disabled={saving}>
              Cancel
            </Button>
            <Button type="submit" disabled={saving}>
              {saving && <Loader2 className="size-4 animate-spin" />}
              {isEdit ? "Save changes" : "Publish listing"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

/* ---------- Main studio view ---------- */

export default function Studio() {
  const studio = useQuery(api.studio.myListings);
  const sales = useQuery(api.studio.mySales);
  const retireProduct = useMutation(api.studio.retireProduct);
  const [dialog, setDialog] = useState<ListingDialogState>({ mode: "closed" });
  const [settingsOpen, setSettingsOpen] = useState(false);

  if (studio === undefined) {
    return (
      <div className="flex min-h-screen flex-col bg-background">
        <SiteHeader />
        <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-10 sm:px-6">
          <div className="h-8 w-56 animate-pulse rounded bg-muted" />
          <div className="mt-8 h-64 animate-pulse rounded-xl bg-muted" />
        </main>
      </div>
    );
  }

  if (studio === null) {
    return (
      <div className="flex min-h-screen flex-col bg-background">
        <SiteHeader />
        <main className="flex-1 px-4 py-14 sm:px-6">
          <Onboarding />
        </main>
        <SiteFooter />
      </div>
    );
  }

  const maker = studio.maker;
  const listings = studio.products;
  const activeCount = listings.filter((l) => l.isActive).length;
  const totalRevenue = (sales ?? [])
    .filter((s) => s.order)
    .reduce((sum, s) => sum + s.price * s.quantity, 0);
  const unitsSold = (sales ?? []).reduce((sum, s) => sum + s.quantity, 0);

  const handleRetire = (listingId: string) => {
    retireProduct({ productId: listingId as Id<"products"> })
      .then(() => toast.success("Listing retired"))
      .catch((err: Error) => toast.error(err.message));
  };

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <SiteHeader />
      <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-10 sm:px-6">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-primary">
              Artisan studio
            </p>
            <h1 className="mt-1.5 font-display text-3xl font-semibold tracking-tight">
              {maker.shopName}
            </h1>
            <p className="mt-1 flex items-center gap-1.5 text-sm text-muted-foreground">
              <MapPin className="size-3.5" />
              {maker.location} · {maker.craft}
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={() => setSettingsOpen(true)}>
              <Settings2 className="size-4" /> Studio profile
            </Button>
            <Button
              size="sm"
              className="shadow-soft"
              onClick={() => setDialog({ mode: "create" })}
            >
              <Plus className="size-4" /> New listing
            </Button>
          </div>
        </div>

        {/* Stats */}
        <div className="mt-8 grid grid-cols-2 gap-4 md:grid-cols-4">
          {[
            { label: "Active listings", value: String(activeCount), icon: Store },
            { label: "Total listings", value: String(listings.length), icon: Package },
            { label: "Units sold", value: String(unitsSold), icon: HeartHandshake },
            { label: "Revenue", value: formatPrice(totalRevenue), icon: Eye },
          ].map((stat) => (
            <div
              key={stat.label}
              className="rounded-xl border border-border/70 bg-card p-4 shadow-soft"
            >
              <span className="flex size-8 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <stat.icon className="size-4" />
              </span>
              <p className="mt-3 font-display text-xl font-semibold tracking-tight">
                {stat.value}
              </p>
              <p className="text-xs font-medium uppercase tracking-[0.1em] text-muted-foreground">
                {stat.label}
              </p>
            </div>
          ))}
        </div>

        {/* Listings */}
        <div className="mt-10 flex items-end justify-between">
          <h2 className="font-display text-xl font-semibold tracking-tight">
            Your listings
          </h2>
        </div>

        {listings.length === 0 ? (
          <div className="mt-6 flex flex-col items-center gap-4 rounded-xl border border-dashed border-border bg-card py-16 text-center">
            <span className="flex size-14 items-center justify-center rounded-full bg-secondary">
              <Package className="size-6 text-muted-foreground" />
            </span>
            <div>
              <p className="font-display text-lg font-semibold">
                No listings yet
              </p>
              <p className="mt-1 max-w-sm text-sm text-muted-foreground">
                Publish your first piece — buyers can&apos;t find you until you
                do.
              </p>
            </div>
            <Button onClick={() => setDialog({ mode: "create" })} className="rounded-full">
              <Plus className="size-4" /> Create a listing
            </Button>
          </div>
        ) : (
          <div className="mt-6 space-y-3">
            {listings.map((listing) => (
              <div
                key={listing._id}
                className="flex items-center gap-4 rounded-xl border border-border/70 bg-card p-4 shadow-soft"
              >
                <img
                  src={listing.imageUrl}
                  alt={listing.title}
                  className="size-16 shrink-0 rounded-lg object-cover"
                />
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="truncate font-display text-base font-semibold tracking-tight">
                      {listing.title}
                    </p>
                    <Badge
                      variant="secondary"
                      className={cn(
                        "rounded-full font-normal",
                        listing.isActive
                          ? "text-foreground"
                          : "text-muted-foreground",
                      )}
                    >
                      {listing.isActive ? "Live" : "Retired"}
                    </Badge>
                    {listing.madeToOrder && (
                      <Badge variant="outline" className="rounded-full font-normal text-muted-foreground">
                        Made to order
                      </Badge>
                    )}
                  </div>
                  <p className="mt-1 text-xs text-muted-foreground">
                    {listing.category} · Stock {listing.stock}
                  </p>
                </div>
                <span className="hidden font-display text-base font-semibold sm:block">
                  {formatPrice(listing.price)}
                </span>
                <div className="flex gap-1">
                  <Button
                    variant="ghost"
                    size="icon"
                    aria-label={`Edit ${listing.title}`}
                    onClick={() => setDialog({ mode: "edit", listing })}
                  >
                    <Pencil className="size-4" />
                  </Button>
                  {listing.isActive && (
                    <Button
                      variant="ghost"
                      size="icon"
                      aria-label={`Retire ${listing.title}`}
                      className="text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
                      onClick={() => handleRetire(listing._id)}
                    >
                      <Package className="size-4" />
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Sales */}
        <h2 className="mt-10 font-display text-xl font-semibold tracking-tight">
          Recent sales
        </h2>
        {(sales ?? []).length === 0 ? (
          <p className="mt-4 rounded-xl border border-dashed border-border bg-card p-8 text-center text-sm text-muted-foreground">
            No sales yet — share your studio link and the orders will land here.
          </p>
        ) : (
          <div className="mt-4 space-y-2.5">
            {(sales ?? [])
              .filter((s) => s.order)
              .map((sale) => (
                <div
                  key={sale._id}
                  className="flex items-center gap-4 rounded-xl border border-border/70 bg-card p-4"
                >
                  <img
                    src={sale.productImage}
                    alt={sale.productTitle}
                    className="size-11 shrink-0 rounded-lg object-cover"
                  />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium">
                      {sale.productTitle}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Qty {sale.quantity} · {sale.order?.fullName} ·{" "}
                      {sale.order?.status}
                    </p>
                  </div>
                  <span className="text-sm font-semibold text-primary">
                    +{formatPrice(sale.price * sale.quantity)}
                  </span>
                </div>
              ))}
          </div>
        )}
      </main>

      {dialog.mode !== "closed" && (
        <ListingDialog
          state={dialog}
          onClose={() => setDialog({ mode: "closed" })}
        />
      )}

      <StudioSettings open={settingsOpen} onClose={() => setSettingsOpen(false)} maker={maker} />
      <SiteFooter />
    </div>
  );
}

/* ---------- Studio profile settings ---------- */

function StudioSettings({
  open,
  onClose,
  maker,
}: {
  open: boolean;
  onClose: () => void;
  maker: Maker;
}) {
  const updateMaker = useMutation(api.studio.updateMaker);
  const makerId = maker._id as Id<"makers">;
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    shopName: maker.shopName,
    craft: maker.craft,
    location: maker.location,
    bio: maker.bio,
    story: maker.story,
  });

  const handleSubmit = async () => {
    setSaving(true);
    try {
      await updateMaker({ makerId, ...form });
      toast.success("Studio profile updated");
      onClose();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="font-display text-xl tracking-tight">
            Studio profile
          </DialogTitle>
          <DialogDescription>
            This is what buyers see on your storefront.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="editShopName">Shop name</Label>
            <Input
              id="editShopName"
              value={form.shopName}
              onChange={(e) => setForm((f) => ({ ...f, shopName: e.target.value }))}
            />
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label>Primary craft</Label>
              <Select
                value={form.craft}
                onValueChange={(v) => setForm((f) => ({ ...f, craft: v }))}
              >
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {PRODUCT_CATEGORIES.map((c) => (
                    <SelectItem key={c} value={c}>
                      {c}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="editLocation">Location</Label>
              <Input
                id="editLocation"
                value={form.location}
                onChange={(e) => setForm((f) => ({ ...f, location: e.target.value }))}
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="editBio">Short bio</Label>
            <Textarea
              id="editBio"
              rows={2}
              value={form.bio}
              onChange={(e) => setForm((f) => ({ ...f, bio: e.target.value }))}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="editStory">Your story</Label>
            <Textarea
              id="editStory"
              rows={4}
              value={form.story}
              onChange={(e) => setForm((f) => ({ ...f, story: e.target.value }))}
            />
          </div>
        </div>
        <DialogFooter className="gap-2">
          <Button variant="ghost" onClick={onClose} disabled={saving}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={saving || form.shopName.trim().length < 2}>
            {saving && <Loader2 className="size-4 animate-spin" />}
            Save changes
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
