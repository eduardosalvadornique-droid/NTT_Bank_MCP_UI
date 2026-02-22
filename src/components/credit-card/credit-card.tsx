import { HiCheckCircle } from "react-icons/hi";
import type { CSSProperties } from "react";
import type { CreditCard } from "../../lib/types";
import "./credit-card.css";

type Props = {
  card: CreditCard;
  scale?: number;
  showApplyButton?: boolean;
};

export default function CreditCard({
  card,
  scale = 0.8,
  showApplyButton = true,
}: Props) {
  const highlights = (card.highlights ?? []).slice(0, 4);

  const normalizedScale = Number.isFinite(scale) && scale > 0 ? scale : 1;
  const style: CSSProperties = {
    ["--creditCardScale" as any]: normalizedScale,
  };

  const handleApplyClick = () => {
    window.parent?.postMessage({ type: "open_link", url: card.deeplink }, "*");

    // fallback cuando corres standalone en navegador normal
    window.open(card.deeplink, "_blank", "noopener,noreferrer");
  };

  return (
    <article className="custom-card" style={style}>
      <div className="card-image-wrapper">
        <img
          className="card-image"
          src={card.imageUrl || "/assets/card.png"}
          alt={card.name}
        />
      </div>
      <div className="card-body">
        <h3 className="card-title">{card.name}</h3>
        <ul className="card-highlights">
          {highlights.map((highlight) => (
            <li key={highlight}>
              <HiCheckCircle className="card-highlight-icon" />
              <span>{highlight}</span>
            </li>
          ))}
        </ul>

        {showApplyButton ? (
          <button className="card-button" onClick={handleApplyClick}>
            Pídela aquí
          </button>
        ) : null}
      </div>
    </article>
  );
}
