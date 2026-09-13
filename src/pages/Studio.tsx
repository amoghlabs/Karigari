import { useRef, useState } from "react";
import { useAction, useMutation, useQuery } from "convex/react";
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
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from "@/components/ui/input-otp";
import { PRODUCT_CATEGORIES, CATEGORY_ICON } from "@/lib/categories";
import { categoryName, useI18n, type Lang } from "@/lib/i18n";
import { formatPrice } from "@/lib/format";
import { useAuth } from "@/hooks/use-auth";
import { useSpeechRecognition } from "@/hooks/use-speech";
import { analyzePhotoFile, enhancePhotoFile, type MeasuredPhoto } from "@/lib/photoAnalysis";
import {
  SELL_AI_STEPS,
  SellWithAiBadge,
  SellWithAiStatus,
  SellWithAiTracker,
  type SellStepKey,
  type SellStepState,
} from "@/components/SellWithAi";
import {
  ArrowLeft,
  ArrowRight,
  Camera,
  Check,
  CheckCircle2,
  Eye,
  Hammer,
  HeartHandshake,
  IndianRupee,
  Loader2,
  MapPin,
  Mic,
  Package,
  Pencil,
  Phone,
  Settings2,
  Sparkles,
  Store,
  Trash2,
  Wand2,
} from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import type { Id } from "@/convex/_generated/dataModel";

type Maker = {
  _id: string;
  shopName: string;
  artisanName?: string;
  bio: string;
  location: string;
  craft: string;
  crafts?: string[];
  story: string;
  image?: string;
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
  colors?: string[];
  dimensions?: string;
  tags?: string[];
};

/** Small pause so each step of the Sell with AI pipeline is visible. */
const sleep = (ms: number) =>
  new Promise<void>((resolve) => window.setTimeout(resolve, ms));

/* ------------------------------------------------------------------ */
/* Photo upload via Convex storage                                     */
/* ------------------------------------------------------------------ */

async function uploadPhoto(
  uploadUrl: string,
  file: File,
): Promise<Id<"_storage">> {
  const res = await fetch(uploadUrl, {
    method: "POST",
    headers: { "Content-Type": file.type },
    body: file,
  });
  if (!res.ok) throw new Error("Photo upload failed");
  const data = (await res.json()) as { storageId: string };
  return data.storageId as Id<"_storage">;
}

function usePhoto() {
  const getUploadUrl = useMutation(api.studio.getUploadUrl);
  const [uploading, setUploading] = useState(false);
  const [storageId, setStorageId] = useState<Id<"_storage"> | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [measured, setMeasured] = useState<MeasuredPhoto | null>(null);
  const [enhancing, setEnhancing] = useState(false);
  const [enhanced, setEnhanced] = useState(false);
  const inputRef = useRef<HTMLInputElement | null>(null);
  const fileRef = useRef<File | null>(null);
  const enhancedFileRef = useRef<File | null>(null);

  const uploadAsStorage = async (file: File) => {
    const url = await getUploadUrl();
    const id = await uploadPhoto(url, file);
    setStorageId(id);
  };

  const pick = async (file: File | undefined) => {
    if (!file) return;
    setUploading(true);
    try {
      // Measure the REAL pixels first — Smart Cataloguing consumes this.
      const analysis = await analyzePhotoFile(file);
      fileRef.current = file;
      enhancedFileRef.current = null;
      setMeasured(analysis);
      setEnhanced(false);
      setPreview(URL.createObjectURL(file));
      await uploadAsStorage(file);
      toast.success("Photo ready");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Upload failed.");
    } finally {
      setUploading(false);
    }
  };

  /** Photo Enhancer: auto-exposure + gentle contrast + vibrance + white-balance
   * guard on the actual pixels, then re-uploads the improved photo. */
  const enhance = async (): Promise<MeasuredPhoto | null> => {
    const file = enhancedFileRef.current ?? fileRef.current;
    if (!file) return null;
    setEnhancing(true);
    try {
      const { objectUrl, enhancedFile } = await enhancePhotoFile(
        file,
        measured?.brightness ?? 50,
      );
      enhancedFileRef.current = enhancedFile;
      setPreview(objectUrl);
      setEnhanced(true);
      const analysis = await analyzePhotoFile(enhancedFile);
      setMeasured(analysis);
      await uploadAsStorage(enhancedFile);
      toast.success("Photo enhanced");
      return analysis;
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Enhance failed.");
      return null;
    } finally {
      setEnhancing(false);
    }
  };

  const reset = () => {
    setStorageId(null);
    setPreview(null);
    setMeasured(null);
    setEnhanced(false);
    fileRef.current = null;
    enhancedFileRef.current = null;
  };

  return {
    uploading,
    storageId,
    preview,
    inputRef,
    pick,
    reset,
    measured,
    enhance,
    enhancing,
    enhanced,
  };
}

/* ------------------------------------------------------------------ */
/* Phone + OTP gate — the artisan's only sign-in path                  */
/* ------------------------------------------------------------------ */

function PhoneGate({ reason }: { reason: string }) {
  const { signIn, isAuthenticated, isLoading: authLoading } = useAuth();
  const { t } = useI18n();
  const requestPhoneOtp = useMutation(api.phoneOtp.requestPhoneOtp);
  const verifyPhoneOtp = useMutation(api.phoneOtp.verifyPhoneOtp);
  const [stage, setStage] = useState<"phone" | "code">("phone");
  const [phone, setPhone] = useState("");
  const [normalizedPhone, setNormalizedPhone] = useState("");
  const [otp, setOtp] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSendCode = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsLoading(true);
    setError(null);
    try {
      // Keep an existing session — signing in anonymously again would start a
      // brand-new account and detach this artisan from their studio, listings
      // and orders. A session is only created when there is none at all.
      if (!isAuthenticated) {
        try {
          await signIn("anonymous");
        } catch {
          /* session already exists */
        }
      }
      const result = await requestPhoneOtp({ phone });
      setNormalizedPhone(result.phone);
      setStage("code");
      setOtp("");
      toast.info(t("st.phone.demo", { code: result.devCode }));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerify = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsLoading(true);
    setError(null);
    try {
      await verifyPhoneOtp({ phone: normalizedPhone, code: otp });
      toast.success(t("st.phone.verified"));
    } catch (err) {
      console.error("OTP verification error:", err);
      setError(t("st.otp.wrong"));
      setOtp("");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="mx-auto w-full max-w-md">
      <div className="text-center">
        <span className="mx-auto flex size-12 items-center justify-center rounded-full bg-primary/10 text-primary">
          <Phone className="size-5" />
        </span>
        <h1 className="mt-4 font-display text-2xl font-semibold tracking-tight">
          {t("st.phone.title")}
        </h1>
        <p className="mt-2 text-sm leading-6 text-muted-foreground">{reason}</p>
      </div>

      {stage === "phone" ? (
        <form onSubmit={handleSendCode} className="mt-6 space-y-3 rounded-2xl border border-border/70 bg-card p-6 shadow-soft">
          <div className="relative">
            <Phone className="absolute left-4 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              type="tel"
              inputMode="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder={t("st.phone.placeholder")}
              className="tap-lg rounded-full pl-11 text-base"
              disabled={isLoading}
              required
            />
          </div>
          {error && <p className="text-sm text-destructive">{error}</p>}
          <Button
            type="submit"
            size="lg"
            className="tap-lg w-full rounded-full text-base"
            disabled={isLoading || authLoading}
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 size-4 animate-spin" />
                {t("st.phone.sending")}
              </>
            ) : (
              <>
                {t("st.phone.send")}
                <ArrowRight className="ml-2 size-4" />
              </>
            )}
          </Button>
        </form>
      ) : (
        <form onSubmit={handleVerify} className="mt-6 space-y-3 rounded-2xl border border-border/70 bg-card p-6 shadow-soft">
          <p className="text-center text-sm text-muted-foreground">
            {t("st.otp.sub", { phone: normalizedPhone })}
          </p>
          <div className="flex justify-center">
            <InputOTP
              value={otp}
              onChange={setOtp}
              maxLength={6}
              disabled={isLoading}
            >
              <InputOTPGroup>
                {Array.from({ length: 6 }).map((_, i) => (
                  <InputOTPSlot key={i} index={i} />
                ))}
              </InputOTPGroup>
            </InputOTP>
          </div>
          {error && <p className="text-center text-sm text-destructive">{error}</p>}
          <Button type="submit" size="lg" className="tap-lg w-full rounded-full text-base" disabled={isLoading || otp.length !== 6}>
            {isLoading ? (
              <>
                <Loader2 className="mr-2 size-4 animate-spin" />
                {t("st.otp.verifying")}
              </>
            ) : (
              <>
                {t("st.otp.verify")}
                <ArrowRight className="ml-2 size-4" />
              </>
            )}
          </Button>
          <p className="text-center text-sm text-muted-foreground">
            {t("st.otp.resend")}{" "}
            <Button
              type="button"
              variant="link"
              className="h-auto p-0"
              onClick={() => setStage("phone")}
            >
              {t("st.otp.tryAgain")}
            </Button>
          </p>
        </form>
      )}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Onboarding — name → craft (tap) → voice story → AI → review         */
/* ------------------------------------------------------------------ */

function Onboarding() {
  const { lang, t } = useI18n();
  const createMaker = useMutation(api.studio.createMaker);
  const generateStory = useAction(api.aiStory.generateStory);
  const speech = useSpeechRecognition(lang);
  const photo = usePhoto();

  const [step, setStep] = useState(1);
  const [name, setName] = useState("");
  const [crafts, setCrafts] = useState<string[]>([]); // multi-select: one artisan, many crafts
  const [generating, setGenerating] = useState(false);
  const [generated, setGenerated] = useState<null | {
    story: string;
    bio: string;
    shopName: string;
  }>(null);
  const [saving, setSaving] = useState(false);
  const [typedNote, setTypedNote] = useState("");

  const voiceNote = speech.transcript || typedNote;

  const handleGenerate = async () => {
    if (crafts.length === 0) return;
    setGenerating(true);
    try {
      const result = await generateStory({
        craft: crafts[0],
        name,
        voiceNote: voiceNote || undefined,
      });
      setGenerated({
        story: lang === "hi" ? result.storyHi : result.story,
        bio: lang === "hi" ? result.bioHi : result.bio,
        shopName: lang === "hi" ? result.shopNameHi : result.shopName,
      });
      setStep(4);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Generation failed.");
    } finally {
      setGenerating(false);
    }
  };

  const handleLaunch = async () => {
    if (crafts.length === 0 || !generated) return;
    setSaving(true);
    try {
      await createMaker({
        shopName: generated.shopName,
        artisanName: name,
        craft: crafts[0],
        crafts,
        location: locationInput || "",
        bio: generated.bio,
        story: generated.story,
        imageStorageId: photo.storageId ?? undefined,
      });
      toast.success(t("ob.launched"));
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setSaving(false);
    }
  };

  const [locationInput, setLocationInput] = useState("");

  const progress = `${step} / 3`;

  return (
    <div className="mx-auto w-full max-w-2xl">
      <div className="flex items-center justify-between">
        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-primary">
          {progress}
        </p>
        <div className="flex gap-1.5">
          {[1, 2, 3].map((i) => (
            <span
              key={i}
              className={cn(
                "h-1.5 rounded-full transition-all",
                i <= Math.min(step, 3) ? "w-6 bg-primary" : "w-3 bg-border",
              )}
            />
          ))}
        </div>
      </div>

      {/* Step 1 — name */}
      {step === 1 && (
        <div className="mt-8 rounded-2xl border border-border/70 bg-card p-6 shadow-soft sm:p-8">
          <h1 className="font-display text-3xl font-semibold tracking-tight">
            {t("ob.name.title")}
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">{t("ob.name.sub")}</p>
          <Input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder={t("ob.name.placeholder")}
            className="tap-lg mt-6 rounded-full text-base"
            autoFocus
          />
          <Button
            size="lg"
            className="tap-lg mt-4 w-full rounded-full text-base"
            disabled={name.trim().length < 2}
            onClick={() => setStep(2)}
          >
            {t("ob.next")} <ArrowRight className="ml-2 size-4" />
          </Button>
        </div>
      )}

      {/* Step 2 — craft tap grid (multi-select: one artisan, many crafts) */}
      {step === 2 && (
        <div className="mt-8">
          <h1 className="font-display text-3xl font-semibold tracking-tight">
            {t("ob.craft.title")}
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">{t("ob.craft.subMulti")}</p>
          <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3">
            {PRODUCT_CATEGORIES.map((c) => (
              <button
                key={c}
                type="button"
                aria-pressed={crafts.includes(c)}
                onClick={() =>
                  setCrafts((prev) =>
                    prev.includes(c) ? prev.filter((x) => x !== c) : [...prev, c],
                  )
                }
                className={cn(
                  "tap-lg relative flex flex-col items-center gap-2 rounded-2xl border p-5 text-center shadow-soft transition-all hover:-translate-y-0.5",
                  crafts.includes(c)
                    ? "border-primary bg-primary/10 text-foreground"
                    : "border-border/70 bg-card hover:border-primary/40",
                )}
              >
                {crafts.includes(c) && (
                  <span className="absolute right-2 top-2 flex size-5 items-center justify-center rounded-full bg-primary text-primary-foreground">
                    <Check className="size-3.5" />
                  </span>
                )}
                <span className="text-3xl">{CATEGORY_ICON[c] ?? "🪡"}</span>
                <span className="text-sm font-semibold">
                  {categoryName(c, lang)}
                </span>
              </button>
            ))}
          </div>
          <div className="mt-4 flex items-center justify-between gap-2">
            <Button variant="ghost" onClick={() => setStep(1)}>
              <ArrowLeft className="mr-2 size-4" /> {t("ob.back")}
            </Button>
            <Button
              size="lg"
              className="tap-lg rounded-full text-base"
              disabled={crafts.length === 0}
              onClick={() => setStep(3)}
            >
              {t("ob.next")} <ArrowRight className="ml-2 size-4" />
            </Button>
          </div>
        </div>
      )}

      {/* Step 3 — voice story + photo */}
      {step === 3 && (
        <div className="mt-8 space-y-5">
          <div className="rounded-2xl border border-border/70 bg-card p-6 shadow-soft sm:p-8">
            <h1 className="font-display text-3xl font-semibold tracking-tight">
              {t("ob.story.title")}
            </h1>
            <p className="mt-2 text-sm leading-6 text-muted-foreground">
              {t("ob.story.sub")}
            </p>

            {/* Voice */}
            <div className="mt-6 flex flex-col items-center gap-3">
              <button
                type="button"
                onClick={() => (speech.listening ? speech.stop() : speech.start())}
                className={cn(
                  "tap-lg flex size-20 items-center justify-center rounded-full shadow-soft transition-all",
                  speech.listening
                    ? "animate-pulse bg-destructive text-white"
                    : "bg-primary text-primary-foreground hover:scale-105",
                )}
                aria-label={t("ob.story.record")}
              >
                <Mic className="size-8" />
              </button>
              <p className="text-sm font-medium text-muted-foreground">
                {speech.listening
                  ? t("ob.story.recording")
                  : voiceNote
                    ? t("ob.story.recorded")
                    : speech.supported
                      ? t("ob.story.record")
                      : t("ob.story.unsupported")}
              </p>
            </div>

            <div className="mt-4">
              <p className="mb-2 text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">
                {t("ob.story.or")}
              </p>
              <Textarea
                value={typedNote}
                onChange={(e) => setTypedNote(e.target.value)}
                placeholder={t("ob.story.placeholder")}
                rows={3}
              />
            </div>

            {/* Photo */}
            <div className="mt-6 flex items-center gap-4 border-t border-border/60 pt-5">
              {photo.preview ? (
                <img
                  src={photo.preview}
                  alt=""
                  className="size-16 rounded-xl border border-border object-cover"
                />
              ) : (
                <span className="flex size-16 items-center justify-center rounded-xl bg-secondary text-secondary-foreground">
                  <Camera className="size-6" />
                </span>
              )}
              <div>
                <p className="text-sm font-semibold">{t("ob.photo")}</p>
                <p className="text-xs text-muted-foreground">{t("ob.photo.sub")}</p>
                <input
                  ref={photo.inputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => photo.pick(e.target.files?.[0])}
                />
                <div className="mt-2 flex gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    disabled={photo.uploading}
                    onClick={() => photo.inputRef.current?.click()}
                  >
                    {photo.uploading ? (
                      <Loader2 className="mr-1 size-3.5 animate-spin" />
                    ) : null}
                    {photo.preview ? t("ob.photo.change") : t("ob.photo.upload")}
                  </Button>
                  {photo.preview && (
                    <Button type="button" variant="ghost" size="sm" onClick={photo.reset}>
                      <Trash2 className="size-3.5" />
                    </Button>
                  )}
                </div>
              </div>
            </div>

            <Button
              size="lg"
              className="tap-lg mt-6 w-full rounded-full text-base shadow-soft"
              disabled={generating || crafts.length === 0}
              onClick={handleGenerate}
            >
              {generating && <Loader2 className="mr-2 size-4 animate-spin" />}
              {generating ? t("ob.generating") : t("ob.generate")}
            </Button>
            <div className="mt-3 flex justify-start">
              <Button variant="ghost" onClick={() => setStep(2)}>
                <ArrowLeft className="mr-2 size-4" /> {t("ob.back")}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Step 4 — review AI story */}
      {step === 4 && generated && (
        <div className="mt-8 rounded-2xl border border-primary/30 bg-card p-6 shadow-soft sm:p-8">
          <div className="flex items-center gap-2 text-primary">
            <Sparkles className="size-4" />
            <p className="text-xs font-semibold uppercase tracking-[0.16em]">
              {t("ob.review.title")}
            </p>
          </div>
          <p className="mt-2 text-sm leading-6 text-muted-foreground">
            {t("ob.review.sub")}
          </p>

          <div className="mt-6 space-y-4">
            <div className="space-y-2">
              <Label>{t("ob.review.shopName")}</Label>
              <Input
                value={generated.shopName}
                onChange={(e) =>
                  setGenerated({ ...generated, shopName: e.target.value })
                }
                className="tap-lg rounded-full"
              />
            </div>
            <div className="space-y-2">
              <Label>{t("ob.review.location")}</Label>
              <Input
                value={locationInput}
                onChange={(e) => setLocationInput(e.target.value)}
                placeholder={t("ob.review.location")}
                className="tap-lg rounded-full"
              />
            </div>
            <div className="space-y-2">
              <Label>{t("ob.review.storyLabel")}</Label>
              <Textarea
                value={generated.story}
                onChange={(e) =>
                  setGenerated({ ...generated, story: e.target.value })
                }
                rows={6}
                className="leading-6"
              />
            </div>
            <div className="space-y-2">
              <Label>{t("ob.review.bioLabel")}</Label>
              <Textarea
                value={generated.bio}
                onChange={(e) =>
                  setGenerated({ ...generated, bio: e.target.value })
                }
                rows={2}
              />
            </div>
          </div>

          <div className="mt-6 flex flex-col gap-2 sm:flex-row">
            <Button variant="ghost" onClick={() => setStep(3)} disabled={saving}>
              <ArrowLeft className="mr-2 size-4" /> {t("ob.back")}
            </Button>
            <Button
              size="lg"
              className="tap-lg flex-1 rounded-full text-base shadow-soft"
              disabled={saving || !generated.story.trim() || !generated.shopName.trim()}
              onClick={handleLaunch}
            >
              {saving && <Loader2 className="mr-2 size-4 animate-spin" />}
              {saving ? t("ob.launching") : t("ob.launch")}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Listing dialog — photo + voice + AI description                     */
/* ------------------------------------------------------------------ */

/** Which step of Sell with AI the AI is running right now. */
type SellStage =
  | "idle"
  | "enhancing"
  | "writing"
  | "translating"
  | "suggesting"
  | "live";

/** What the AI produced for this piece, kept for the price-reasoning card. */
type CatalogueSummary = {
  descriptionHi: string;
  suggestedPrice: number;
  priceReason: string;
  priceBreakdown: Array<{ label: string; labelHi: string; value: string }>;
};

type ListingDialogState =
  | { mode: "closed" }
  | { mode: "create" }
  | { mode: "edit"; listing: Listing };

function ListingDialog({
  state,
  onClose,
  makerCraft,
}: {
  state: ListingDialogState;
  onClose: () => void;
  makerCraft: string;
}) {
  const { lang, t } = useI18n();
  const createProduct = useMutation(api.studio.createProduct);
  const updateProduct = useMutation(api.studio.updateProduct);
  const smartCatalogue = useAction(api.aiStory.smartCatalogue);
  // Real market + sales numbers — the reasoning behind the suggested price.
  const pricingContext = useQuery(api.studio.pricingContext);
  const speech = useSpeechRecognition(lang);
  const photo = usePhoto();

  const isEdit = state.mode === "edit";
  const listing = state.mode === "edit" ? state.listing : null;

  const [form, setForm] = useState(() => ({
    title: listing?.title ?? "",
    description: listing?.description ?? "",
    category: listing?.category ?? makerCraft,
    price: listing?.price?.toString() ?? "",
    materials: listing?.materials.join(", ") ?? "",
    colors: listing?.colors?.join(", ") ?? "",
    dimensions: listing?.dimensions ?? "",
    tags: listing?.tags?.join(", ") ?? "",
    madeToOrder: listing?.madeToOrder ?? true,
    stock: listing?.stock?.toString() ?? "1",
    isActive: listing?.isActive ?? true,
  }));
  const [saving, setSaving] = useState(false);
  const [stage, setStage] = useState<SellStage>("idle");
  const [catalogue, setCatalogue] = useState<CatalogueSummary | null>(null);
  const [typedNote, setTypedNote] = useState("");
  const photoPreview = photo.preview ?? (isEdit ? (listing?.imageUrl ?? null) : null);
  // The artisan's own words, spoken or typed — both feed listing generation.
  const voiceText = [speech.transcript, typedNote]
    .map((part) => part.trim())
    .filter(Boolean)
    .join(". ");

  const set = <K extends keyof typeof form>(key: K, value: (typeof form)[K]) =>
    setForm((f) => ({ ...f, [key]: value }));

  /** Which step of Sell with AI is running right now (drives the tracker). */
  const activeStep: SellStepKey | null =
    stage === "enhancing"
      ? "enhance"
      : stage === "writing"
        ? "write"
        : stage === "translating"
          ? "translate"
          : stage === "suggesting"
            ? "price"
            : stage === "live"
              ? "live"
              : null;

  const hasPhoto = Boolean(photoPreview);
  const hasInput = hasPhoto || Boolean(voiceText) || Boolean(form.title.trim());

  /** The next thing the artisan still has to do, so the tracker guides them. */
  const nextStep: SellStepKey = !hasPhoto
    ? "photo"
    : !voiceText && !form.title.trim()
      ? "voice"
      : !catalogue
        ? "write"
        : "live";

  const stepStates = SELL_AI_STEPS.reduce(
    (acc, step) => {
      const done =
        step.key === "photo"
          ? hasPhoto
          : step.key === "voice"
            ? Boolean(voiceText || form.title.trim())
            : step.key === "enhance"
              ? photo.enhanced
              : step.key === "write"
                ? Boolean(form.description.trim())
                : step.key === "translate"
                  ? Boolean(catalogue)
                  : step.key === "price"
                    ? Boolean(form.price.trim())
                    : stage === "live";
      acc[step.key] = done
        ? "done"
        : step.key === activeStep
          ? "active"
          : step.key === nextStep
            ? "next"
            : "todo";
      return acc;
    },
    {} as Record<SellStepKey, SellStepState>,
  );

  /**
   * Sell with AI — the flagship flow. The artisan has already done their two
   * things (photo + voice); this runs the other five steps on their behalf and
   * shows each one happening: enhance the real pixels, write the description,
   * translate it, suggest a category and a fair price, then go live.
   */
  const runSellWithAi = async () => {
    if (!hasInput) {
      toast.info(t("ld.sellNeedsInput"));
      return;
    }
    try {
      let analysis = photo.measured;
      if (photo.preview && !photo.enhanced) {
        setStage("enhancing");
        const enhancedAnalysis = await photo.enhance();
        if (enhancedAnalysis) analysis = enhancedAnalysis;
      }

      setStage("writing");
      const result = await smartCatalogue({
        craft: form.category,
        title: form.title || undefined,
        voiceNote: voiceText || undefined,
        photoAnalysis: analysis?.ok
          ? {
              ok: true,
              width: analysis.width,
              height: analysis.height,
              aspect: analysis.aspect,
              brightness: analysis.brightness,
              contrast: analysis.contrast,
              saturation: analysis.saturation,
              colorHexes: analysis.colorHexes,
              light: analysis.light,
            }
          : undefined,
        pricing: pricingContext
          ? {
              categoryStats: pricingContext.categoryStats,
              pastSales: pricingContext.pastSales,
              myListings: pricingContext.myListings,
              myAvgPrice: pricingContext.myAvgPrice,
            }
          : undefined,
      });

      setCatalogue({
        descriptionHi: result.descriptionHi,
        suggestedPrice: result.suggestedPrice,
        priceReason: lang === "hi" ? result.priceReasonHi : result.priceReason,
        priceBreakdown: result.priceBreakdown,
      });

      setStage("translating");
      await sleep(500);
      setStage("suggesting");
      await sleep(500);

      // Just the empty fields — anything the artisan typed themselves wins.
      setForm((f) => ({
        ...f,
        title: f.title.trim() || result.name,
        category: PRODUCT_CATEGORIES.includes(
          result.category as (typeof PRODUCT_CATEGORIES)[number],
        )
          ? result.category
          : f.category,
        materials: f.materials.trim() || result.materials.join(", "),
        colors: f.colors.trim() || result.colors.join(", "),
        dimensions: f.dimensions.trim() || result.dimensions,
        tags: f.tags.trim() || result.tags.join(", "),
        description:
          f.description.trim() || (lang === "hi" ? result.descriptionHi : result.description),
        price: f.price.trim() || String(result.suggestedPrice),
      }));

      setStage("idle");
      toast.success(t("ld.sellDone"));
    } catch (err) {
      setStage("idle");
      toast.error(err instanceof Error ? err.message : "Sell with AI failed.");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const base = {
        title: form.title,
        description: form.description,
        descriptionHi: catalogue?.descriptionHi,
        category: form.category as (typeof PRODUCT_CATEGORIES)[number],
        price: Number(form.price) || 0,
        materials: form.materials.split(",").map((m) => m.trim()).filter(Boolean),
        madeToOrder: form.madeToOrder,
        stock: Number(form.stock) || 0,
        colors: form.colors.split(",").map((c) => c.trim()).filter(Boolean),
        dimensions: form.dimensions.trim() || undefined,
        tags: form.tags.split(",").map((tg) => tg.trim()).filter(Boolean),
      };
      if (isEdit && listing) {
        await updateProduct({
          ...base,
          productId: listing._id as Id<"products">,
          imageUrl: listing.imageUrl,
          imageStorageId: photo.storageId ?? undefined,
          isActive: form.isActive,
        });
        toast.success(t("stm.editToast"));
      } else {
        await createProduct({
          ...base,
          imageUrl: undefined,
          imageStorageId: photo.storageId ?? undefined,
        });
        toast.success(t("stm.publishToast"));
        // Step 7 — let the artisan watch their piece reach the market.
        setStage("live");
        window.setTimeout(onClose, 1200);
        return;
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
            {isEdit ? t("ld.edit") : t("ld.new")}
          </DialogTitle>
          <DialogDescription>
            {isEdit ? t("ld.editSub") : t("ld.newSub")}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Sell with AI — the flagship flow, with its step tracker */}
          <div className="rounded-2xl border border-primary/25 bg-primary/5 p-4">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <p className="flex items-center gap-1.5 font-display text-base font-semibold tracking-tight">
                <Sparkles className="size-4 text-primary" />
                {t("ld.sellWithAi")}
              </p>
              <SellWithAiBadge />
            </div>
            <p className="mt-1 text-xs leading-5 text-muted-foreground">
              {t("ld.sellWithAiSub")}
            </p>

            <div className="mt-3.5">
              <SellWithAiTracker states={stepStates} />
            </div>

            {stage === "live" ? (
              <p className="mt-3 flex items-center gap-2 rounded-lg bg-primary px-3 py-2 text-xs font-semibold text-primary-foreground">
                <CheckCircle2 className="size-3.5" />
                {t("ld.sellLive")}
              </p>
            ) : (
              activeStep && (
                <div className="mt-3">
                  <SellWithAiStatus stage={activeStep} />
                </div>
              )
            )}

            {/* The artisan's two jobs: a photo and a few spoken words. */}
            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              <div className="rounded-xl border border-border/70 bg-card p-3">
                <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-muted-foreground">
                  {t("swa.step.photo")}
                </p>
                <div className="mt-2 flex items-center gap-3">
                  {photoPreview ? (
                    <img
                      src={photoPreview}
                      alt=""
                      className="size-14 shrink-0 rounded-lg border border-border object-cover"
                    />
                  ) : (
                    <span className="flex size-14 shrink-0 items-center justify-center rounded-lg bg-secondary text-secondary-foreground">
                      <Camera className="size-5" />
                    </span>
                  )}
                  <div className="flex min-w-0 flex-col gap-1.5">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      className="h-8 rounded-full px-3 text-xs"
                      disabled={photo.uploading || photo.enhancing}
                      onClick={() => photo.inputRef.current?.click()}
                    >
                      {photo.uploading ? (
                        <Loader2 className="mr-1 size-3.5 animate-spin" />
                      ) : (
                        <Camera className="mr-1 size-3.5" />
                      )}
                      {photoPreview ? t("ob.photo.change") : t("ob.photo.upload")}
                    </Button>
                    {photo.preview && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className={cn(
                          "h-8 justify-start rounded-full px-2.5 text-xs",
                          photo.enhanced && "text-primary",
                        )}
                        disabled={photo.enhancing || photo.uploading}
                        onClick={() => photo.enhance()}
                      >
                        {photo.enhancing ? (
                          <Loader2 className="mr-1 size-3.5 animate-spin" />
                        ) : (
                          <Wand2 className="mr-1 size-3.5" />
                        )}
                        {photo.enhanced ? t("ld.enhanced") : t("ld.enhance")}
                      </Button>
                    )}
                  </div>
                </div>
                <input
                  ref={photo.inputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => photo.pick(e.target.files?.[0])}
                />
                <p className="mt-2 text-[11px] leading-4 text-muted-foreground">
                  {photo.measured?.ok
                    ? t("ld.photoMeasured", {
                        light: t(
                          "ld.light." + photo.measured.light.replace(/ /g, "_"),
                        ),
                      })
                    : t("ld.photoHelp")}
                </p>
              </div>

              <div className="rounded-xl border border-border/70 bg-card p-3">
                <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-muted-foreground">
                  {t("swa.step.voice")}
                </p>
                <div className="mt-2 flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => (speech.listening ? speech.stop() : speech.start())}
                    className={cn(
                      "flex size-11 shrink-0 items-center justify-center rounded-full shadow-soft transition-all",
                      speech.listening
                        ? "animate-pulse bg-destructive text-white"
                        : "bg-primary text-primary-foreground hover:scale-105",
                    )}
                    aria-label={t("ld.voice")}
                  >
                    <Mic className="size-5" />
                  </button>
                  <p className="min-w-0 flex-1 text-xs leading-5 text-muted-foreground">
                    {speech.listening
                      ? t("ob.story.recording")
                      : speech.transcript
                        ? `“${speech.transcript}”`
                        : speech.supported
                          ? t("ld.voiceHelp")
                          : t("ob.story.unsupported")}
                  </p>
                </div>
                {speech.interim && (
                  <p className="mt-1.5 text-xs italic text-muted-foreground/70">
                    {speech.interim}…
                  </p>
                )}
                {speech.error &&
                  speech.error !== "unsupported" &&
                  !speech.transcript && (
                    <p className="mt-2 rounded-lg bg-secondary/60 px-2.5 py-1.5 text-[11px] leading-4 text-muted-foreground">
                      {t("ld.voiceBlocked")}
                    </p>
                  )}
                <Textarea
                  value={typedNote}
                  onChange={(e) => setTypedNote(e.target.value)}
                  placeholder={t("ld.voiceTyped.ph")}
                  aria-label={t("ld.voiceTyped")}
                  rows={2}
                  className="mt-2.5 text-xs"
                />
              </div>
            </div>

            <Button
              type="button"
              size="lg"
              className="mt-4 w-full rounded-full text-base shadow-soft"
              disabled={stage !== "idle" || !hasInput}
              onClick={runSellWithAi}
            >
              {stage !== "idle" ? (
                <>
                  <Loader2 className="mr-2 size-4 animate-spin" />
                  {t("ld.sellRunning")}
                </>
              ) : (
                <>
                  <Sparkles className="mr-2 size-4" />
                  {t("ld.sellRun")}
                </>
              )}
            </Button>
            <p className="mt-2 text-center text-[11px] text-muted-foreground">
              {t("ld.enhanceHint")}
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="ldTitle">{t("ld.name")}</Label>
            <Input
              id="ldTitle"
              value={form.title}
              onChange={(e) => set("title", e.target.value)}
              placeholder={t("ld.name.ph")}
              required
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label>{t("ld.category")}</Label>
              <div className="flex flex-wrap gap-1.5">
                {PRODUCT_CATEGORIES.slice(0, 4).map((c) => (
                  <button
                    key={c}
                    type="button"
                    onClick={() => set("category", c)}
                    className={cn(
                      "rounded-full border px-3 py-1.5 text-xs font-medium transition-colors",
                      form.category === c
                        ? "border-primary bg-primary text-primary-foreground"
                        : "border-border bg-card text-muted-foreground",
                    )}
                  >
                    {CATEGORY_ICON[c]} {categoryName(c, lang)}
                  </button>
                ))}
              </div>
              <div className="flex flex-wrap gap-1.5">
                {PRODUCT_CATEGORIES.slice(4).map((c) => (
                  <button
                    key={c}
                    type="button"
                    onClick={() => set("category", c)}
                    className={cn(
                      "rounded-full border px-3 py-1.5 text-xs font-medium transition-colors",
                      form.category === c
                        ? "border-primary bg-primary text-primary-foreground"
                        : "border-border bg-card text-muted-foreground",
                    )}
                  >
                    {CATEGORY_ICON[c]} {categoryName(c, lang)}
                  </button>
                ))}
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="ldPrice">{t("ld.price")}</Label>
              <Input
                id="ldPrice"
                type="number"
                min="10"
                step="10"
                value={form.price}
                onChange={(e) => set("price", e.target.value)}
                placeholder="1500"
                required
              />
              {catalogue && catalogue.suggestedPrice > 0 && (
                <div className="rounded-xl border border-primary/25 bg-primary/5 p-3">
                  <p className="flex items-center gap-1.5 text-sm font-semibold text-primary">
                    <IndianRupee className="size-4" />
                    {t("ld.priceSuggest", {
                      price: formatPrice(catalogue.suggestedPrice),
                    })}
                  </p>
                  <p className="mt-2 text-[10px] font-semibold uppercase tracking-[0.12em] text-muted-foreground">
                    {t("ld.priceWhy")}
                  </p>
                  <p className="mt-1 text-xs leading-5 text-muted-foreground">
                    {catalogue.priceReason}
                  </p>
                  <div className="mt-2 flex flex-wrap gap-1.5">
                    {catalogue.priceBreakdown.map((part) => (
                      <span
                        key={part.label}
                        className="rounded-full border border-border bg-card px-2.5 py-1 text-[11px] text-muted-foreground"
                      >
                        {lang === "hi" ? part.labelHi : part.label}:{" "}
                        <span className="font-semibold text-foreground">{part.value}</span>
                      </span>
                    ))}
                  </div>
                  {form.price.trim() === String(catalogue.suggestedPrice) ? (
                    <p className="mt-2.5 text-[11px] font-medium text-primary">
                      ✓ {t("ld.priceApplied")}
                    </p>
                  ) : (
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      className="mt-2.5 h-8 rounded-full text-xs"
                      onClick={() => set("price", String(catalogue.suggestedPrice))}
                    >
                      {t("ld.usePrice")}
                    </Button>
                  )}
                </div>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="ldMaterials">{t("ld.materials")}</Label>
            <Input
              id="ldMaterials"
              value={form.materials}
              onChange={(e) => set("materials", e.target.value)}
              placeholder={t("ld.materials.ph")}
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="ldColors">{t("ld.colors")}</Label>
              <Input
                id="ldColors"
                value={form.colors}
                onChange={(e) => set("colors", e.target.value)}
                placeholder={t("ld.colors.ph")}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="ldDimensions">{t("ld.dimensions")}</Label>
              <Input
                id="ldDimensions"
                value={form.dimensions}
                onChange={(e) => set("dimensions", e.target.value)}
                placeholder={t("ld.dimensions.ph")}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="ldTags">{t("ld.tags")}</Label>
            <Input
              id="ldTags"
              value={form.tags}
              onChange={(e) => set("tags", e.target.value)}
              placeholder={t("ld.tags.ph")}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="ldDesc">{t("ld.desc")}</Label>
            <Textarea
              id="ldDesc"
              value={form.description}
              onChange={(e) => set("description", e.target.value)}
              placeholder={t("ld.desc.ph")}
              rows={3}
            />
            {catalogue?.descriptionHi && (
              <div className="rounded-lg border border-border bg-secondary/50 px-3 py-2">
                <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-muted-foreground">
                  {t("ld.hindiReady")}
                </p>
                <p className="mt-1 text-xs leading-5 text-muted-foreground">
                  {catalogue.descriptionHi}
                </p>
              </div>
            )}
          </div>

          <div className="flex flex-wrap items-center gap-x-6 gap-y-3">
            <div className="flex items-center gap-2">
              <Switch
                id="ldMadeToOrder"
                checked={form.madeToOrder}
                onCheckedChange={(v) => set("madeToOrder", v)}
              />
              <Label htmlFor="ldMadeToOrder" className="text-sm font-normal">
                {t("ld.madeToOrder")}
              </Label>
            </div>
            {isEdit && (
              <div className="flex items-center gap-2">
                <Switch
                  id="ldActive"
                  checked={form.isActive}
                  onCheckedChange={(v) => set("isActive", v)}
                />
                <Label htmlFor="ldActive" className="text-sm font-normal">
                  {t("ld.public")}
                </Label>
              </div>
            )}
            <div className="ml-auto flex items-center gap-2">
              <Label htmlFor="ldStock" className="text-sm font-normal">
                {t("ld.stock")}
              </Label>
              <Input
                id="ldStock"
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
              {t("ld.cancel")}
            </Button>
            <Button type="submit" disabled={saving}>
              {saving && <Loader2 className="size-4 animate-spin" />}
              {isEdit ? t("ld.save") : t("ld.publish")}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

/* ------------------------------------------------------------------ */
/* Studio settings                                                     */
/* ------------------------------------------------------------------ */

function StudioSettings({
  open,
  onClose,
  maker,
}: {
  open: boolean;
  onClose: () => void;
  maker: Maker;
}) {
  const { lang, t } = useI18n();
  const updateMaker = useMutation(api.studio.updateMaker);
  const photo = usePhoto();
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    shopName: maker.shopName,
    artisanName: maker.artisanName ?? "",
    craft: maker.craft,
    crafts: maker.crafts ?? [maker.craft],
    location: maker.location,
    bio: maker.bio,
    story: maker.story,
  });
  const makerId = maker._id as Id<"makers">;
  // A freshly picked photo previews instantly; otherwise show the saved one.
  const portrait = photo.preview ?? maker.image ?? null;

  const toggleCraft = (c: string) =>
    setForm((f) => ({
      ...f,
      crafts: f.crafts.includes(c) ? f.crafts.filter((x) => x !== c) : [...f.crafts, c],
    }));

  const handleSubmit = async () => {
    setSaving(true);
    try {
      await updateMaker({
        makerId,
        shopName: form.shopName,
        artisanName: form.artisanName,
        craft: form.crafts[0] ?? form.craft,
        crafts: form.crafts,
        location: form.location,
        bio: form.bio,
        story: form.story,
        imageStorageId: photo.storageId ?? undefined,
      });
      toast.success(t("stm.saved"));
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
            {t("stm.profile")}
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          {/* The artisan's own photo — this is what "Meet the artisan" shows. */}
          <div className="flex items-center gap-4">
            {portrait ? (
              <img
                src={portrait}
                alt=""
                className="size-16 shrink-0 rounded-full border border-border object-cover"
              />
            ) : (
              <span className="flex size-16 shrink-0 items-center justify-center rounded-full bg-primary/10 font-display text-xl font-semibold text-primary">
                {(form.artisanName || maker.shopName).charAt(0)}
              </span>
            )}
            <div className="min-w-0">
              <p className="text-sm font-semibold">{t("stm.photo")}</p>
              <p className="text-xs text-muted-foreground">{t("stm.photo.sub")}</p>
              <input
                ref={photo.inputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => photo.pick(e.target.files?.[0])}
              />
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="mt-2 rounded-full"
                disabled={photo.uploading}
                onClick={() => photo.inputRef.current?.click()}
              >
                {photo.uploading ? (
                  <Loader2 className="mr-1 size-3.5 animate-spin" />
                ) : (
                  <Camera className="mr-1 size-3.5" />
                )}
                {portrait ? t("stm.photo.change") : t("stm.photo.upload")}
              </Button>
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="setArtisanName">{t("stm.name")}</Label>
              <Input
                id="setArtisanName"
                value={form.artisanName}
                onChange={(e) =>
                  setForm((f) => ({ ...f, artisanName: e.target.value }))
                }
                placeholder={t("stm.name.ph")}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="setShopName">{t("ob.review.shopName")}</Label>
              <Input
                id="setShopName"
                value={form.shopName}
                onChange={(e) => setForm((f) => ({ ...f, shopName: e.target.value }))}
              />
            </div>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label>{t("ld.category")}</Label>
              <p className="text-xs text-muted-foreground">{t("stm.craftsHint")}</p>
              <div className="flex flex-wrap gap-1.5">
                {PRODUCT_CATEGORIES.map((c) => (
                  <button
                    key={c}
                    type="button"
                    aria-pressed={form.crafts.includes(c)}
                    onClick={() => toggleCraft(c)}
                    className={cn(
                      "rounded-full border px-3 py-1.5 text-xs font-medium transition-colors",
                      form.crafts.includes(c)
                        ? "border-primary bg-primary text-primary-foreground"
                        : "border-border bg-card text-muted-foreground",
                    )}
                  >
                    {CATEGORY_ICON[c]} {categoryName(c, lang)}
                  </button>
                ))}
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="setLocation">{t("ob.review.location")}</Label>
              <Input
                id="setLocation"
                value={form.location}
                onChange={(e) =>
                  setForm((f) => ({ ...f, location: e.target.value }))
                }
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="setBio">{t("ob.review.bioLabel")}</Label>
            <Textarea
              id="setBio"
              rows={2}
              value={form.bio}
              onChange={(e) => setForm((f) => ({ ...f, bio: e.target.value }))}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="setStory">{t("ob.review.storyLabel")}</Label>
            <Textarea
              id="setStory"
              rows={5}
              value={form.story}
              onChange={(e) => setForm((f) => ({ ...f, story: e.target.value }))}
            />
          </div>
        </div>
        <DialogFooter className="gap-2">
          <Button variant="ghost" onClick={onClose} disabled={saving}>
            {t("ld.cancel")}
          </Button>
          <Button onClick={handleSubmit} disabled={saving || form.shopName.trim().length < 2}>
            {saving && <Loader2 className="size-4 animate-spin" />}
            {t("ld.save")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

/* ------------------------------------------------------------------ */
/* Studio page                                                         */
/* ------------------------------------------------------------------ */

export default function Studio() {
  const { user } = useAuth();
  const { lang, t } = useI18n();
  const studio = useQuery(api.studio.myListings);
  const sales = useQuery(api.studio.mySales);
  const retireProduct = useMutation(api.studio.retireProduct);
  const [dialog, setDialog] = useState<ListingDialogState>({ mode: "closed" });
  const [settingsOpen, setSettingsOpen] = useState(false);

  const isArtisan = user?.role === "artisan" && !!user?.phone;

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

  /* 1. Not yet an artisan → phone + OTP gate (also covers signed-in buyers). */
  if (!isArtisan) {
    return (
      <div className="flex min-h-screen flex-col bg-background bg-paper">
        <SiteHeader />
        <main className="flex-1 px-4 py-14 sm:px-6">
          <PhoneGate reason={t("st.phone.needed")} />
        </main>
        <SiteFooter />
      </div>
    );
  }

  /* 2. Artisan without a studio → 3-tap onboarding. */
  if (studio === null) {
    return (
      <div className="flex min-h-screen flex-col bg-background bg-paper">
        <SiteHeader />
        <main className="flex-1 px-4 py-12 sm:px-6">
          <Onboarding />
        </main>
        <SiteFooter />
      </div>
    );
  }

  /* 3. Artisan with a studio → management. */
  const maker = studio.maker;
  const listings = studio.products;
  const activeCount = listings.filter((l) => l.isActive).length;
  const totalRevenue = (sales ?? [])
    .filter((s) => s.order)
    .reduce((sum, s) => sum + s.price * s.quantity, 0);
  const unitsSold = (sales ?? []).reduce((sum, s) => sum + s.quantity, 0);

  // The seven steps, all still ahead — so artisans see exactly what Sell with
  // AI will do for them before they start.
  const idleSteps = SELL_AI_STEPS.reduce(
    (acc, step) => {
      acc[step.key] = "todo";
      return acc;
    },
    {} as Record<SellStepKey, SellStepState>,
  );

  const handleRetire = (listingId: string) => {
    retireProduct({ productId: listingId as Id<"products"> })
      .then(() => toast.success(t("stm.retiredToast")))
      .catch((err: Error) => toast.error(err.message));
  };

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <SiteHeader />
      <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-10 sm:px-6">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-[0.16em] text-primary">
              <Hammer className="size-3.5" />
              {t("st.title")}
            </p>
            <h1 className="mt-1.5 font-display text-3xl font-semibold tracking-tight">
              {maker.shopName}
            </h1>
            {maker.artisanName && (
              <p className="mt-0.5 text-sm font-medium text-foreground/80">
                {t("mf.artisan")}: {maker.artisanName}
              </p>
            )}
            <p className="mt-1 flex flex-wrap items-center gap-1.5 text-sm text-muted-foreground">
              <MapPin className="size-3.5" />
              {maker.location} ·
              {(maker.crafts ?? [maker.craft]).map((c, i) => (
                <span key={c}>
                  {i > 0 && ", "}
                  {categoryName(c, lang)}
                </span>
              ))}
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={() => setSettingsOpen(true)}>
              <Settings2 className="size-4" /> {t("stm.profile")}
            </Button>
            <Button
              size="sm"
              className="shadow-soft"
              onClick={() => setDialog({ mode: "create" })}
            >
              <Sparkles className="size-4" /> {t("stm.sellai.cta")}
            </Button>
          </div>
        </div>

        {/* Sell with AI — the platform's flagship flow, front and centre */}
        <div className="mt-8 rounded-2xl border border-primary/25 bg-primary/5 p-5 sm:p-6">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div className="max-w-2xl">
              <SellWithAiBadge />
              <h2 className="mt-2.5 font-display text-xl font-semibold tracking-tight sm:text-2xl">
                {t("stm.sellai.title")}
              </h2>
              <p className="mt-1.5 text-sm leading-6 text-muted-foreground">
                {t("stm.sellai.sub")}
              </p>
            </div>
            <Button
              size="lg"
              className="rounded-full shadow-soft"
              onClick={() => setDialog({ mode: "create" })}
            >
              <Sparkles className="size-4" />
              {t("stm.sellai.cta")}
            </Button>
          </div>
          <div className="mt-4 rounded-xl border border-border/70 bg-card p-3.5">
            <SellWithAiTracker states={idleSteps} />
          </div>
        </div>

        {/* Stats */}
        <div className="mt-8 grid grid-cols-2 gap-4 md:grid-cols-4">
          {[
            { label: t("stm.active"), value: String(activeCount), icon: Store },
            { label: t("stm.total"), value: String(listings.length), icon: Package },
            { label: t("stm.sold"), value: String(unitsSold), icon: HeartHandshake },
            { label: t("stm.revenue"), value: formatPrice(totalRevenue), icon: Eye },
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
        <h2 className="mt-10 font-display text-xl font-semibold tracking-tight">
          {t("stm.listings")}
        </h2>
        {listings.length === 0 ? (
          <div className="mt-6 flex flex-col items-center gap-4 rounded-xl border border-dashed border-border bg-card py-16 text-center">
            <span className="flex size-14 items-center justify-center rounded-full bg-secondary">
              <Package className="size-6 text-muted-foreground" />
            </span>
            <p className="max-w-sm text-sm text-muted-foreground">
              {t("stm.sales.empty")}
            </p>
            <Button onClick={() => setDialog({ mode: "create" })} className="rounded-full">
              <Sparkles className="size-4" /> {t("stm.sellai.cta")}
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
                        listing.isActive ? "text-foreground" : "text-muted-foreground",
                      )}
                    >
                      {listing.isActive ? t("stm.live") : t("stm.retired")}
                    </Badge>
                    {listing.madeToOrder && (
                      <Badge
                        variant="outline"
                        className="rounded-full font-normal text-muted-foreground"
                      >
                        {t("card.madeToOrder")}
                      </Badge>
                    )}
                  </div>
                  <p className="mt-1 text-xs text-muted-foreground">
                    {categoryName(listing.category, lang)} · {t("stm.stock", { n: listing.stock })}
                  </p>
                </div>
                <span className="hidden font-display text-base font-semibold sm:block">
                  {formatPrice(listing.price)}
                </span>
                <div className="flex gap-1">
                  <Button
                    variant="ghost"
                    size="icon"
                    aria-label={t("stm.edit")}
                    onClick={() => setDialog({ mode: "edit", listing })}
                  >
                    <Pencil className="size-4" />
                  </Button>
                  {listing.isActive && (
                    <Button
                      variant="ghost"
                      size="icon"
                      aria-label={t("stm.retire")}
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
          {t("stm.sales")}
        </h2>
        {(sales ?? []).length === 0 ? (
          <p className="mt-4 rounded-xl border border-dashed border-border bg-card p-8 text-center text-sm text-muted-foreground">
            {t("stm.sales.empty")}
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
                    <p className="truncate text-sm font-medium">{sale.productTitle}</p>
                    <p className="text-xs text-muted-foreground">
                      {t("orders.qtyEach", { qty: sale.quantity, price: formatPrice(sale.price) })} ·{" "}
                      {sale.order?.fullName}
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
          makerCraft={maker.craft}
        />
      )}

      <StudioSettings
        open={settingsOpen}
        onClose={() => setSettingsOpen(false)}
        maker={maker}
      />
      <SiteFooter />
    </div>
  );
}