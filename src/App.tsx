import "./App.css";
import { AirPodsConnectCard } from "./components/AirPodsConnectCard";
import { DeviceDetail } from "./components/DeviceDetail";
import { DeviceList } from "./components/DeviceList";
import { WindowBar } from "./components/WindowBar";
import { useBluetoothManager } from "./hooks/useBluetoothManager";
import { withCurrentWindow } from "./lib/tauriWindow";

/**
 * 应用主组件：负责组装窗口、列表、详情和 AirPods 弹窗。
 */
function App() {
  const bluetooth = useBluetoothManager();

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

        {bluetooth.shouldShowAirpodsCard ? (
          <AirPodsConnectCard
            airpods={bluetooth.snapshot.airpods}
            outputName={bluetooth.snapshot.activeOutput}
            onClose={bluetooth.closeAirpodsCard}
          />
        ) : (
          <>
            {bluetooth.viewMode === "list" ? (
              <DeviceList
                adapterName={bluetooth.snapshot.adapterName}
                adapterState={bluetooth.snapshot.adapterState}
                connectedDevice={bluetooth.connectedDevice}
                devices={bluetooth.snapshot.devices}
                isRefreshing={bluetooth.isRefreshing}
                openActionId={bluetooth.openActionId}
                onDelete={(deviceId) => {
                  void bluetooth.deleteDevice(deviceId);
                }}
                onOpenActions={bluetooth.setOpenActionId}
                onOpenDetail={bluetooth.openDetail}
                onRefresh={bluetooth.refreshSnapshot}
              />
            ) : (
              <DeviceDetail
                device={bluetooth.selectedDevice}
                onBack={() => bluetooth.setViewMode("list")}
                onConnect={(device) => {
                  void bluetooth.toggleConnection(device);
                }}
                onDelete={(deviceId) => {
                  void bluetooth.deleteDevice(deviceId);
                }}
                onUseAudio={(deviceId) => {
                  void bluetooth.useAudioOutput(deviceId);
                }}
              />
            )}

            <p className="toast" role="status">
              {bluetooth.toast}
            </p>
          </>
        )}
      </section>
    </main>
  );
}

export default App;
