import { useState } from "react";
import FlowSelect from "../components/flow-select/flow-select";
import {
  RANGE_EARINGS_OPTIONS,
  type RangeEaringsOptionValue,
} from "../mock/range-earings";

export default function RangeEarings() {
  const [value, setValue] = useState<RangeEaringsOptionValue | null>(null);
  return (
    <div className="w-full max-w-md mx-auto p-6">
      <h2>Selecciona tu rango salarial</h2>
      <FlowSelect
        ariaLabel="Rango de ganancias"
        options={[...RANGE_EARINGS_OPTIONS]}
        value={value}
        onChange={(next) => {
          const v = next as RangeEaringsOptionValue;
          setValue(v);

          window.parent?.postMessage(
            { type: "range_earnings_selected", value: v },
            "*",
          );

          console.log("value sent");
        }}
      />
    </div>
  );
}
