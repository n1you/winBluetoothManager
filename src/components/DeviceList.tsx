import { useRef, type PointerEvent } from "react";
import { statusCopy } from "../lib/bluetoothSnapshot";
import type { BluetoothDevice } from "../types/bluetooth";
import { DeviceGlyph } from "./DeviceGlyph";
import { ChevronLeftIcon, RefreshIcon, SettingsIcon } from "./icons";

/**
 * 蓝牙设备列表页：展示适配器状态、当前连接摘要和所有设备行。
 */
export function DeviceList({
  adapterName,
  adapterState,
  connectedDevice,
  devices,
  isRefreshing,
  openActionId,
  onDelete,
  onOpenActions,
  onOpenDetail,
  onRefresh,
}: {
  adapterName: string;
  adapterState: string;
  connectedDevice?: BluetoothDevice;
  devices: BluetoothDevice[];
  isRefreshing: boolean;
  openActionId: string | null;
  onDelete: (deviceId: string) => void;
  onOpenActions: (deviceId: string | null) => void;
  onOpenDetail: (deviceId: string) => void;
  onRefresh: () => void;
}) {
  return (
    <>
      <header className="popover-header">
        <div>
          <p className="eyebrow">{adapterState === "Ready" ? "Online" : adapterState}</p>
          <h1>Your Devices</h1>
        </div>
        <button className="icon-button" type="button" aria-label="刷新蓝牙设备" onClick={onRefresh}>
          {isRefreshing ? <RefreshIcon active /> : <SettingsIcon />}
        </button>
      </header>

      <section className="list-section" aria-label="连接列表">
        <div className="section-title">
          <h2>{connectedDevice?.name ?? adapterName}</h2>
          <span>{devices.length} devices</span>
        </div>

        <div className="device-list">
          {devices.map((device) => (
            <SwipeDeviceRow
              device={device}
              isActionsOpen={openActionId === device.id}
              key={device.id}
              onDelete={() => onDelete(device.id)}
              onOpenActions={() => onOpenActions(openActionId === device.id ? null : device.id)}
              onOpenDetail={() => onOpenDetail(device.id)}
            />
          ))}
        </div>
      </section>
    </>
  );
}

/**
 * 单个设备行：支持点击进入详情、开关连接，以及左滑/按钮展开删除操作。
 */
function SwipeDeviceRow({
  device,
  isActionsOpen,
  onDelete,
  onOpenActions,
  onOpenDetail,
}: {
  device: BluetoothDevice;
  isActionsOpen: boolean;
  onDelete: () => void;
  onOpenActions: () => void;
  onOpenDetail: () => void;
}) {
  const swipeStartX = useRef<number | null>(null);
  const ignoreNextClick = useRef(false);

  /**
   * 通过横向位移判断是否触发“展开删除按钮”的手势。
   */
  function handlePointerUp(event: PointerEvent<HTMLButtonElement>) {
    if (swipeStartX.current === null) return;
    const deltaX = event.clientX - swipeStartX.current;
    swipeStartX.current = null;

    if (Math.abs(deltaX) > 34) {
      ignoreNextClick.current = true;
      onOpenActions();
    }
  }

  /**
   * 手势触发后会忽略下一次 click，避免左滑后误进入详情。
   */
  function handleOpenDetail() {
    if (ignoreNextClick.current) {
      ignoreNextClick.current = false;
      return;
    }

    if (isActionsOpen) {
      onOpenActions();
    } else {
      onOpenDetail();
    }
  }

  return (
    <div className={`swipe-row ${isActionsOpen ? "actions-open" : ""}`}>
      <button className="delete-action" type="button" tabIndex={isActionsOpen ? 0 : -1} onClick={onDelete}>
        删除
      </button>
      <div className="row-surface">
        <button
          className="row-main"
          type="button"
          onClick={handleOpenDetail}
          onPointerDown={(event) => {
            swipeStartX.current = event.clientX;
          }}
          onPointerCancel={() => {
            swipeStartX.current = null;
          }}
          onPointerUp={handlePointerUp}
        >
          <DeviceGlyph kind={device.kind} isAirpods={device.isAirpods} />
          <span className="device-copy">
            <span className="device-name">{device.name}</span>
            <span className="device-meta" aria-label={`${device.name} 状态`}>
              {statusCopy[device.status]} · {device.lastSeen}
            </span>
          </span>
        </button>
        <BatteryIndicator value={device.battery} isConnected={device.status === "Connected"} />
      </div>
      <button className="swipe-hint" type="button" aria-label={`显示 ${device.name} 删除按钮`} onClick={onOpenActions}>
        <ChevronLeftIcon />
      </button>
    </div>
  );
}

function BatteryIndicator({ value, isConnected }: { value: number | null; isConnected: boolean }) {
  const normalizedValue = Math.max(0, Math.min(value ?? 0, 100));
  const displayValue = value === null ? "--" : `${value}%`;

  return (
    <span className="battery-indicator" aria-label={`电量 ${displayValue}`}>
      <span className="battery-percent">{displayValue}</span>
      <span className={`battery-icon ${isConnected ? "active" : ""}`} aria-hidden="true">
        <span style={{ width: `${normalizedValue}%` }} />
      </span>
    </span>
  );
}
