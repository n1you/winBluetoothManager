import type { DeviceSnapshot, DeviceStatus, NativeDeviceSnapshot } from "../types/bluetooth";

/**
 * 后端命令不可用或浏览器预览时使用的兜底演示数据。
 */
export const fallbackSnapshot: DeviceSnapshot = {
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

/**
 * 把后端英文状态转换成界面上的中文文案。
 */
export const statusCopy: Record<DeviceStatus, string> = {
  Connected: "已连接",
  Paired: "历史连接",
  Available: "可连接",
};

/**
 * 统一清洗后端快照，保证每个设备都有界面需要的字段。
 */
export function normalizeSnapshot(snapshot: NativeDeviceSnapshot): DeviceSnapshot {
  return {
    ...snapshot,
    devices: snapshot.devices.map((device, index) => ({
      ...device,
      address: device.address ?? fallbackSnapshot.devices[index]?.address ?? makePreviewAddress(device.id, index),
    })),
  };
}

/**
 * 根据设备 id 生成稳定的预览地址，用于后端暂时没返回真实地址的情况。
 */
function makePreviewAddress(id: string, index: number) {
  const seed = Array.from(id).reduce((sum, char) => sum + char.charCodeAt(0), index * 19);
  return Array.from({ length: 6 }, (_, byteIndex) =>
    ((seed + byteIndex * 37) % 256).toString(16).padStart(2, "0").toUpperCase(),
  ).join(":");
}
