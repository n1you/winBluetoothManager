import { useRef, type PointerEvent } from "react";
import { statusCopy } from "../lib/bluetoothSnapshot";
import type { BluetoothDevice } from "../types/bluetooth";
import { ConnectionSwitch } from "./ConnectionSwitch";
import { DeviceGlyph } from "./DeviceGlyph";
import { BluetoothIcon, ChevronLeftIcon, RefreshIcon } from "./icons";

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
  onToggle,
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
  onToggle: (device: BluetoothDevice) => void;
}) {
  return (
    <>
      <header className="popover-header">
        <div>
          <p className="eyebrow">{adapterState === "Ready" ? "已开启" : adapterState}</p>
          <h1>蓝牙</h1>
        </div>
        <button className="icon-button" type="button" aria-label="刷新蓝牙设备" onClick={onRefresh}>
          <RefreshIcon active={isRefreshing} />
        </button>
      </header>

      <section className="connection-summary" aria-label="当前连接">
        <div className="summary-icon" aria-hidden="true">
          <BluetoothIcon />
        </div>
        <div>
          <span>当前连接</span>
          <strong>{connectedDevice?.name ?? "未连接"}</strong>
          <p>{adapterName}</p>
        </div>
      </section>

      <section className="list-section" aria-label="连接列表">
        <div className="section-title">
          <h2>连接列表</h2>
          <span>{devices.length} 台</span>
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
              onToggle={() => onToggle(device)}
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
  onToggle,
}: {
  device: BluetoothDevice;
  isActionsOpen: boolean;
  onDelete: () => void;
  onOpenActions: () => void;
  onOpenDetail: () => void;
  onToggle: () => void;
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
            <span className="device-meta">
              {statusCopy[device.status]} · {device.lastSeen}
            </span>
          </span>
        </button>
        <ConnectionSwitch
          checked={device.status === "Connected"}
          label={`${device.name} ${device.status === "Connected" ? "断开" : "连接"}`}
          onChange={() => {
            onToggle();
          }}
        />
      </div>
      <button className="swipe-hint" type="button" aria-label={`显示 ${device.name} 删除按钮`} onClick={onOpenActions}>
        <ChevronLeftIcon />
      </button>
    </div>
  );
}
