import { AirPodsTinyIcon, AudioIcon, BluetoothIcon, KeyboardIcon, MouseIcon } from "./icons";

/**
 * 根据设备类型决定列表和详情里的图标外观。
 */
export function DeviceGlyph({ kind, isAirpods }: { kind: string; isAirpods: boolean }) {
  return (
    <span className={`device-glyph ${isAirpods ? "airpods" : ""}`}>
      {isAirpods ? <AirPodsTinyIcon /> : <KindIcon kind={kind} />}
    </span>
  );
}

/**
 * 普通设备类型到图标组件的映射。
 */
function KindIcon({ kind }: { kind: string }) {
  if (kind === "Mouse") return <MouseIcon />;
  if (kind === "Keyboard") return <KeyboardIcon />;
  if (kind === "Speaker") return <AudioIcon />;
  if (kind === "Headphones") return <AirPodsTinyIcon />;
  return <BluetoothIcon />;
}
