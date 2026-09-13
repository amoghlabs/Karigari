import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from "@/components/ui/input-otp";
import { useI18n } from "@/lib/i18n";

import { useAuth } from "@/hooks/use-auth";
import { api } from "@/convex/_generated/api";
import { useMutation } from "convex/react";
import {
  ArrowRight,
  Hammer,
  Loader2,
  Mail,
  Phone,
  ShoppingBag,
  UserX,
} from "lucide-react";
import { Suspense, useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router";
import { toast } from "sonner";

interface AuthProps {
  redirectAfterAuth?: string;
}

function resolveRedirectAfterAuth(
  returnTo: string | null,
  fallback = "/dashboard",
) {
  if (returnTo?.startsWith("/") && !returnTo.startsWith("//")) {
    return returnTo;
  }
  return fallback;
}

type Flow = "buy" | "artisan";
type OtpStep =
  | { stage: "phone" }
  | { stage: "code"; phone: string; devCode: string };

function BuyFlow({ redirect }: { redirect: string }) {
  const { isLoading: authLoading, isAuthenticated, signIn } = useAuth();
  const { t } = useI18n();
  const navigate = useNavigate();
  const consolidate = useMutation(api.accounts.consolidateMyAccount);
  const [step, setStep] = useState<"signIn" | { email: string }>("signIn");
  const [otp, setOtp] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!authLoading && isAuthenticated) {
      // One email = one account. Fold any earlier account for this email (and
      // its order history) into the one we just signed into, so "Track orders"
      // comes back after a re-login.
      consolidate({}).catch(() => {
        /* non-fatal: sign-in itself already succeeded */
      });
      navigate(redirect);
    }
  }, [authLoading, isAuthenticated, navigate, redirect, consolidate]);

  const handleEmailSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsLoading(true);
    setError(null);
    try {
      const formData = new FormData(event.currentTarget);
      await signIn("email-otp", formData);
      setStep({ email: formData.get("email") as string });
      setIsLoading(false);
    } catch (error) {
      console.error("Email sign-in error:", error);
      setError(
        error instanceof Error
          ? error.message
          : "Failed to send verification code. Please try again.",
      );
      setIsLoading(false);
    }
  };

  const handleOtpSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsLoading(true);
    setError(null);
    try {
      const formData = new FormData(event.currentTarget);
      await signIn("email-otp", formData);
      navigate(redirect);
    } catch (error) {
      console.error("OTP verification error:", error);
      setError(t("auth.otp.wrong"));
      setIsLoading(false);
      setOtp("");
    }
  };

  const handleGuestLogin = async () => {
    setIsLoading(true);
    setError(null);
    try {
      await signIn("anonymous");
      navigate(redirect);
    } catch (error) {
      console.error("Guest login error:", error);
      setError(
        error instanceof Error
          ? error.message
          : "Failed to sign in as guest. Please try again.",
      );
      setIsLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-md rounded-2xl border-border/70 bg-card pb-0 shadow-soft">
      {step === "signIn" ? (
        <>
          <CardHeader className="text-center">
            <CardTitle className="font-display text-2xl tracking-tight">
              {t("auth.buy.title")}
            </CardTitle>
            <CardDescription>{t("auth.buy.sub")}</CardDescription>
          </CardHeader>
          <form onSubmit={handleEmailSubmit}>
            <CardContent>
              <div className="relative flex items-center gap-2">
                <div className="relative flex-1">
                  <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    name="email"
                    placeholder={t("auth.buy.email")}
                    type="email"
                    className="pl-9"
                    disabled={isLoading}
                    required
                  />
                </div>
                <Button type="submit" variant="outline" size="icon" disabled={isLoading}>
                  {isLoading ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <ArrowRight className="h-4 w-4" />
                  )}
                </Button>
              </div>
              {error && <p className="mt-2 text-sm text-destructive">{error}</p>}

              <div className="mt-4">
                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <span className="w-full border-t" />
                  </div>
                  <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-card px-2 text-muted-foreground">
                      {t("auth.buy.or")}
                    </span>
                  </div>
                </div>
                <Button
                  type="button"
                  variant="outline"
                  className="mt-4 w-full"
                  onClick={handleGuestLogin}
                  disabled={isLoading}
                >
                  <UserX className="mr-2 h-4 w-4" />
                  {t("auth.buy.guest")}
                </Button>
              </div>
            </CardContent>
          </form>
        </>
      ) : (
        <>
          <CardHeader className="text-center mt-4">
            <CardTitle>{t("auth.otp.check")}</CardTitle>
            <CardDescription>
              {t("auth.otp.sent", { email: step.email })}
            </CardDescription>
          </CardHeader>
          <form onSubmit={handleOtpSubmit}>
            <CardContent className="pb-4">
              <input type="hidden" name="email" value={step.email} />
              <input type="hidden" name="code" value={otp} />
              <div className="flex justify-center">
                <InputOTP
                  value={otp}
                  onChange={setOtp}
                  maxLength={6}
                  disabled={isLoading}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && otp.length === 6 && !isLoading) {
                      const form = (e.target as HTMLElement).closest("form");
                      if (form) form.requestSubmit();
                    }
                  }}
                >
                  <InputOTPGroup>
                    {Array.from({ length: 6 }).map((_, index) => (
                      <InputOTPSlot key={index} index={index} />
                    ))}
                  </InputOTPGroup>
                </InputOTP>
              </div>
              {error && (
                <p className="mt-2 text-center text-sm text-destructive">{error}</p>
              )}
              <p className="mt-4 text-center text-sm text-muted-foreground">
                {t("auth.otp.tryAgain")}{" "}
                <Button
                  variant="link"
                  className="p-0 h-auto"
                  onClick={() => setStep("signIn")}
                >
                  {t("auth.otp.different")}
                </Button>
              </p>
            </CardContent>
            <CardFooter className="flex-col gap-2">
              <Button
                type="submit"
                className="w-full"
                disabled={isLoading || otp.length !== 6}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    {t("auth.otp.verifying")}
                  </>
                ) : (
                  <>
                    {t("auth.otp.verify")}
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </>
                )}
              </Button>
            </CardFooter>
          </form>
        </>
      )}
    </Card>
  );
}

function ArtisanFlow() {
  const { signIn, isAuthenticated, isLoading: authLoading } = useAuth();
  const { t } = useI18n();
  const navigate = useNavigate();
  const requestPhoneOtp = useMutation(api.phoneOtp.requestPhoneOtp);
  const verifyPhoneOtp = useMutation(api.phoneOtp.verifyPhoneOtp);
  const [step, setStep] = useState<OtpStep>({ stage: "phone" });
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSendCode = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsLoading(true);
    setError(null);
    try {
      // Phone + OTP only: the session behind the scenes is anonymous —
      // no email or password is ever asked of the artisan. If a session
      // already exists, keep it: signing in anonymously again would start a
      // fresh account and detach the artisan from their studio and orders.
      if (!isAuthenticated) {
        try {
          await signIn("anonymous");
        } catch {
          /* session already exists */
        }
      }
      const result = await requestPhoneOtp({ phone });
      setStep({ stage: "code", phone: result.phone, devCode: result.devCode });
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
    if (step.stage !== "code") return;
    setIsLoading(true);
    setError(null);
    try {
      await verifyPhoneOtp({ phone: step.phone, code: otp });
      toast.success(t("st.phone.verified"));
      navigate("/studio");
    } catch (err) {
      console.error("OTP verification error:", err);
      setError(t("st.otp.wrong"));
      setIsLoading(false);
      setOtp("");
    }
  };

  if (step.stage === "phone") {
    return (
      <Card className="w-full max-w-md rounded-2xl border-border/70 bg-card pb-0 shadow-soft">
        <CardHeader className="text-center">
          <span className="mx-auto flex size-12 items-center justify-center rounded-full bg-primary/10 text-primary">
            <Phone className="size-5" />
          </span>
          <CardTitle className="mt-3 font-display text-2xl tracking-tight">
            {t("st.phone.title")}
          </CardTitle>
          <CardDescription>{t("st.phone.sub")}</CardDescription>
        </CardHeader>
        <form onSubmit={handleSendCode}>
          <CardContent>
            <div className="relative">
              <Phone className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                name="phone"
                type="tel"
                inputMode="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder={t("st.phone.placeholder")}
                className="h-12 pl-9 text-base"
                disabled={isLoading}
                required
              />
            </div>
            {error && <p className="mt-2 text-sm text-destructive">{error}</p>}
            <Button
              type="submit"
              size="lg"
              className="tap-lg mt-4 w-full rounded-full text-base"
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
          </CardContent>
        </form>
      </Card>
    );
  }

  return (
    <Card className="w-full max-w-md rounded-2xl border-border/70 bg-card pb-0 shadow-soft">
      <CardHeader className="text-center">
        <CardTitle className="font-display text-2xl tracking-tight">
          {t("st.otp.title")}
        </CardTitle>
        <CardDescription>{t("st.otp.sub", { phone: step.phone })}</CardDescription>
      </CardHeader>
      <form onSubmit={handleVerify}>
        <CardContent>
          <div className="flex justify-center">
            <InputOTP
              value={otp}
              onChange={setOtp}
              maxLength={6}
              disabled={isLoading}
              onKeyDown={(e) => {
                if (e.key === "Enter" && otp.length === 6 && !isLoading) {
                  const form = (e.target as HTMLElement).closest("form");
                  if (form) form.requestSubmit();
                }
              }}
            >
              <InputOTPGroup>
                {Array.from({ length: 6 }).map((_, index) => (
                  <InputOTPSlot key={index} index={index} />
                ))}
              </InputOTPGroup>
            </InputOTP>
          </div>
          {error && <p className="mt-2 text-center text-sm text-destructive">{error}</p>}
          <Button type="submit" size="lg" className="tap-lg mt-5 w-full rounded-full text-base" disabled={isLoading || otp.length !== 6}>
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
          <p className="mt-3 text-center text-sm text-muted-foreground">
            {t("st.otp.resend")}{" "}
            <Button
              variant="link"
              className="h-auto p-0"
              onClick={() => setStep({ stage: "phone" })}
            >
              {t("st.otp.tryAgain")}
            </Button>
          </p>
        </CardContent>
      </form>
    </Card>
  );
}

function Auth({ redirectAfterAuth }: AuthProps = {}) {
  const { t } = useI18n();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const redirect = resolveRedirectAfterAuth(
    searchParams.get("returnTo"),
    redirectAfterAuth,
  );
  const returnTo = searchParams.get("returnTo") ?? "";
  const [flow, setFlow] = useState<Flow>(
    searchParams.get("role") === "artisan" || returnTo.includes("studio")
      ? "artisan"
      : "buy",
  );

  return (
    <div className="flex min-h-screen flex-col bg-paper">
      <header className="mx-auto w-full max-w-6xl px-4 pt-8 sm:px-6">
        <button
          type="button"
          onClick={() => navigate("/")}
          className="flex items-center gap-2.5"
        >
          <span className="flex size-9 items-center justify-center rounded-full bg-primary font-display text-base font-bold text-primary-foreground shadow-soft">
            क
          </span>
          <span className="font-display text-[21px] font-semibold tracking-tight">
            कारी<span className="text-primary">gari</span>
          </span>
        </button>
      </header>

      <div className="flex flex-1 items-center justify-center px-4 py-10">
        <div className="mx-auto flex w-full max-w-4xl flex-col items-center gap-6">
          {/* Role choice */}
          <div className="grid w-full max-w-md grid-cols-2 gap-2 rounded-full border border-border/70 bg-card p-1.5 shadow-soft">
            <button
              type="button"
              onClick={() => setFlow("buy")}
              className={`tap-lg flex items-center justify-center gap-2 rounded-full text-sm font-semibold transition-colors ${
                flow === "buy"
                  ? "bg-primary text-primary-foreground shadow-soft"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <ShoppingBag className="size-4" />
              {t("auth.role.buy")}
            </button>
            <button
              type="button"
              onClick={() => setFlow("artisan")}
              className={`tap-lg flex items-center justify-center gap-2 rounded-full text-sm font-semibold transition-colors ${
                flow === "artisan"
                  ? "bg-secondary text-secondary-foreground shadow-soft"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <Hammer className="size-4" />
              {t("auth.role.artisan")}
            </button>
          </div>

          <p className="max-w-md text-center text-sm leading-6 text-muted-foreground">
            {flow === "buy" ? t("auth.buy.pitch") : t("auth.artisan.pitch")}
          </p>

          {flow === "buy" ? (
            <BuyFlow redirect={redirect} />
          ) : (
            <ArtisanFlow />
          )}
        </div>
      </div>

      <footer className="border-t border-border/60 bg-card/60 py-4 text-center text-xs text-muted-foreground">
        {t("auth.footer")} कारीgari
      </footer>
    </div>
  );
}

export default function AuthPage(props: AuthProps) {
  return (
    <Suspense>
      <Auth {...props} />
    </Suspense>
  );
}