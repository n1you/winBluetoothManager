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

/**
 * 通用电脑设备图标。
 */
export function ComputerIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M5 5.8h14a1.8 1.8 0 0 1 1.8 1.8v8.2H3.2V7.6A1.8 1.8 0 0 1 5 5.8Z" />
      <path d="M8.4 19h7.2M10.4 15.8 9.8 19M13.6 15.8l.6 3.2" />
    </svg>
  );
}

/**
 * 手机设备图标。
 */
export function PhoneIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M8.2 3.4h7.6a2 2 0 0 1 2 2v13.2a2 2 0 0 1-2 2H8.2a2 2 0 0 1-2-2V5.4a2 2 0 0 1 2-2Z" />
      <path d="M10.4 5.8h3.2M11.3 18.1h1.4" />
    </svg>
  );
}

/**
 * 手表设备图标。
 */
export function WatchIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M9.4 4.3h5.2l.8 3.1H8.6l.8-3.1ZM8.6 16.6h6.8l-.8 3.1H9.4l-.8-3.1Z" />
      <path d="M8.6 7.4h6.8a1.8 1.8 0 0 1 1.8 1.8v5.6a1.8 1.8 0 0 1-1.8 1.8H8.6a1.8 1.8 0 0 1-1.8-1.8V9.2a1.8 1.8 0 0 1 1.8-1.8Z" />
    </svg>
  );
}

/**
 * 触控板设备图标。
 */
export function TrackpadIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M5.5 8.1h13a2 2 0 0 1 2 2v5.8h-17v-5.8a2 2 0 0 1 2-2Z" />
      <path d="M3.5 15.9h17l-1.2 2H4.7l-1.2-2Z" />
    </svg>
  );
}

/**
 * 设置齿轮图标。
 */
export function SettingsIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M12 8.6a3.4 3.4 0 1 0 0 6.8 3.4 3.4 0 0 0 0-6.8Z" />
      <path d="m18.1 10 .9-1.8-2-2-1.8.9a6.8 6.8 0 0 0-1.2-.5L13.4 4h-2.8L10 6.6a6.8 6.8 0 0 0-1.2.5L7 6.2l-2 2 .9 1.8a7 7 0 0 0-.5 1.2L2.8 11.8v2.8l2.6.6c.1.4.3.8.5 1.2L5 18.2l2 2 1.8-.9c.4.2.8.4 1.2.5l.6 2.6h2.8l.6-2.6c.4-.1.8-.3 1.2-.5l1.8.9 2-2-.9-1.8c.2-.4.4-.8.5-1.2l2.6-.6v-2.8l-2.6-.6c-.1-.4-.3-.8-.5-1.2Z" />
    </svg>
  );
}
