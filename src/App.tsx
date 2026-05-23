import { useEffect, useMemo, useRef, useState } from "react";
import { invoke } from "@tauri-apps/api/core";
import "./App.css";

type DeviceStatus = "Connected" | "Paired" | "Available";
type ViewMode = "list" | "detail";

type BluetoothDevice = {
  id: string;
  name: string;
  address: string;
  kind: string;
  status: DeviceStatus;
  battery: number | null;
  signal: number;
  isAirpods: boolean;
  audioRole: string | null;
  lastSeen: string;
};

type AirPodsStatus = {
  connected: boolean;
  model: string;
  leftBattery: number;
  rightBattery: number;
  caseBattery: number;
  noiseMode: string;
  microphone: string;
};

type DeviceSnapshot = {
  adapterName: string;
  adapterState: string;
  discoverable: boolean;
  activeOutput: string;
  activeInput: string;
  devices: BluetoothDevice[];
  airpods: AirPodsStatus;
};

type NativeBluetoothDevice = Omit<BluetoothDevice, "address"> & {
  address?: string;
};

type NativeDeviceSnapshot = Omit<DeviceSnapshot, "devices"> & {
  devices: NativeBluetoothDevice[];
};

const fallbackSnapshot: DeviceSnapshot = {
  adapterName: "Intel Wireless Bluetooth",
  adapterState: "Ready",
  discoverable: false,
  activeOutput: "AirPods Pro",
  activeInput: "Studio Display Microphone",
  airpods: {
    connected: true,
    model: "AirPods Pro",
    leftBattery: 86,
    rightBattery: 82,
    caseBattery: 58,
    noiseMode: "Adaptive",
    microphone: "Automatic",
  },
  devices: [
    {
      id: "airpods-pro",
      name: "AirPods Pro",
      address: "F8:4E:17:91:2C:A0",
      kind: "Headphones",
      status: "Connected",
      battery: 84,
      signal: 92,
      isAirpods: true,
      audioRole: "Output",
      lastSeen: "Now",
    },
    {
      id: "mx-master",
      name: "MX Master 3S",
      address: "C4:34:6B:57:11:2D",
      kind: "Mouse",
      status: "Connected",
      battery: 71,
      signal: 88,
      isAirpods: false,
      audioRole: null,
      lastSeen: "Now",
    },
    {
      id: "keychron",
      name: "Keychron K3",
      address: "A1:09:E3:44:90:7B",
      kind: "Keyboard",
      status: "Paired",
      battery: 64,
      signal: 63,
      isAirpods: false,
      audioRole: null,
      lastSeen: "4 min ago",
    },
    {
      id: "speaker",
      name: "HomePod mini",
      address: "08:B6:1F:03:E2:5C",
      kind: "Speaker",
      status: "Available",
      battery: null,
      signal: 48,
      isAirpods: false,
      audioRole: "Output",
      lastSeen: "12 min ago",
    },
  ],
};

const statusCopy: Record<DeviceStatus, string> = {
  Connected: "已连接",
  Paired: "历史连接",
  Available: "可连接",
};

function normalizeSnapshot(snapshot: NativeDeviceSnapshot): DeviceSnapshot {
  return {
    ...snapshot,
    devices: snapshot.devices.map((device, index) => ({
      ...device,
      address: device.address ?? fallbackSnapshot.devices[index]?.address ?? makePreviewAddress(device.id, index),
    })),
  };
}

function makePreviewAddress(id: string, index: number) {
  const seed = Array.from(id).reduce((sum, char) => sum + char.charCodeAt(0), index * 19);
  return Array.from({ length: 6 }, (_, byteIndex) =>
    ((seed + byteIndex * 37) % 256).toString(16).padStart(2, "0").toUpperCase(),
  ).join(":");
}

async function withCurrentWindow(action: "close" | "minimize" | "startDragging") {
  if (!("__TAURI_INTERNALS__" in window)) return;

  try {
    const { getCurrentWindow } = await import("@tauri-apps/api/window");
    await getCurrentWindow()[action]();
  } catch {
    // Browser preview has no native window to control.
  }
}

async function ensureTransparentWindow() {
  if (!("__TAURI_INTERNALS__" in window)) return;

  try {
    const [{ getCurrentWindow }, { getCurrentWebviewWindow }] = await Promise.all([
      import("@tauri-apps/api/window"),
      import("@tauri-apps/api/webviewWindow"),
    ]);
    const currentWindow = getCurrentWindow();
    await currentWindow.setBackgroundColor([0, 0, 0, 0]);
    await getCurrentWebviewWindow().setBackgroundColor([0, 0, 0, 0]).catch(() => undefined);
    await currentWindow.setShadow(true);
  } catch {
    // Browser preview has no native window to tune.
  }
}

function App() {
  const [snapshot, setSnapshot] = useState<DeviceSnapshot>(fallbackSnapshot);
  const [selectedId, setSelectedId] = useState(fallbackSnapshot.devices[0]?.id ?? "");
  const [viewMode, setViewMode] = useState<ViewMode>("list");
  const [showAirpodsCard, setShowAirpodsCard] = useState(fallbackSnapshot.airpods.connected);
  const [openActionId, setOpenActionId] = useState<string | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [toast, setToast] = useState("蓝牙已就绪");
  const [airpodsDismissed, setAirpodsDismissed] = useState(false);

  const selectedDevice = useMemo(
    () => snapshot.devices.find((device) => device.id === selectedId) ?? snapshot.devices[0],
    [selectedId, snapshot.devices],
  );

  const connectedDevice = useMemo(
    () => snapshot.devices.find((device) => device.status === "Connected"),
    [snapshot.devices],
  );

  async function refreshSnapshot() {
    setIsRefreshing(true);
    try {
      const nextSnapshot = await invoke<NativeDeviceSnapshot>("get_device_snapshot");
      const normalizedSnapshot = normalizeSnapshot(nextSnapshot);
      setSnapshot(normalizedSnapshot);
      setSelectedId((currentId) => currentId || normalizedSnapshot.devices[0]?.id || "");
      setToast("已刷新设备列表");
    } catch {
      setToast("当前使用预览数据");
    } finally {
      window.setTimeout(() => setIsRefreshing(false), 260);
    }
  }

  async function queueAction(action: "connect_device" | "disconnect_device" | "set_audio_output", deviceId: string) {
    try {
      const message = await invoke<string>(action, { deviceId });
      setToast(message);
    } catch {
      setToast("原生命令暂不可用，已在界面模拟");
    }
  }

  function updateDeviceStatus(deviceId: string, status: DeviceStatus) {
    setSnapshot((current) => ({
      ...current,
      devices: current.devices.map((device) => (device.id === deviceId ? { ...device, status, lastSeen: "Now" } : device)),
      airpods:
        current.devices.find((device) => device.id === deviceId)?.isAirpods === true
          ? { ...current.airpods, connected: status === "Connected" }
          : current.airpods,
    }));
  }

  function handleToggleConnection(device: BluetoothDevice) {
    const isConnected = device.status === "Connected";
    updateDeviceStatus(device.id, isConnected ? "Paired" : "Connected");
    void queueAction(isConnected ? "disconnect_device" : "connect_device", device.id);
    setToast(isConnected ? `已断开 ${device.name}` : `正在连接 ${device.name}`);
    if (!isConnected && device.isAirpods) {
      setAirpodsDismissed(false);
      setShowAirpodsCard(true);
      setViewMode("list");
    }
  }

  function handleDeleteDevice(deviceId: string) {
    const deviceName = snapshot.devices.find((device) => device.id === deviceId)?.name ?? "设备";
    setSnapshot((current) => {
      const nextDevices = current.devices.filter((device) => device.id !== deviceId);
      return {
        ...current,
        devices: nextDevices,
        airpods:
          current.devices.find((device) => device.id === deviceId)?.isAirpods === true
            ? { ...current.airpods, connected: false }
            : current.airpods,
      };
    });
    if (selectedId === deviceId) {
      const nextDevice = snapshot.devices.find((device) => device.id !== deviceId);
      setSelectedId(nextDevice?.id ?? "");
      setViewMode("list");
    }
    setOpenActionId(null);
    setToast(`已删除 ${deviceName}`);
  }

  function openDetail(deviceId: string) {
    setSelectedId(deviceId);
    setViewMode("detail");
    setOpenActionId(null);
  }

  useEffect(() => {
    void refreshSnapshot();
    void ensureTransparentWindow();
  }, []);

  const shouldShowAirpodsCard = showAirpodsCard && snapshot.airpods.connected && !airpodsDismissed;

  return (
    <main className="stage">
      <section className="phone-popover" aria-label="蓝牙管理">
        <WindowBar
          onClose={() => {
            void withCurrentWindow("close");
          }}
          onMinimize={() => {
            void withCurrentWindow("minimize");
          }}
          onStartDrag={() => {
            void withCurrentWindow("startDragging");
          }}
        />

        {shouldShowAirpodsCard ? (
          <AirPodsConnectCard
            airpods={snapshot.airpods}
            outputName={snapshot.activeOutput}
            onClose={() => {
              setAirpodsDismissed(true);
              setShowAirpodsCard(false);
              setToast("已关闭 AirPods 弹窗");
            }}
          />
        ) : (
          <>
            {viewMode === "list" ? (
              <DeviceList
                adapterName={snapshot.adapterName}
                adapterState={snapshot.adapterState}
                connectedDevice={connectedDevice}
                devices={snapshot.devices}
                isRefreshing={isRefreshing}
                openActionId={openActionId}
                onDelete={handleDeleteDevice}
                onOpenActions={setOpenActionId}
                onOpenDetail={openDetail}
                onRefresh={refreshSnapshot}
                onToggle={handleToggleConnection}
              />
            ) : (
              <DeviceDetail
                device={selectedDevice}
                onBack={() => setViewMode("list")}
                onConnect={handleToggleConnection}
                onDelete={handleDeleteDevice}
                onUseAudio={(deviceId) => {
                  void queueAction("set_audio_output", deviceId);
                  setToast("已切换音频输出");
                }}
              />
            )}

            <p className="toast" role="status">
              {toast}
            </p>
          </>
        )}
      </section>
    </main>
  );
}

function WindowBar({
  onClose,
  onMinimize,
  onStartDrag,
}: {
  onClose: () => void;
  onMinimize: () => void;
  onStartDrag: () => void;
}) {
  return (
    <div className="window-bar" onPointerDown={onStartDrag}>
      <div className="window-controls" aria-label="窗口操作" onPointerDown={(event) => event.stopPropagation()}>
        <button className="window-control close" type="button" aria-label="关闭窗口" onClick={onClose} />
        <button className="window-control minimize" type="button" aria-label="最小化窗口" onClick={onMinimize} />
      </div>
      <div className="popover-grabber" aria-hidden="true" />
    </div>
  );
}

function DeviceList({
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

  function handlePointerUp(event: React.PointerEvent<HTMLButtonElement>) {
    if (swipeStartX.current === null) return;
    const deltaX = event.clientX - swipeStartX.current;
    swipeStartX.current = null;

    if (Math.abs(deltaX) > 34) {
      ignoreNextClick.current = true;
      onOpenActions();
    }
  }

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

function DeviceDetail({
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
        <InfoRow label="信号强度" value={`${device.signal}%`} />
        <InfoRow label="电量" value={device.battery === null ? "外接供电" : `${device.battery}%`} />
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

function AirPodsConnectCard({
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

function ConnectionSwitch({
  checked,
  label,
  onChange,
}: {
  checked: boolean;
  label: string;
  onChange: (event: React.MouseEvent<HTMLButtonElement>) => void;
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

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="info-row">
      <span>{label}</span>
      <strong>{value}</strong>
    </div>
  );
}

function BatteryCell({ label, value }: { label: string; value: number }) {
  return (
    <div className="battery-cell">
      <span>{label}</span>
      <strong>{value}%</strong>
      <div className="battery-track">
        <span style={{ width: `${value}%` }} />
      </div>
    </div>
  );
}

function DeviceGlyph({ kind, isAirpods }: { kind: string; isAirpods: boolean }) {
  return <span className={`device-glyph ${isAirpods ? "airpods" : ""}`}>{isAirpods ? <AirPodsTinyIcon /> : <KindIcon kind={kind} />}</span>;
}

function KindIcon({ kind }: { kind: string }) {
  if (kind === "Mouse") return <MouseIcon />;
  if (kind === "Keyboard") return <KeyboardIcon />;
  if (kind === "Speaker") return <AudioIcon />;
  if (kind === "Headphones") return <AirPodsTinyIcon />;
  return <BluetoothIcon />;
}

function BluetoothIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="m7.5 6.4 9 11.2-4.5 3.1V3.3l4.5 3.1-9 11.2" />
    </svg>
  );
}

function RefreshIcon({ active }: { active: boolean }) {
  return (
    <svg className={active ? "spinning" : ""} viewBox="0 0 24 24" aria-hidden="true">
      <path d="M20 6.8v4.6h-4.6M4 17.2v-4.6h4.6" />
      <path d="M18.1 10.7A6.7 6.7 0 0 0 6.7 7M5.9 13.3A6.7 6.7 0 0 0 17.3 17" />
    </svg>
  );
}

function ChevronLeftIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="m15 5-7 7 7 7" />
    </svg>
  );
}

function CloseIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M7 7l10 10M17 7 7 17" />
    </svg>
  );
}

function AudioIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M5 14.5H3.8A1.8 1.8 0 0 1 2 12.7v-1.4a1.8 1.8 0 0 1 1.8-1.8H5l5-4v13l-5-4Z" />
      <path d="M15.8 8.2a5.3 5.3 0 0 1 0 7.6M18.6 5.4a9.2 9.2 0 0 1 0 13.2" />
    </svg>
  );
}

function AirPodsTinyIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M8.2 3.6a3.1 3.1 0 0 0-3.1 3.1v3.1a2 2 0 0 0 2 2h1.1V7.3" />
      <path d="M15.8 3.6a3.1 3.1 0 0 1 3.1 3.1v3.1a2 2 0 0 1-2 2h-1.1V7.3" />
      <path d="M8.2 11.8v7.7a1.4 1.4 0 1 1-2.8 0v-7.7M15.8 11.8v7.7a1.4 1.4 0 1 0 2.8 0v-7.7" />
    </svg>
  );
}

function MouseIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M12 3.2a5.8 5.8 0 0 0-5.8 5.8v6a5.8 5.8 0 0 0 11.6 0V9A5.8 5.8 0 0 0 12 3.2Z" />
      <path d="M12 3.2v6" />
    </svg>
  );
}

function KeyboardIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M4.5 6.5h15A2.5 2.5 0 0 1 22 9v6a2.5 2.5 0 0 1-2.5 2.5h-15A2.5 2.5 0 0 1 2 15V9a2.5 2.5 0 0 1 2.5-2.5Z" />
      <path d="M6 10h.1M10 10h.1M14 10h.1M18 10h.1M6 14h8" />
    </svg>
  );
}

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

export default App;
