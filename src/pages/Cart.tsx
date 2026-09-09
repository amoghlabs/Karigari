import { useState } from "react";
import { Link, useNavigate } from "react-router";
import { useAction, useMutation, useQuery } from "convex/react";
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
import { useI18n } from "@/lib/i18n";
import { formatPrice } from "@/lib/format";
import {
  ArrowLeft,
  ArrowRight,
  CreditCard,
  Hand,
  Loader2,
  Lock,
  Minus,
  Plus,
  ShieldCheck,
  ShoppingBag,
  Smartphone,
  Trash2,
  Truck,
} from "lucide-react";
import { toast } from "sonner";

/* Minimal Razorpay Checkout typings (the SDK is loaded from their CDN). */
type RazorpayResponse = {
  razorpay_payment_id: string;
  razorpay_order_id: string;
  razorpay_signature: string;
};

type RazorpayOptions = {
  key: string;
  amount: number; // paise
  currency: string;
  name: string;
  description: string;
  order_id: string;
  prefill?: { name?: string };
  handler: (response: RazorpayResponse) => void;
  modal?: { ondismiss?: () => void };
};

type RazorpayInstance = { open: () => void };

declare global {
  interface Window {
    Razorpay?: new (options: RazorpayOptions) => RazorpayInstance;
  }
}

function loadRazorpayScript(): Promise<void> {
  return new Promise((resolve, reject) => {
    if (window.Razorpay) return resolve();
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.onload = () => resolve();
    script.onerror = () =>
      reject(new Error("Could not load the payment gateway."));
    document.body.appendChild(script);
  });
}

type PayMethod = "upi" | "card";

export default function Cart() {
  const navigate = useNavigate();
  const { t } = useI18n();
  const cart = useQuery(api.cart.getCart);
  const paymentMode = useQuery(api.payments.getPaymentMode);
  const updateItem = useMutation(api.cart.updateCartItem);
  const removeItem = useMutation(api.cart.removeCartItem);
  const demoPlaceOrder = useMutation(api.payments.demoPlaceOrder);
  const createRzpOrder = useAction(
    api.paymentsActions.createRazorpayOrderAction,
  );
  const verifyRzpPayment = useAction(api.paymentsActions.verifyRazorpayPayment);

  const [checkoutOpen, setCheckoutOpen] = useState(false);
  const [step, setStep] = useState<"details" | "pay">("details");
  const [placing, setPlacing] = useState(false);
  const [fullName, setFullName] = useState("");
  const [address, setAddress] = useState("");
  const [method, setMethod] = useState<PayMethod>("upi");
  const [upiId, setUpiId] = useState("");
  const [cardNumber, setCardNumber] = useState("");
  const [payError, setPayError] = useState<string | null>(null);

  const liveMode = paymentMode?.razorpay === true;

  if (cart === undefined || paymentMode === undefined) {
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

  const openCheckout = () => {
    setStep("details");
    setPayError(null);
    setCheckoutOpen(true);
  };

  const continueToPayment = () => {
    if (fullName.trim().length < 2) {
      setPayError(t("cart.recipient.invalid"));
      return;
    }
    if (address.trim().length < 8) {
      setPayError(t("cart.address.invalid"));
      return;
    }
    setPayError(null);
    setStep("pay");
  };

  const methodInputValid = () => {
    if (method === "upi") {
      return /^[\w.\-]{2,}@[a-zA-Z]{2,}$/.test(upiId.trim());
    }
    return /^\d{13,19}$/.test(cardNumber.replace(/\s/g, ""));
  };

  const finishCheckout = (result: { orderId: string; total: number }) => {
    setCheckoutOpen(false);
    toast.success(t("cart.ordered"));
    navigate("/orders", {
      state: { justPlaced: result.orderId, total: result.total },
    });
  };

  const handleDemoPay = async () => {
    if (!methodInputValid()) {
      setPayError(
        method === "upi"
          ? t("cart.pay.upi.invalid")
          : t("cart.pay.card.invalid"),
      );
      return;
    }
    setPayError(null);
    setPlacing(true);
    try {
      const result = await demoPlaceOrder({ fullName, address, method });
      finishCheckout(result);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Checkout failed.");
      setPlacing(false);
    }
  };

  const handleLivePay = async () => {
    setPlacing(true);
    setPayError(null);
    try {
      const order = await createRzpOrder({ fullName, address });
      await loadRazorpayScript();
      const Rzp = window.Razorpay;
      if (!Rzp) throw new Error("Payment gateway unavailable.");

      const rzp = new Rzp({
        key: order.keyId,
        amount: order.amountPaise,
        currency: "INR",
        name: t("brand.name"),
        description: t("cart.checkout"),
        order_id: order.rzpOrderId,
        prefill: { name: fullName },
        handler: async (response) => {
          try {
            const result = await verifyRzpPayment({
              rzpOrderId: response.razorpay_order_id,
              rzpPaymentId: response.razorpay_payment_id,
              rzpSignature: response.razorpay_signature,
            });
            finishCheckout(result);
          } catch (err) {
            toast.error(
              err instanceof Error ? err.message : "Payment verification failed.",
            );
            setPlacing(false);
          }
        },
        modal: { ondismiss: () => setPlacing(false) },
      });
      rzp.open();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Checkout failed.");
      setPlacing(false);
    }
  };

  return (
    <div className="flex min-h-screen flex-col bg-background bg-paper">
      <SiteHeader />
      <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-10 sm:px-6">
        <h1 className="font-display text-3xl font-semibold tracking-tight">
          {t("cart.title")}
        </h1>
        <p className="mt-1.5 text-sm text-muted-foreground">
          {count === 0
            ? t("cart.empty")
            : count === 1
              ? t("cart.countOne")
              : t("cart.count", { count })}
        </p>

        {lines.length === 0 ? (
          <div className="mt-10 flex flex-col items-center gap-4 rounded-xl border border-dashed border-border bg-card py-20 text-center">
            <span className="flex size-14 items-center justify-center rounded-full bg-secondary">
              <ShoppingBag className="size-6 text-muted-foreground" />
            </span>
            <div>
              <p className="font-display text-lg font-semibold">
                {t("cart.empty")}
              </p>
              <p className="mt-1 text-sm text-muted-foreground">
                {t("cart.empty.body")}
              </p>
            </div>
            <Button asChild className="rounded-full">
              <Link to="/shop">
                {t("cart.browse")} <ArrowRight className="size-4" />
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
                          {t("card.by", { name: line.makerName })}
                        </p>
                      </div>
                      <button
                        type="button"
                        aria-label={t("cart.remove", { name: line.product.title })}
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
                {t("cart.summary")}
              </p>
              <div className="mt-4 space-y-2.5 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">
                    {t("cart.subtotal")}
                  </span>
                  <span className="font-medium">{formatPrice(subtotal)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">
                    {t("cart.shipping")}
                  </span>
                  <span className="flex items-center gap-1 text-muted-foreground">
                    <Truck className="size-3.5" /> {t("cart.shippingNote")}
                  </span>
                </div>
              </div>
              <Separator className="my-4" />
              <div className="flex justify-between font-display text-lg font-semibold">
                <span>{t("cart.total")}</span>
                <span className="text-primary">{formatPrice(subtotal)}</span>
              </div>
              <Button
                size="lg"
                className="mt-5 h-12 w-full rounded-full text-base shadow-soft"
                onClick={openCheckout}
              >
                {t("cart.checkout")} <ArrowRight className="size-4" />
              </Button>
              <p className="mt-3 flex items-center justify-center gap-1.5 text-xs text-muted-foreground">
                <Hand className="size-3.5" />
                {t("cart.fromStudio")}
              </p>
            </aside>
          </div>
        )}
      </main>

      <Dialog open={checkoutOpen} onOpenChange={setCheckoutOpen}>
        <DialogContent className="sm:max-w-lg">
          {step === "details" ? (
            <>
              <DialogHeader>
                <DialogTitle className="font-display text-xl tracking-tight">
                  {t("cart.checkout")}
                </DialogTitle>
                <DialogDescription>
                  {t("cart.checkout.body", {
                    count,
                    total: formatPrice(subtotal),
                  })}
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="fullName">{t("cart.recipient")}</Label>
                  <Input
                    id="fullName"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder={t("cart.recipient")}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="address">{t("cart.address")}</Label>
                  <Textarea
                    id="address"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    placeholder={t("cart.address.ph")}
                    rows={3}
                  />
                </div>
                <div className="space-y-2">
                  <Label>{t("cart.method")}</Label>
                  <div className="grid grid-cols-2 gap-2">
                    {(
                      [
                        {
                          value: "upi",
                          icon: Smartphone,
                          label: t("cart.method.upi"),
                          sub: t("cart.method.upi.sub"),
                        },
                        {
                          value: "card",
                          icon: CreditCard,
                          label: t("cart.method.card"),
                          sub: t("cart.method.card.sub"),
                        },
                      ] as const
                    ).map((opt) => (
                      <button
                        key={opt.value}
                        type="button"
                        onClick={() => setMethod(opt.value)}
                        className={`flex flex-col items-start gap-1.5 rounded-xl border-2 p-3 text-left transition-all ${
                          method === opt.value
                            ? "border-primary bg-primary/5 shadow-soft"
                            : "border-border bg-card hover:border-primary/40"
                        }`}
                      >
                        <opt.icon
                          className={`size-5 ${
                            method === opt.value
                              ? "text-primary"
                              : "text-muted-foreground"
                          }`}
                        />
                        <span className="text-sm font-semibold">{opt.label}</span>
                        <span className="text-xs text-muted-foreground">
                          {opt.sub}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>
                {payError && (
                  <p className="text-sm text-destructive" role="alert">
                    {payError}
                  </p>
                )}
              </div>
              <DialogFooter className="gap-2">
                <Button
                  variant="ghost"
                  onClick={() => setCheckoutOpen(false)}
                  disabled={placing}
                >
                  {t("cart.cancel")}
                </Button>
                <Button onClick={continueToPayment}>
                  {t("cart.continuePay")} <ArrowRight className="size-4" />
                </Button>
              </DialogFooter>
            </>
          ) : (
            <>
              <DialogHeader>
                <DialogTitle className="font-display text-xl tracking-tight">
                  {t("cart.pay.title")}
                </DialogTitle>
                <DialogDescription>
                  {t("cart.pay.sub", { count, total: formatPrice(subtotal) })}
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div className="flex items-center justify-between rounded-xl border border-border/70 bg-secondary/40 px-4 py-3">
                  <span className="flex items-center gap-2 text-sm">
                    {method === "upi" ? (
                      <Smartphone className="size-4 text-primary" />
                    ) : (
                      <CreditCard className="size-4 text-primary" />
                    )}
                    {method === "upi"
                      ? t("cart.method.upi")
                      : t("cart.method.card")}
                  </span>
                  <button
                    type="button"
                    className="text-sm font-medium text-primary underline-offset-2 hover:underline"
                    onClick={() => setStep("details")}
                  >
                    {t("cart.pay.change")}
                  </button>
                </div>

                {liveMode ? (
                  <p className="rounded-xl border border-border/70 bg-card p-4 text-sm text-muted-foreground">
                    {t("cart.pay.rzp")}
                  </p>
                ) : (
                  <>
                    <div className="space-y-2">
                      <Label htmlFor="upiId">
                        {method === "upi"
                          ? t("cart.pay.upi.label")
                          : t("cart.pay.card.label")}
                      </Label>
                      <Input
                        id="upiId"
                        value={method === "upi" ? upiId : cardNumber}
                        onChange={(e) =>
                          method === "upi"
                            ? setUpiId(e.target.value)
                            : setCardNumber(e.target.value.replace(/[^\d\s]/g, ""))
                        }
                        placeholder={
                          method === "upi"
                            ? t("cart.pay.upi.ph")
                            : t("cart.pay.card.ph")
                        }
                        inputMode={method === "upi" ? "email" : "numeric"}
                        autoComplete={method === "upi" ? "off" : "cc-number"}
                      />
                    </div>
                    <p className="flex items-center gap-1.5 text-xs text-muted-foreground">
                      <Lock className="size-3.5" /> {t("cart.pay.demo")}
                    </p>
                  </>
                )}

                {payError && (
                  <p className="text-sm text-destructive" role="alert">
                    {payError}
                  </p>
                )}
              </div>
              <DialogFooter className="flex-col gap-2 sm:flex-row">
                <Button
                  variant="ghost"
                  onClick={() => setStep("details")}
                  disabled={placing}
                  className="sm:mr-auto"
                >
                  <ArrowLeft className="size-4" /> {t("ob.back")}
                </Button>
                <Button
                  onClick={liveMode ? handleLivePay : handleDemoPay}
                  disabled={placing}
                  className="h-12 min-w-44 rounded-full text-base shadow-soft"
                >
                  {placing && <Loader2 className="size-4 animate-spin" />}
                  {placing
                    ? t("cart.pay.processing")
                    : liveMode
                      ? t("cart.pay.rzp.button")
                      : t("cart.pay.button", { total: formatPrice(subtotal) })}
                </Button>
              </DialogFooter>
              <p className="flex items-center justify-center gap-1.5 text-xs text-muted-foreground">
                <ShieldCheck className="size-3.5" /> {t("cart.pay.secure")}
              </p>
            </>
          )}
        </DialogContent>
      </Dialog>
      <SiteFooter />
    </div>
  );
}