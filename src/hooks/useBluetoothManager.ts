import { useEffect, useMemo, useState } from "react";
import { invoke } from "@tauri-apps/api/core";
import { ensureTransparentWindow } from "../lib/tauriWindow";
import { fallbackSnapshot, normalizeSnapshot } from "../lib/bluetoothSnapshot";
import type { BluetoothDevice, DeviceSnapshot, DeviceStatus, NativeDeviceSnapshot, ViewMode } from "../types/bluetooth";

type DeviceAction = "connect_device" | "disconnect_device" | "set_audio_output";

export function useBluetoothManager() {
  const [snapshot, setSnapshot] = useState<DeviceSnapshot>(fallbackSnapshot);
  const [selectedId, setSelectedId] = useState(fallbackSnapshot.devices[0]?.id ?? "");
  const [viewMode, setViewMode] = useState<ViewMode>("list");
  const [showAirpodsCard, setShowAirpodsCard] = useState(false);
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

  /**
   * 从 Tauri 后端拉取最新快照；失败时保留 fallbackSnapshot 作为可交互预览。
   */
  async function refreshSnapshot(announce = true) {
    setIsRefreshing(true);
    try {
      const nextSnapshot = await invoke<NativeDeviceSnapshot>("get_device_snapshot");
      const normalizedSnapshot = normalizeSnapshot(nextSnapshot);
      setSnapshot(normalizedSnapshot);
      setSelectedId((currentId) => currentId || normalizedSnapshot.devices[0]?.id || "");
      if (announce) {
        setToast("已刷新设备列表");
      }
    } catch {
      setToast("当前使用预览数据");
    } finally {
      window.setTimeout(() => setIsRefreshing(false), 260);
    }
  }

  /**
   * 把前端操作转发给后端命令；成功/失败文案都以原生命令结果为准。
   */
  async function queueAction(action: DeviceAction, deviceId: string) {
    try {
      const message = await invoke<string>(action, { deviceId });
      setToast(message);
      return true;
    } catch (error) {
      setToast(typeof error === "string" ? error : "系统暂未接受这个蓝牙操作");
      return false;
    }
  }

  /**
   * 先在前端乐观更新设备连接状态，让界面立即响应用户操作。
   */
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

  /**
   * 处理连接/断开切换，同时触发后端命令和 AirPods 弹窗状态。
   */
  async function toggleConnection(device: BluetoothDevice) {
    const isConnected = device.status === "Connected";
    updateDeviceStatus(device.id, isConnected ? "Paired" : "Connected");
    setToast(isConnected ? `已断开 ${device.name}` : `正在连接 ${device.name}`);
    const didQueue = await queueAction(isConnected ? "disconnect_device" : "connect_device", device.id);
    await refreshSnapshot(false);
    if (didQueue && !isConnected && device.isAirpods) {
      setAirpodsDismissed(false);
      setShowAirpodsCard(true);
      setViewMode("list");
    }
  }

  /**
   * 从当前快照中删除设备，并修正选中设备和 AirPods 连接状态。
   */
  async function deleteDevice(deviceId: string) {
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
    try {
      const message = await invoke<string>("remove_device", { deviceId });
      setToast(message);
    } catch {
      setToast(`无法从系统删除 ${deviceName}`);
    }
    await refreshSnapshot(false);
  }

  /**
   * 进入设备详情页，并关闭当前展开的删除操作。
   */
  function openDetail(deviceId: string) {
    setSelectedId(deviceId);
    setViewMode("detail");
    setOpenActionId(null);
  }

  function closeAirpodsCard() {
    setAirpodsDismissed(true);
    setShowAirpodsCard(false);
    setToast("已关闭 AirPods 弹窗");
  }

  useEffect(() => {
    void refreshSnapshot();
    void ensureTransparentWindow();
  }, []);

  return {
    snapshot,
    selectedDevice,
    connectedDevice,
    viewMode,
    openActionId,
    isRefreshing,
    toast,
    shouldShowAirpodsCard: showAirpodsCard && snapshot.airpods.connected && !airpodsDismissed,
    closeAirpodsCard,
    deleteDevice,
    openDetail,
    refreshSnapshot,
    setOpenActionId,
    setViewMode,
    toggleConnection,
    useAudioOutput: (deviceId: string) => queueAction("set_audio_output", deviceId),
  };
}
