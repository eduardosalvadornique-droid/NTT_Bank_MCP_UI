import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import type { CreditCard } from "../lib/types";
import { useOpenAiGlobal } from "../lib/hooks";
import CreditCardComp from "../components/credit-card/credit-card";

export default function CardDashboard() {
  const [cards, setCards] = useState<CreditCard[]>([]);
  const [dashboardCount, setDashboardCount] = useState<number | null>(null);
  const [searchParams] = useSearchParams();
  const toolOutput = useOpenAiGlobal("toolOutput");

  useEffect(() => {
    const list = toolOutput?.cardList || [];
    setCards(list);
  }, [toolOutput]);

  useEffect(() => {
    let cancelled = false;

    const loadDashboardCount = async () => {
      if (typeof window === "undefined") return;
      if (!window.isSecureContext) return;
      if (typeof window.openai?.callTool !== "function") return;

      try {
        const res = await window.openai.callTool("get_dashboard_count", {});
        const rawCount =
          (res as any)?.structuredContent?.count ??
          (res as any)?.structured_content?.count;
        const parsedCount = Number.parseInt(String(rawCount), 10);

        if (!cancelled && Number.isFinite(parsedCount) && parsedCount >= 0) {
          setDashboardCount(parsedCount);
        }
      } catch {
        if (!cancelled) setDashboardCount(null);
      }
    };

    loadDashboardCount();
    return () => {
      cancelled = true;
    };
  }, []);

  const visibleCards = useMemo(() => {
    if (dashboardCount === null) return cards;
    return cards.slice(0, dashboardCount);
  }, [cards, dashboardCount]);

  const hideApplyButton = useMemo(() => {
    const raw = searchParams.get("hideApplyButton");
    if (!raw) return false;
    const normalized = raw.trim().toLowerCase();
    return normalized === "1" || normalized === "true" || normalized === "yes";
  }, [searchParams]);

  return (
    <div className="w-full bg-transparent">
      <div className="mx-auto max-w-[1200px]">
        {/* MOBILE SLIDER */}
        <div
          className="
          flex gap-6
          overflow-x-auto overflow-y-hidden
          px-6
          snap-x snap-mandatory
          scroll-smooth
          lg:hidden
        "
        >
          {visibleCards.map((card) => (
            <div
              key={card.id}
              className="
              snap-center shrink-0
              w-full max-w-[350px]
            "
            >
              <CreditCardComp card={card} showApplyButton={!hideApplyButton} />
            </div>
          ))}
        </div>

        {/* DESKTOP GRID */}
        <section
          className="
          hidden lg:grid
          grid-cols-3
          justify-items-center
          gap-10
          px-6
        "
        >
          {visibleCards.map((card) => (
            <div key={card.id} className="w-[320px]">
              <CreditCardComp card={card} showApplyButton={!hideApplyButton} />
            </div>
          ))}
        </section>
      </div>
    </div>
  );
}
