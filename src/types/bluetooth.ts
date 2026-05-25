/**
 * 前端用到的设备连接状态，目前和后端返回的字符串保持一致。
 */
export type DeviceStatus = "Connected" | "Paired" | "Available";

export type ViewMode = "list" | "detail";

/**
 * 单个蓝牙设备在界面中需要展示和操作的数据。
 */
export type BluetoothDevice = {
  id: string;
  name: string;
  address: string;
  kind: string;
  status: DeviceStatus;
  battery: number | null;
  signal: number | null;
  isAirpods: boolean;
  audioRole: string | null;
  lastSeen: string;
};

/**
 * AirPods 弹窗需要的专属状态。
 */
export type AirPodsStatus = {
  connected: boolean;
  model: string;
  leftBattery: number | null;
  rightBattery: number | null;
  caseBattery: number | null;
  noiseMode: string;
  microphone: string;
};

/**
 * 一次蓝牙状态快照：包含适配器、音频输入输出、设备列表和 AirPods 状态。
 */
export type DeviceSnapshot = {
  adapterName: string;
  adapterState: string;
  discoverable: boolean;
  activeOutput: string;
  activeInput: string;
  devices: BluetoothDevice[];
  airpods: AirPodsStatus;
};

/**
 * 后端可能省略 address，前端会在 normalizeSnapshot 里补一个展示用地址。
 */
export type NativeBluetoothDevice = Omit<BluetoothDevice, "address"> & {
  address?: string;
};

export type NativeDeviceSnapshot = Omit<DeviceSnapshot, "devices"> & {
  devices: NativeBluetoothDevice[];
};
