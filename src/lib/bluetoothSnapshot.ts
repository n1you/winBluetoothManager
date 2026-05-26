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
    model: "Arlen 的 AirPods Max",
    leftBattery: 86,
    rightBattery: 82,
    caseBattery: 58,
    noiseMode: "Adaptive",
    microphone: "Automatic",
  },
  devices: [
    {
      id: "this-pc",
      name: "This PC",
      address: "00:1A:7D:DA:71:13",
      kind: "Computer",
      status: "Connected",
      battery: 100,
      signal: 100,
      isAirpods: false,
      audioRole: null,
      lastSeen: "Now",
    },
    {
      id: "iphone-15-pro",
      name: "Arlen 的 iPhone 15 Pro",
      address: "B0:72:BF:44:C1:98",
      kind: "Phone",
      status: "Paired",
      battery: 87,
      signal: 86,
      isAirpods: false,
      audioRole: null,
      lastSeen: "2 min ago",
    },
    {
      id: "day-watch",
      name: "Day Watch",
      address: "48:D7:05:9B:3D:22",
      kind: "Watch",
      status: "Available",
      battery: 92,
      signal: 78,
      isAirpods: false,
      audioRole: null,
      lastSeen: "Now",
    },
    {
      id: "airpods-pro",
      name: "Arlen 的 AirPods Max",
      address: "F8:4E:17:91:2C:A0",
      kind: "Headphones",
      status: "Connected",
      battery: 56,
      signal: 92,
      isAirpods: true,
      audioRole: "Output",
      lastSeen: "Now",
    },
    {
      id: "macbook-pro",
      name: "Arlen 的 MacBook Pro",
      address: "C8:69:CD:6B:28:A4",
      kind: "Computer",
      status: "Connected",
      battery: 100,
      signal: 88,
      isAirpods: false,
      audioRole: null,
      lastSeen: "Now",
    },
    {
      id: "trackpad",
      name: "Arlen 的 Trackpad",
      address: "A1:09:E3:44:90:7B",
      kind: "Trackpad",
      status: "Paired",
      battery: 80,
      signal: 63,
      isAirpods: false,
      audioRole: null,
      lastSeen: "4 min ago",
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
