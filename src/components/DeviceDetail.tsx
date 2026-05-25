import { statusCopy } from "../lib/bluetoothSnapshot";
import type { BluetoothDevice } from "../types/bluetooth";
import { ConnectionSwitch } from "./ConnectionSwitch";
import { DeviceGlyph } from "./DeviceGlyph";
import { ChevronLeftIcon } from "./icons";
import { InfoRow } from "./InfoRow";

/**
 * 设备详情页：展示当前设备的完整属性和连接、删除、设为音频输出操作。
 */
export function DeviceDetail({
  device,
  onBack,
  onConnect,
  onDelete,
  onUseAudio,
}: {
  device?: BluetoothDevice;
  onBack: () => void;
  onConnect: (device: BluetoothDevice) => void;
  onDelete: (deviceId: string) => void;
  onUseAudio: (deviceId: string) => void;
}) {
  if (!device) {
    return (
      <section className="empty-state">
        <button className="nav-button" type="button" onClick={onBack}>
          <ChevronLeftIcon />
          返回
        </button>
        <p>没有可显示的蓝牙设备</p>
      </section>
    );
  }

  return (
    <>
      <header className="detail-header">
        <button className="nav-button" type="button" onClick={onBack}>
          <ChevronLeftIcon />
          蓝牙
        </button>
        <button className="danger-text-button" type="button" onClick={() => onDelete(device.id)}>
          删除
        </button>
      </header>

      <section className="detail-hero">
        <DeviceGlyph kind={device.kind} isAirpods={device.isAirpods} />
        <h1>{device.name}</h1>
        <p>{statusCopy[device.status]}</p>
        <ConnectionSwitch
          checked={device.status === "Connected"}
          label={`${device.name} ${device.status === "Connected" ? "断开" : "连接"}`}
          onChange={() => onConnect(device)}
        />
      </section>

      <section className="info-group" aria-label="蓝牙信息">
        <InfoRow label="名称" value={device.name} />
        <InfoRow label="蓝牙地址" value={device.address} />
        <InfoRow label="设备类型" value={device.kind} />
        <InfoRow label="信号强度" value={device.signal === null ? "系统未返回" : `${device.signal}%`} />
        <InfoRow label="电量" value={device.battery === null ? "系统未返回" : `${device.battery}%`} />
        <InfoRow label="音频角色" value={device.audioRole ?? "无"} />
      </section>

      <section className="detail-actions" aria-label="设备操作">
        <button className="primary-action" type="button" onClick={() => onConnect(device)}>
          {device.status === "Connected" ? "断开连接" : "发起连接"}
        </button>
        <button className="secondary-action" type="button" onClick={() => onUseAudio(device.id)}>
          设为音频输出
        </button>
      </section>
    </>
  );
}
