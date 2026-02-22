import { useId, useMemo, useState, type CSSProperties } from "react";
import "./flow-select.css";

export type FlowSelectOption = {
  value: string;
  label: string;
  disabled?: boolean;
};

type Props = {
  options: Array<FlowSelectOption | string>;
  scale?: number;
  value?: string;
  defaultValue?: string;
  onChange?: (value: string) => void;
  className?: string;
  ariaLabel?: string;
};

function normalizeOptions(
  options: Array<FlowSelectOption | string>,
): FlowSelectOption[] {
  return options.map((option) =>
    typeof option === "string"
      ? {
          value: option,
          label: option,
        }
      : option,
  );
}

export default function FlowSelect({
  options,
  scale = 1,
  value,
  defaultValue,
  onChange,
  className = "",
  ariaLabel = "Selector",
}: Props) {
  const groupId = useId();
  const normalizedOptions = useMemo(() => normalizeOptions(options), [options]);
  const isControlled = value !== undefined;

  const [uncontrolledValue, setUncontrolledValue] = useState<
    string | undefined
  >(() => {
    if (defaultValue !== undefined) return defaultValue;
    return normalizedOptions.find((o) => !o.disabled)?.value;
  });

  const selectedValue = isControlled ? value : uncontrolledValue;

  const setSelected = (nextValue: string) => {
    if (!isControlled) setUncontrolledValue(nextValue);
    onChange?.(nextValue);
  };

  const enabledValues = normalizedOptions
    .filter((o) => !o.disabled)
    .map((o) => o.value);

  const moveSelection = (direction: 1 | -1) => {
    if (enabledValues.length === 0) return;

    const currentIndex = selectedValue
      ? enabledValues.indexOf(selectedValue)
      : -1;
    const safeIndex = currentIndex >= 0 ? currentIndex : 0;
    const nextIndex =
      (safeIndex + direction + enabledValues.length) % enabledValues.length;
    setSelected(enabledValues[nextIndex]);
  };

  const normalizedScale = Number.isFinite(scale) && scale > 0 ? scale : 1;
  const style: CSSProperties = {
    ["--flowSelectScale" as any]: normalizedScale,
  };

  return (
    <div
      className={`flowSelect ${className}`}
      style={style}
      role="radiogroup"
      aria-label={ariaLabel}
      onKeyDown={(event) => {
        if (event.key === "ArrowDown" || event.key === "ArrowRight") {
          event.preventDefault();
          moveSelection(1);
        }
        if (event.key === "ArrowUp" || event.key === "ArrowLeft") {
          event.preventDefault();
          moveSelection(-1);
        }
      }}
    >
      {normalizedOptions.map((option) => {
        const selected = option.value === selectedValue;
        const disabled = !!option.disabled;

        return (
          <button
            key={option.value}
            id={`${groupId}-${option.value}`}
            type="button"
            role="radio"
            aria-checked={selected}
            aria-disabled={disabled}
            disabled={disabled}
            className={`flowSelect__option ${selected ? "isSelected" : ""}`}
            onClick={() => {
              if (!disabled) setSelected(option.value);
            }}
          >
            <span
              className={`flowSelect__dot ${selected ? "isSelected" : ""}`}
              aria-hidden="true"
            />
            <span className="flowSelect__label">{option.label}</span>
          </button>
        );
      })}
    </div>
  );
}
