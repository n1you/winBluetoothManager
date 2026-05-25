import type { AirPodsStatus } from "../types/bluetooth";
import { CloseIcon } from "./icons";
import { InfoRow } from "./InfoRow";

/**
 * AirPods 连接弹窗：模拟系统风格弹层，集中展示电量和音频状态。
 */
export function AirPodsConnectCard({
  airpods,
  outputName,
  onClose,
}: {
  airpods: AirPodsStatus;
  outputName: string;
  onClose: () => void;
}) {
  return (
    <section className="airpods-card" aria-label="AirPods 连接弹窗">
      <button className="airpods-close" type="button" aria-label="关闭 AirPods 弹窗" onClick={onClose}>
        <CloseIcon />
      </button>
      <AirPodsIllustration />
      <div className="airpods-copy">
        <h1>{airpods.model}</h1>
        <p>已连接到 {outputName}</p>
      </div>
      <div className="airpods-battery" aria-label="AirPods 电量">
        <BatteryCell label="左耳" value={airpods.leftBattery} />
        <BatteryCell label="右耳" value={airpods.rightBattery} />
        <BatteryCell label="充电盒" value={airpods.caseBattery} />
      </div>
      <div className="airpods-meta">
        <InfoRow label="降噪模式" value={airpods.noiseMode} />
        <InfoRow label="麦克风" value={airpods.microphone} />
      </div>
      <button className="primary-action" type="button" onClick={onClose}>
        完成
      </button>
    </section>
  );
}

/**
 * 电量格子：展示百分比和对应宽度的进度条。
 */
function BatteryCell({ label, value }: { label: string; value: number | null }) {
  const displayValue = value === null ? "--" : `${value}%`;
  const trackWidth = `${value ?? 0}%`;

  return (
    <div className="battery-cell">
      <span>{label}</span>
      <strong>{displayValue}</strong>
      <div className="battery-track">
        <span style={{ width: trackWidth }} />
      </div>
    </div>
  );
}

/**
 * AirPods 大插画，由 CSS 组合耳机和充电盒形状。
 */
function AirPodsIllustration() {
  return (
    <div className="airpods-illustration" aria-hidden="true">
      <span className="bud left">
        <span />
      </span>
      <span className="bud right">
        <span />
      </span>
      <span className="case">
        <span />
      </span>
    </div>
  );
}
