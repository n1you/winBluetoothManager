use serde::Serialize;

#[derive(Serialize)]
#[serde(rename_all = "camelCase")]
struct BluetoothDevice {
    id: String,
    name: String,
    kind: String,
    status: String,
    battery: Option<u8>,
    signal: u8,
    is_airpods: bool,
    audio_role: Option<String>,
    last_seen: String,
}

#[derive(Serialize)]
#[serde(rename_all = "camelCase")]
struct AirPodsStatus {
    connected: bool,
    model: String,
    left_battery: u8,
    right_battery: u8,
    case_battery: u8,
    noise_mode: String,
    microphone: String,
}

#[derive(Serialize)]
#[serde(rename_all = "camelCase")]
struct DeviceSnapshot {
    adapter_name: String,
    adapter_state: String,
    discoverable: bool,
    active_output: String,
    active_input: String,
    devices: Vec<BluetoothDevice>,
    airpods: AirPodsStatus,
}

#[tauri::command]
fn get_device_snapshot() -> DeviceSnapshot {
    DeviceSnapshot {
        adapter_name: "Intel Wireless Bluetooth".into(),
        adapter_state: "Ready".into(),
        discoverable: false,
        active_output: "AirPods Pro".into(),
        active_input: "Studio Display Microphone".into(),
        airpods: AirPodsStatus {
            connected: true,
            model: "AirPods Pro".into(),
            left_battery: 86,
            right_battery: 82,
            case_battery: 58,
            noise_mode: "Adaptive".into(),
            microphone: "Automatic".into(),
        },
        devices: vec![
            BluetoothDevice {
                id: "airpods-pro".into(),
                name: "AirPods Pro".into(),
                kind: "Headphones".into(),
                status: "Connected".into(),
                battery: Some(84),
                signal: 92,
                is_airpods: true,
                audio_role: Some("Output".into()),
                last_seen: "Now".into(),
            },
            BluetoothDevice {
                id: "mx-master".into(),
                name: "MX Master 3S".into(),
                kind: "Mouse".into(),
                status: "Connected".into(),
                battery: Some(71),
                signal: 88,
                is_airpods: false,
                audio_role: None,
                last_seen: "Now".into(),
            },
            BluetoothDevice {
                id: "keychron".into(),
                name: "Keychron K3".into(),
                kind: "Keyboard".into(),
                status: "Paired".into(),
                battery: Some(64),
                signal: 63,
                is_airpods: false,
                audio_role: None,
                last_seen: "4 min ago".into(),
            },
            BluetoothDevice {
                id: "speaker".into(),
                name: "HomePod mini".into(),
                kind: "Speaker".into(),
                status: "Available".into(),
                battery: None,
                signal: 48,
                is_airpods: false,
                audio_role: Some("Output".into()),
                last_seen: "12 min ago".into(),
            },
        ],
    }
}

#[tauri::command]
fn connect_device(device_id: &str) -> Result<String, String> {
    Ok(format!("Queued connection for {device_id}"))
}

#[tauri::command]
fn disconnect_device(device_id: &str) -> Result<String, String> {
    Ok(format!("Queued disconnect for {device_id}"))
}

#[tauri::command]
fn set_audio_output(device_id: &str) -> Result<String, String> {
    Ok(format!("Queued audio output switch for {device_id}"))
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_opener::init())
        .invoke_handler(tauri::generate_handler![
            get_device_snapshot,
            connect_device,
            disconnect_device,
            set_audio_output
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
