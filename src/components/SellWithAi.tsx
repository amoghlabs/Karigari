import { useEffect, useState, type ComponentType } from "react";
import { useNavigate } from "react-router";
import { motion } from "framer-motion";
import {
  Camera,
  Check,
  IndianRupee,
  Languages,
  Loader2,
  Mic,
  PencilLine,
  Rocket,
  Sparkles,
  Wand2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useI18n } from "@/lib/i18n";
import { cn } from "@/lib/utils";

type Icon = ComponentType<{ className?: string }>;

/** The "Sell with AI" production line — the platform's flagship flow. */
export type SellStepKey =
  | "photo"
  | "voice"
  | "enhance"
  | "write"
  | "translate"
  | "price"
  | "live";

/** done = finished, active = AI working right now, next = the next thing to do. */
export type SellStepState = "done" | "active" | "next" | "todo";

export const SELL_AI_STEPS: { key: SellStepKey; icon: Icon }[] = [
  { key: "photo", icon: Camera },
  { key: "voice", icon: Mic },
  { key: "enhance", icon: Wand2 },
  { key: "write", icon: PencilLine },
  { key: "translate", icon: Languages },
  { key: "price", icon: IndianRupee },
  { key: "live", icon: Rocket },
];

/**
 * The artisan's own progress through Sell with AI. Every state is derived from
 * what has actually happened (photo taken, words spoken, photo enhanced,
 * listing described, translated, priced, published) — so the tracker never
 * claims work that hasn't happened.
 */
export function SellWithAiTracker({
  states,
}: {
  states: Record<SellStepKey, SellStepState>;
}) {
  const { t } = useI18n();
  return (
    <ol className="grid gap-1 sm:grid-cols-2">
      {SELL_AI_STEPS.map((step, i) => {
        const state = states[step.key];
        return (
          <li
            key={step.key}
            className={cn(
              "flex items-center gap-2.5 rounded-lg px-2.5 py-1.5 transition-colors",
              state === "active" && "bg-primary/10",
              state === "next" && "bg-secondary/60",
            )}
          >
            <span
              className={cn(
                "flex size-6 shrink-0 items-center justify-center rounded-full border text-[10px] font-semibold",
                state === "done"
                  ? "border-primary bg-primary text-primary-foreground"
                  : state === "active"
                    ? "border-primary bg-card text-primary"
                    : "border-border bg-card text-muted-foreground",
              )}
            >
              {state === "done" ? (
                <Check className="size-3.5" />
              ) : state === "active" ? (
                <Loader2 className="size-3.5 animate-spin" />
              ) : (
                <step.icon className="size-3.5" />
              )}
            </span>
            <span
              className={cn(
                "flex-1 text-[13px] leading-5",
                state === "done"
                  ? "text-foreground"
                  : state === "active"
                    ? "font-semibold text-primary"
                    : state === "next"
                      ? "font-medium text-foreground"
                      : "text-muted-foreground",
              )}
            >
              {t(`swa.step.${step.key}`)}
            </span>
            {state === "active" && (
              <span className="shrink-0 text-[10px] font-semibold uppercase tracking-[0.1em] text-primary">
                {t("swa.working")}
              </span>
            )}
            {state === "todo" && (
              <span className="shrink-0 text-[10px] font-medium text-muted-foreground/60">
                {i + 1}
              </span>
            )}
          </li>
        );
      })}
    </ol>
  );
}

/** Live status line shown while the pipeline is running. */
export function SellWithAiStatus({ stage }: { stage: SellStepKey | null }) {
  const { t } = useI18n();
  if (!stage) return null;
  const label: Record<SellStepKey, string> = {
    photo: "swa.step.photo",
    voice: "swa.step.voice",
    enhance: "swa.work.enhance",
    write: "swa.work.write",
    translate: "swa.work.translate",
    price: "swa.work.price",
    live: "swa.work.live",
  };
  return (
    <p className="flex items-center gap-2 rounded-lg bg-primary/10 px-3 py-2 text-xs font-semibold text-primary">
      <Loader2 className="size-3.5 animate-spin" />
      {t(label[stage])}
    </p>
  );
}

/**
 * Landing-page pitch for Sell with AI: the seven-step line the platform walks
 * on the artisan's behalf, animating through a loop so the flow is visible
 * before anyone signs up.
 */
export function SellWithAiSection() {
  const { t } = useI18n();
  const navigate = useNavigate();
  const [demo, setDemo] = useState(0);

  useEffect(() => {
    const id = window.setInterval(
      () => setDemo((d) => (d + 1) % (SELL_AI_STEPS.length + 3)),
      1100,
    );
    return () => window.clearInterval(id);
  }, []);

  const states = SELL_AI_STEPS.reduce(
    (acc, step, i) => {
      acc[step.key] = i < demo ? "done" : i === demo ? "active" : "todo";
      return acc;
    },
    {} as Record<SellStepKey, SellStepState>,
  );
  const activeStep = SELL_AI_STEPS[demo];

  return (
    <section className="border-y border-border/70 bg-card">
      <div className="mx-auto grid w-full max-w-6xl items-center gap-12 px-4 py-16 sm:px-6 lg:grid-cols-2">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.45 }}
        >
          <p className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.16em] text-primary">
            <Sparkles className="size-3.5" />
            {t("sellai.eyebrow")}
          </p>
          <h2 className="mt-3 font-display text-3xl font-semibold leading-tight tracking-tight sm:text-4xl">
            {t("sellai.title")}
          </h2>
          <p className="mt-4 text-sm leading-7 text-muted-foreground sm:text-base">
            {t("sellai.sub")}
          </p>

          <ul className="mt-6 space-y-3">
            {[
              { icon: Camera, key: "sellai.do1" },
              { icon: Mic, key: "sellai.do2" },
            ].map((item) => (
              <li key={item.key} className="flex items-start gap-3">
                <span className="mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                  <item.icon className="size-4" />
                </span>
                <span className="text-sm leading-6 text-foreground/90">
                  {t(item.key)}
                </span>
              </li>
            ))}
          </ul>

          <p className="mt-5 text-sm font-medium text-foreground">
            {t("sellai.rest")}
          </p>

          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Button
              size="lg"
              className="h-12 rounded-full px-7 text-base shadow-soft"
              onClick={() => navigate("/auth?role=artisan")}
            >
              <Sparkles className="size-4" />
              {t("sellai.cta")}
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="h-12 rounded-full px-7 text-base"
              onClick={() => navigate("/shop")}
            >
              {t("sellai.cta2")}
            </Button>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.45, delay: 0.1 }}
          className="rounded-3xl border border-primary/20 bg-background/80 p-5 shadow-soft-lg backdrop-blur sm:p-6"
        >
          <div className="flex items-center justify-between gap-3">
            <p className="flex items-center gap-2 font-display text-base font-semibold tracking-tight">
              <span className="flex size-7 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                <Sparkles className="size-3.5" />
              </span>
              {t("sellai.pipeline")}
            </p>
            <span className="rounded-full border border-border bg-card px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.12em] text-muted-foreground">
              {t("sellai.live")}
            </span>
          </div>

          <div className="mt-4">
            <SellWithAiTracker states={states} />
          </div>

          <div className="mt-4 flex items-center gap-2 rounded-xl border border-border/70 bg-card px-3 py-2.5">
            {activeStep ? (
              <>
                <Loader2 className="size-3.5 shrink-0 animate-spin text-primary" />
                <p className="truncate text-xs font-medium text-muted-foreground">
                  {t(
                    activeStep.key === "enhance" ||
                      activeStep.key === "write" ||
                      activeStep.key === "translate" ||
                      activeStep.key === "price" ||
                      activeStep.key === "live"
                      ? `swa.work.${activeStep.key}`
                      : `swa.step.${activeStep.key}`,
                  )}
                </p>
              </>
            ) : (
              <>
                <Check className="size-3.5 shrink-0 text-primary" />
                <p className="truncate text-xs font-medium text-muted-foreground">
                  {t("swa.step.live")}
                </p>
              </>
            )}
          </div>

          <p className="mt-4 flex items-center gap-1.5 text-xs text-muted-foreground">
            {t("sellai.note")}
          </p>
        </motion.div>
      </div>
    </section>
  );
}

/** Small inline badge used to name the flow wherever listings are created. */
export function SellWithAiBadge({ className }: { className?: string }) {
  const { t } = useI18n();
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.12em] text-primary",
        className,
      )}
    >
      <Sparkles className="size-3" />
      {t("sellai.eyebrow")}
    </span>
  );
}
