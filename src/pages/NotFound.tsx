import { Button } from "@/components/ui/button";
import { useI18n } from "@/lib/i18n";
import { Link } from "react-router";

export default function NotFound() {
  const { t } = useI18n();
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-background bg-paper px-4 text-center">
      <span className="flex size-16 items-center justify-center rounded-full bg-primary/10 font-display text-3xl font-bold text-primary">
        क
      </span>
      <h1 className="font-display text-3xl font-semibold tracking-tight">
        {t("nf.title")}
      </h1>
      <p className="max-w-sm text-sm text-muted-foreground">{t("nf.body")}</p>
      <Button asChild className="rounded-full">
        <Link to="/">{t("nf.home")}</Link>
      </Button>
    </div>
  );
}