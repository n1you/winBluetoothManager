/**
 * 通用蓝牙图标。
 */
export function BluetoothIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="m7.5 6.4 9 11.2-4.5 3.1V3.3l4.5 3.1-9 11.2" />
    </svg>
  );
}

/**
 * 刷新按钮图标，active 时配合 CSS 旋转动画。
 */
export function RefreshIcon({ active }: { active: boolean }) {
  return (
    <svg className={active ? "spinning" : ""} viewBox="0 0 24 24" aria-hidden="true">
      <path d="M20 6.8v4.6h-4.6M4 17.2v-4.6h4.6" />
      <path d="M18.1 10.7A6.7 6.7 0 0 0 6.7 7M5.9 13.3A6.7 6.7 0 0 0 17.3 17" />
    </svg>
  );
}

/**
 * 返回/左滑提示用的左箭头图标。
 */
export function ChevronLeftIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="m15 5-7 7 7 7" />
    </svg>
  );
}

/**
 * 关闭按钮图标。
 */
export function CloseIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M7 7l10 10M17 7 7 17" />
    </svg>
  );
}

/**
 * 扬声器/音频输出设备图标。
 */
export function AudioIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M5 14.5H3.8A1.8 1.8 0 0 1 2 12.7v-1.4a1.8 1.8 0 0 1 1.8-1.8H5l5-4v13l-5-4Z" />
      <path d="M15.8 8.2a5.3 5.3 0 0 1 0 7.6M18.6 5.4a9.2 9.2 0 0 1 0 13.2" />
    </svg>
  );
}

/**
 * 小尺寸 AirPods 图标，用在列表和详情里的设备类型标识。
 */
export function AirPodsTinyIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M8.2 3.6a3.1 3.1 0 0 0-3.1 3.1v3.1a2 2 0 0 0 2 2h1.1V7.3" />
      <path d="M15.8 3.6a3.1 3.1 0 0 1 3.1 3.1v3.1a2 2 0 0 1-2 2h-1.1V7.3" />
      <path d="M8.2 11.8v7.7a1.4 1.4 0 1 1-2.8 0v-7.7M15.8 11.8v7.7a1.4 1.4 0 1 0 2.8 0v-7.7" />
    </svg>
  );
}

/**
 * 鼠标设备图标。
 */
export function MouseIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M12 3.2a5.8 5.8 0 0 0-5.8 5.8v6a5.8 5.8 0 0 0 11.6 0V9A5.8 5.8 0 0 0 12 3.2Z" />
      <path d="M12 3.2v6" />
    </svg>
  );
}

/**
 * 键盘设备图标。
 */
export function KeyboardIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M4.5 6.5h15A2.5 2.5 0 0 1 22 9v6a2.5 2.5 0 0 1-2.5 2.5h-15A2.5 2.5 0 0 1 2 15V9a2.5 2.5 0 0 1 2.5-2.5Z" />
      <path d="M6 10h.1M10 10h.1M14 10h.1M18 10h.1M6 14h8" />
    </svg>
  );
}
