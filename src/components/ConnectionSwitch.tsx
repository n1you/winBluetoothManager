import type { MouseEvent } from "react";

/**
 * iOS 风格连接开关，使用 role="switch" 保持可访问性语义。
 */
export function ConnectionSwitch({
  checked,
  label,
  onChange,
}: {
  checked: boolean;
  label: string;
  onChange: (event: MouseEvent<HTMLButtonElement>) => void;
}) {
  return (
    <button
      className={`ios-switch ${checked ? "checked" : ""}`}
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={label}
      onClick={onChange}
    >
      <span />
    </button>
  );
}
