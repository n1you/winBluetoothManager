import { useEffect, useMemo, useState } from "react";
import { invoke } from "@tauri-apps/api/core";
import "./App.css";

type DeviceStatus = "Connected" | "Paired" | "Available";

type BluetoothDevice = {
  id: string;
  name: string;
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

const navItems = [
  { label: "Devices", icon: "bluetooth", active: true },
  { label: "AirPods", icon: "airpods", active: false },
  { label: "Audio", icon: "audio", active: false },
  { label: "Automation", icon: "spark", active: false },
];

function App() {
  const [snapshot, setSnapshot] = useState<DeviceSnapshot>(fallbackSnapshot);
  const [selectedId, setSelectedId] = useState("airpods-pro");
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [toast, setToast] = useState("Ready");

  const selectedDevice = useMemo(
    () => snapshot.devices.find((device) => device.id === selectedId) ?? snapshot.devices[0],
    [selectedId, snapshot.devices],
  );

  async function refreshSnapshot() {
    setIsRefreshing(true);
    try {
      const nextSnapshot = await invoke<DeviceSnapshot>("get_device_snapshot");
      setSnapshot(nextSnapshot);
      setToast("Device snapshot refreshed");
    } catch {
      setToast("Using preview data until Windows APIs are connected");
    } finally {
      setTimeout(() => setIsRefreshing(false), 260);
    }
  }

  async function queueAction(action: "connect_device" | "disconnect_device" | "set_audio_output", deviceId: string) {
    try {
      const message = await invoke<string>(action, { deviceId });
      setToast(message);
    } catch {
      setToast("Native command is not available in browser preview");
    }
  }

  useEffect(() => {
    refreshSnapshot();
  }, []);

  return (
    <main className="shell">
      <aside className="sidebar" aria-label="Primary navigation">
        <div className="traffic-lights" aria-hidden="true">
          <span className="traffic-dot close" />
          <span className="traffic-dot minimize" />
          <span className="traffic-dot zoom" />
        </div>

        <div className="brand-lockup">
          <div className="brand-mark" aria-hidden="true">
            <BluetoothIcon />
          </div>
          <div>
            <p className="eyebrow">Control Center</p>
            <h1>Bluetooth</h1>
          </div>
        </div>

        <nav className="nav-list">
          {navItems.map((item) => (
            <button className={`nav-item ${item.active ? "active" : ""}`} key={item.label}>
              <NavIcon name={item.icon} />
              <span>{item.label}</span>
            </button>
          ))}
        </nav>

        <div className="adapter-card">
          <div className="adapter-status">
            <span className="pulse-dot" />
            <span>{snapshot.adapterState}</span>
          </div>
          <strong>{snapshot.adapterName}</strong>
          <p>{snapshot.discoverable ? "Visible to nearby devices" : "Hidden from new devices"}</p>
        </div>
      </aside>

      <section className="workspace">
        <header className="topbar">
          <div>
            <p className="eyebrow">Windows device manager</p>
            <h2>Paired devices</h2>
          </div>
          <div className="topbar-actions">
            <button className="icon-button" type="button" aria-label="Search devices">
              <SearchIcon />
            </button>
            <button className="primary-button" type="button" onClick={refreshSnapshot}>
              <RefreshIcon active={isRefreshing} />
              <span>{isRefreshing ? "Scanning" : "Scan"}</span>
            </button>
          </div>
        </header>

        <div className="content-grid">
          <section className="device-column" aria-label="Bluetooth devices">
            <div className="section-heading">
              <div>
                <h3>Nearby</h3>
                <p>{snapshot.devices.length} devices in range</p>
              </div>
              <span className="soft-pill">Live</span>
            </div>

            <div className="device-list">
              {snapshot.devices.map((device) => (
                <button
                  className={`device-row ${device.id === selectedDevice?.id ? "selected" : ""}`}
                  key={device.id}
                  type="button"
                  onClick={() => setSelectedId(device.id)}
                >
                  <DeviceGlyph kind={device.kind} isAirpods={device.isAirpods} />
                  <span className="device-copy">
                    <span className="device-name">{device.name}</span>
                    <span className="device-meta">
                      {device.kind} · {device.lastSeen}
                    </span>
                  </span>
                  <span className="device-signals">
                    <StatusPill status={device.status} />
                    <span className="battery-text">
                      {device.battery === null ? "AC" : `${device.battery}%`}
                    </span>
                  </span>
                </button>
              ))}
            </div>
          </section>

          <section className="detail-column" aria-label="Selected device controls">
            <div className="airpods-panel">
              <div className="airpods-hero">
                <div>
                  <p className="eyebrow">Featured device</p>
                  <h3>{snapshot.airpods.model}</h3>
                  <p className="muted">
                    {snapshot.airpods.connected ? "Connected for media output" : "Ready to connect"}
                  </p>
                </div>
                <AirPodsIllustration />
              </div>

              <div className="battery-grid" aria-label="AirPods battery levels">
                <BatteryCell label="Left" value={snapshot.airpods.leftBattery} />
                <BatteryCell label="Right" value={snapshot.airpods.rightBattery} />
                <BatteryCell label="Case" value={snapshot.airpods.caseBattery} />
              </div>

              <div className="segmented-control" aria-label="Noise control">
                {["Off", "Transparency", snapshot.airpods.noiseMode].map((mode) => (
                  <button className={mode === snapshot.airpods.noiseMode ? "selected" : ""} key={mode} type="button">
                    {mode}
                  </button>
                ))}
              </div>
            </div>

            <div className="detail-panel">
              <div className="section-heading compact">
                <div>
                  <h3>{selectedDevice?.name}</h3>
                  <p>{selectedDevice?.kind}</p>
                </div>
                {selectedDevice && <StatusPill status={selectedDevice.status} />}
              </div>

              <div className="metrics">
                <Metric label="Signal" value={`${selectedDevice?.signal ?? 0}%`} />
                <Metric label="Battery" value={selectedDevice?.battery === null ? "AC" : `${selectedDevice?.battery}%`} />
                <Metric label="Audio" value={selectedDevice?.audioRole ?? "None"} />
              </div>

              <div className="action-strip">
                <button
                  className="secondary-button"
                  type="button"
                  onClick={() =>
                    selectedDevice &&
                    queueAction(selectedDevice.status === "Connected" ? "disconnect_device" : "connect_device", selectedDevice.id)
                  }
                >
                  <PowerIcon />
                  <span>{selectedDevice?.status === "Connected" ? "Disconnect" : "Connect"}</span>
                </button>
                <button
                  className="secondary-button"
                  type="button"
                  onClick={() => selectedDevice && queueAction("set_audio_output", selectedDevice.id)}
                >
                  <AudioIcon />
                  <span>Use for audio</span>
                </button>
              </div>
            </div>

            <div className="audio-panel">
              <div>
                <p className="eyebrow">Audio route</p>
                <h3>{snapshot.activeOutput}</h3>
                <p className="muted">Input: {snapshot.activeInput}</p>
              </div>
              <div className="route-meter" aria-hidden="true">
                <span />
                <span />
                <span />
                <span />
              </div>
            </div>
          </section>
        </div>

        <p className="toast" role="status">
          {toast}
        </p>
      </section>
    </main>
  );
}

function StatusPill({ status }: { status: DeviceStatus }) {
  return <span className={`status-pill ${status.toLowerCase()}`}>{status}</span>;
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

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className="metric">
      <span>{label}</span>
      <strong>{value}</strong>
    </div>
  );
}

function NavIcon({ name }: { name: string }) {
  if (name === "airpods") return <AirPodsTinyIcon />;
  if (name === "audio") return <AudioIcon />;
  if (name === "spark") return <SparkIcon />;
  return <BluetoothIcon />;
}

function DeviceGlyph({ kind, isAirpods }: { kind: string; isAirpods: boolean }) {
  return <span className={`device-glyph ${isAirpods ? "airpods" : ""}`}>{isAirpods ? <AirPodsTinyIcon /> : <KindIcon kind={kind} />}</span>;
}

function KindIcon({ kind }: { kind: string }) {
  if (kind === "Mouse") return <MouseIcon />;
  if (kind === "Keyboard") return <KeyboardIcon />;
  if (kind === "Speaker") return <AudioIcon />;
  return <BluetoothIcon />;
}

function BluetoothIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="m7.5 6.4 9 11.2-4.5 3.1V3.3l4.5 3.1-9 11.2" />
    </svg>
  );
}

function SearchIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="m15.7 15.7 4.1 4.1M18 10.8a7.2 7.2 0 1 1-14.4 0 7.2 7.2 0 0 1 14.4 0Z" />
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

function PowerIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M12 3v8" />
      <path d="M7.2 6.6a8 8 0 1 0 9.6 0" />
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

function SparkIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M12 3.8 13.7 9l5.4 1.7-5.4 1.7L12 17.6l-1.7-5.2-5.4-1.7L10.3 9 12 3.8Z" />
      <path d="m18.5 15.3.8 2.2 2.2.8-2.2.8-.8 2.2-.8-2.2-2.2-.8 2.2-.8.8-2.2Z" />
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
