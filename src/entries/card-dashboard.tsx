import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import type { CreditCard } from "../lib/types";
import { useOpenAiGlobal } from "../lib/hooks";
import CreditCardComp from "../components/credit-card/credit-card";

type DashboardCountResponseMessage = {
  type: "dashboard_count_response";
  count?: unknown;
  value?: unknown;
};

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
    if (typeof window === "undefined") return;

    const parentOrigin = (() => {
      try {
        return document.referrer ? new URL(document.referrer).origin : null;
      } catch {
        return null;
      }
    })();

    const parseCount = (raw: unknown) => {
      const parsed = Number.parseInt(String(raw), 10);
      if (!Number.isFinite(parsed) || parsed < 0) return null;
      return parsed;
    };

    const onMessage = (event: MessageEvent) => {
      if (parentOrigin && event.origin !== parentOrigin) return;

      const data = event.data as DashboardCountResponseMessage | undefined;
      if (!data || data.type !== "dashboard_count_response") return;

      const parsed = parseCount(data.count ?? data.value);
      if (parsed !== null) {
        setDashboardCount(parsed);
      }
    };

    window.addEventListener("message", onMessage);

    // Ask parent wrapper for the dashboard count.
    if (window.parent && window.parent !== window) {
      window.parent.postMessage(
        {
          type: "dashboard_count_request",
        },
        parentOrigin ?? "*",
      );
    }

    return () => {
      window.removeEventListener("message", onMessage);
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
