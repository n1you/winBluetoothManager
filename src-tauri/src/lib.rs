use serde::Serialize;

/// 单个蓝牙设备返回给前端的展示数据。
#[derive(Clone, Serialize)]
#[serde(rename_all = "camelCase")]
struct BluetoothDevice {
    id: String,
    name: String,
    address: String,
    kind: String,
    status: String,
    battery: Option<u8>,
    signal: Option<u8>,
    is_airpods: bool,
    audio_role: Option<String>,
    last_seen: String,
}

/// AirPods 专属连接状态，用于前端的 AirPods 弹窗。
#[derive(Serialize)]
#[serde(rename_all = "camelCase")]
struct AirPodsStatus {
    connected: bool,
    model: String,
    left_battery: Option<u8>,
    right_battery: Option<u8>,
    case_battery: Option<u8>,
    noise_mode: String,
    microphone: String,
}

/// 前端一次刷新拿到的完整蓝牙快照。
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
    bluetooth_platform::get_device_snapshot()
}

#[tauri::command]
fn connect_device(device_id: &str) -> Result<String, String> {
    bluetooth_platform::connect_device(device_id)
}

#[tauri::command]
fn disconnect_device(device_id: &str) -> Result<String, String> {
    bluetooth_platform::disconnect_device(device_id)
}

#[tauri::command]
fn remove_device(device_id: &str) -> Result<String, String> {
    bluetooth_platform::remove_device(device_id)
}

#[tauri::command]
fn set_audio_output(_device_id: &str) -> Result<String, String> {
    Err("默认音频输出切换还没接入 Windows Core Audio".into())
}

fn preview_snapshot(adapter_state: &str) -> DeviceSnapshot {
    DeviceSnapshot {
        adapter_name: "Intel Wireless Bluetooth".into(),
        adapter_state: adapter_state.into(),
        discoverable: false,
        active_output: "AirPods Pro".into(),
        active_input: "Studio Display Microphone".into(),
        airpods: AirPodsStatus {
            connected: true,
            model: "AirPods Pro".into(),
            left_battery: Some(86),
            right_battery: Some(82),
            case_battery: Some(58),
            noise_mode: "Adaptive".into(),
            microphone: "Automatic".into(),
        },
        devices: vec![
            BluetoothDevice {
                id: "airpods-pro".into(),
                name: "AirPods Pro".into(),
                address: "F8:4E:17:91:2C:A0".into(),
                kind: "Headphones".into(),
                status: "Connected".into(),
                battery: Some(84),
                signal: Some(92),
                is_airpods: true,
                audio_role: Some("Output".into()),
                last_seen: "Now".into(),
            },
            BluetoothDevice {
                id: "mx-master".into(),
                name: "MX Master 3S".into(),
                address: "C4:34:6B:57:11:2D".into(),
                kind: "Mouse".into(),
                status: "Connected".into(),
                battery: Some(71),
                signal: Some(88),
                is_airpods: false,
                audio_role: None,
                last_seen: "Now".into(),
            },
            BluetoothDevice {
                id: "keychron".into(),
                name: "Keychron K3".into(),
                address: "A1:09:E3:44:90:7B".into(),
                kind: "Keyboard".into(),
                status: "Paired".into(),
                battery: Some(64),
                signal: Some(63),
                is_airpods: false,
                audio_role: None,
                last_seen: "4 min ago".into(),
            },
            BluetoothDevice {
                id: "speaker".into(),
                name: "HomePod mini".into(),
                address: "08:B6:1F:03:E2:5C".into(),
                kind: "Speaker".into(),
                status: "Available".into(),
                battery: None,
                signal: Some(48),
                is_airpods: false,
                audio_role: Some("Output".into()),
                last_seen: "12 min ago".into(),
            },
        ],
    }
}

#[cfg(not(windows))]
mod bluetooth_platform {
    use super::{preview_snapshot, DeviceSnapshot};

    pub fn get_device_snapshot() -> DeviceSnapshot {
        preview_snapshot("Preview")
    }

    pub fn connect_device(_device_id: &str) -> Result<String, String> {
        Err("真实蓝牙连接仅支持 Windows 运行环境".into())
    }

    pub fn disconnect_device(_device_id: &str) -> Result<String, String> {
        Err("真实蓝牙断开仅支持 Windows 运行环境".into())
    }

    pub fn remove_device(_device_id: &str) -> Result<String, String> {
        Err("真实蓝牙删除仅支持 Windows 运行环境".into())
    }
}

#[cfg(windows)]
mod bluetooth_platform {
    use super::{AirPodsStatus, BluetoothDevice, DeviceSnapshot};
    use std::{
        collections::HashSet,
        ffi::c_void,
        mem::{size_of, zeroed},
        ptr::{null, null_mut},
    };

    type Bool = i32;
    type Dword = u32;
    type Handle = *mut c_void;

    const BLUETOOTH_MAX_NAME_SIZE: usize = 248;
    const BLUETOOTH_SERVICE_DISABLE: Dword = 0x0000_0000;
    const BLUETOOTH_SERVICE_ENABLE: Dword = 0x0000_0001;
    const ERROR_SUCCESS: Dword = 0;
    const MAX_SERVICE_COUNT: usize = 32;

    const SERVICE_AUDIO_SOURCE: Guid = Guid::from_values(
        0x0000_110a,
        0x0000,
        0x1000,
        [0x80, 0x00, 0x00, 0x80, 0x5f, 0x9b, 0x34, 0xfb],
    );
    const SERVICE_AUDIO_SINK: Guid = Guid::from_values(
        0x0000_110b,
        0x0000,
        0x1000,
        [0x80, 0x00, 0x00, 0x80, 0x5f, 0x9b, 0x34, 0xfb],
    );
    const SERVICE_AV_REMOTE_CONTROL: Guid = Guid::from_values(
        0x0000_110e,
        0x0000,
        0x1000,
        [0x80, 0x00, 0x00, 0x80, 0x5f, 0x9b, 0x34, 0xfb],
    );
    const SERVICE_HEADSET: Guid = Guid::from_values(
        0x0000_1108,
        0x0000,
        0x1000,
        [0x80, 0x00, 0x00, 0x80, 0x5f, 0x9b, 0x34, 0xfb],
    );
    const SERVICE_HANDSFREE: Guid = Guid::from_values(
        0x0000_111e,
        0x0000,
        0x1000,
        [0x80, 0x00, 0x00, 0x80, 0x5f, 0x9b, 0x34, 0xfb],
    );
    const SERVICE_HUMAN_INTERFACE_DEVICE: Guid = Guid::from_values(
        0x0000_1124,
        0x0000,
        0x1000,
        [0x80, 0x00, 0x00, 0x80, 0x5f, 0x9b, 0x34, 0xfb],
    );

    #[repr(C)]
    #[derive(Clone, Copy, Eq, Hash, PartialEq)]
    struct Guid {
        data1: u32,
        data2: u16,
        data3: u16,
        data4: [u8; 8],
    }

    impl Guid {
        const fn from_values(data1: u32, data2: u16, data3: u16, data4: [u8; 8]) -> Self {
            Self {
                data1,
                data2,
                data3,
                data4,
            }
        }
    }

    #[repr(C)]
    #[derive(Clone, Copy)]
    struct BluetoothAddress {
        value: u64,
    }

    #[repr(C)]
    #[derive(Clone, Copy)]
    struct SystemTime {
        year: u16,
        month: u16,
        day_of_week: u16,
        day: u16,
        hour: u16,
        minute: u16,
        second: u16,
        milliseconds: u16,
    }

    #[repr(C)]
    #[derive(Clone, Copy)]
    struct BluetoothDeviceSearchParams {
        dw_size: Dword,
        return_authenticated: Bool,
        return_remembered: Bool,
        return_unknown: Bool,
        return_connected: Bool,
        issue_inquiry: Bool,
        timeout_multiplier: u8,
        radio: Handle,
    }

    #[repr(C)]
    #[derive(Clone, Copy)]
    struct BluetoothDeviceInfo {
        dw_size: Dword,
        address: BluetoothAddress,
        class_of_device: Dword,
        connected: Bool,
        remembered: Bool,
        authenticated: Bool,
        last_seen: SystemTime,
        last_used: SystemTime,
        name: [u16; BLUETOOTH_MAX_NAME_SIZE],
    }

    #[repr(C)]
    struct BluetoothFindRadioParams {
        dw_size: Dword,
    }

    #[repr(C)]
    struct BluetoothRadioInfo {
        dw_size: Dword,
        address: BluetoothAddress,
        name: [u16; BLUETOOTH_MAX_NAME_SIZE],
        class_of_device: Dword,
        lmp_subversion: u16,
        manufacturer: u16,
    }

    #[link(name = "Bthprops")]
    unsafe extern "system" {
        fn BluetoothFindFirstRadio(
            params: *const BluetoothFindRadioParams,
            radio: *mut Handle,
        ) -> Handle;
        fn BluetoothFindRadioClose(find: Handle) -> Bool;
        fn BluetoothGetRadioInfo(radio: Handle, radio_info: *mut BluetoothRadioInfo) -> Dword;
        fn BluetoothIsDiscoverable(radio: Handle) -> Bool;
        fn BluetoothFindFirstDevice(
            params: *const BluetoothDeviceSearchParams,
            device_info: *mut BluetoothDeviceInfo,
        ) -> Handle;
        fn BluetoothFindNextDevice(find: Handle, device_info: *mut BluetoothDeviceInfo) -> Bool;
        fn BluetoothFindDeviceClose(find: Handle) -> Bool;
        fn BluetoothEnumerateInstalledServices(
            radio: Handle,
            device_info: *const BluetoothDeviceInfo,
            service_count: *mut Dword,
            services: *mut Guid,
        ) -> Dword;
        fn BluetoothSetServiceState(
            radio: Handle,
            device_info: *const BluetoothDeviceInfo,
            service: *const Guid,
            flags: Dword,
        ) -> Dword;
        fn BluetoothRemoveDevice(address: *const BluetoothAddress) -> Dword;
    }

    #[link(name = "Kernel32")]
    unsafe extern "system" {
        fn CloseHandle(handle: Handle) -> Bool;
    }

    struct Radio {
        handle: Handle,
        name: String,
    }

    impl Drop for Radio {
        fn drop(&mut self) {
            if !self.handle.is_null() {
                unsafe {
                    CloseHandle(self.handle);
                }
            }
        }
    }

    pub fn get_device_snapshot() -> DeviceSnapshot {
        let radio = first_radio();
        let devices = radio.as_ref().map(find_devices).unwrap_or_default();
        let active_output = devices
            .iter()
            .find(|device| {
                device.status == "Connected" && device.audio_role.as_deref() == Some("Output")
            })
            .map(|device| device.name.clone())
            .unwrap_or_else(|| "系统默认输出".into());
        let connected_airpods = devices
            .iter()
            .find(|device| device.status == "Connected" && device.is_airpods);

        DeviceSnapshot {
            adapter_name: radio
                .as_ref()
                .map(|radio| radio.name.clone())
                .unwrap_or_else(|| "未检测到蓝牙适配器".into()),
            adapter_state: if radio.is_some() {
                "Ready"
            } else {
                "Unavailable"
            }
            .into(),
            discoverable: radio
                .as_ref()
                .map(|radio| unsafe { BluetoothIsDiscoverable(radio.handle) != 0 })
                .unwrap_or(false),
            active_output,
            active_input: "系统默认输入".into(),
            airpods: AirPodsStatus {
                connected: connected_airpods.is_some(),
                model: connected_airpods
                    .map(|device| device.name.clone())
                    .unwrap_or_else(|| "AirPods".into()),
                left_battery: None,
                right_battery: None,
                case_battery: None,
                noise_mode: "系统控制".into(),
                microphone: "系统默认".into(),
            },
            devices,
        }
    }

    pub fn connect_device(device_id: &str) -> Result<String, String> {
        let (radio, device) = find_raw_device(device_id)?;
        let name = device_name(&device);

        if device.connected != 0 {
            return Ok(format!("{name} 已连接"));
        }

        if device.remembered == 0 && device.authenticated == 0 {
            return Err(format!(
                "{name} 尚未配对，请先在 Windows 蓝牙设置中完成配对"
            ));
        }

        let changed = set_device_services(&radio, &device, BLUETOOTH_SERVICE_ENABLE)?;
        Ok(format!("已向 Windows 请求连接 {name}（{changed} 个服务）"))
    }

    pub fn disconnect_device(device_id: &str) -> Result<String, String> {
        let (radio, device) = find_raw_device(device_id)?;
        let name = device_name(&device);

        if device.connected == 0 {
            return Ok(format!("{name} 当前未连接"));
        }

        let changed = set_device_services(&radio, &device, BLUETOOTH_SERVICE_DISABLE)?;
        Ok(format!("已向 Windows 请求断开 {name}（{changed} 个服务）"))
    }

    pub fn remove_device(device_id: &str) -> Result<String, String> {
        let (_radio, device) = find_raw_device(device_id)?;
        let name = device_name(&device);
        let result = unsafe { BluetoothRemoveDevice(&device.address) };

        if result == ERROR_SUCCESS {
            Ok(format!("已从 Windows 移除 {name}"))
        } else {
            Err(format!("移除 {name} 失败，Windows 错误码 {result}"))
        }
    }

    fn first_radio() -> Option<Radio> {
        let params = BluetoothFindRadioParams {
            dw_size: size_of::<BluetoothFindRadioParams>() as Dword,
        };
        let mut handle = null_mut();
        let find = unsafe { BluetoothFindFirstRadio(&params, &mut handle) };

        if find.is_null() {
            return None;
        }

        unsafe {
            BluetoothFindRadioClose(find);
        }

        if handle.is_null() {
            None
        } else {
            Some(Radio {
                name: radio_name(handle),
                handle,
            })
        }
    }

    fn radio_name(handle: Handle) -> String {
        let mut info: BluetoothRadioInfo = unsafe { zeroed() };
        info.dw_size = size_of::<BluetoothRadioInfo>() as Dword;

        if unsafe { BluetoothGetRadioInfo(handle, &mut info) } == ERROR_SUCCESS {
            wide_name(&info.name).unwrap_or_else(|| "Windows Bluetooth".into())
        } else {
            "Windows Bluetooth".into()
        }
    }

    fn find_devices(radio: &Radio) -> Vec<BluetoothDevice> {
        let mut seen = HashSet::new();
        raw_devices(radio)
            .into_iter()
            .filter(|device| seen.insert(compact_address(device.address.value)))
            .map(|device| device_from_info(&device))
            .collect()
    }

    fn raw_devices(radio: &Radio) -> Vec<BluetoothDeviceInfo> {
        let params = BluetoothDeviceSearchParams {
            dw_size: size_of::<BluetoothDeviceSearchParams>() as Dword,
            return_authenticated: 1,
            return_remembered: 1,
            return_unknown: 1,
            return_connected: 1,
            issue_inquiry: 1,
            timeout_multiplier: 2,
            radio: radio.handle,
        };
        let mut info: BluetoothDeviceInfo = unsafe { zeroed() };
        info.dw_size = size_of::<BluetoothDeviceInfo>() as Dword;

        let find = unsafe { BluetoothFindFirstDevice(&params, &mut info) };
        if find.is_null() {
            return Vec::new();
        }

        let mut devices = vec![info];
        loop {
            let mut next: BluetoothDeviceInfo = unsafe { zeroed() };
            next.dw_size = size_of::<BluetoothDeviceInfo>() as Dword;
            let has_next = unsafe { BluetoothFindNextDevice(find, &mut next) } != 0;
            if !has_next {
                break;
            }
            devices.push(next);
        }

        unsafe {
            BluetoothFindDeviceClose(find);
        }

        devices
    }

    fn find_raw_device(device_id: &str) -> Result<(Radio, BluetoothDeviceInfo), String> {
        let radio = first_radio().ok_or_else(|| "未检测到蓝牙适配器".to_string())?;
        let target = normalize_device_id(device_id);
        let device = raw_devices(&radio)
            .into_iter()
            .find(|device| compact_address(device.address.value) == target)
            .ok_or_else(|| "没有找到这个蓝牙设备，请先刷新列表".to_string())?;

        Ok((radio, device))
    }

    fn device_from_info(info: &BluetoothDeviceInfo) -> BluetoothDevice {
        let name = device_name(info);
        let kind = infer_kind(&name, info.class_of_device);
        let status = if info.connected != 0 {
            "Connected"
        } else if info.remembered != 0 || info.authenticated != 0 {
            "Paired"
        } else {
            "Available"
        };
        let is_airpods = name.to_ascii_lowercase().contains("airpods");
        let audio_role = if matches!(kind.as_str(), "Headphones" | "Speaker") {
            Some("Output".into())
        } else {
            None
        };

        BluetoothDevice {
            id: format!("bt-{}", compact_address(info.address.value)),
            name,
            address: format_address(info.address.value),
            kind,
            status: status.into(),
            battery: None,
            signal: None,
            is_airpods,
            audio_role,
            last_seen: last_seen_label(info),
        }
    }

    fn set_device_services(
        radio: &Radio,
        device: &BluetoothDeviceInfo,
        flags: Dword,
    ) -> Result<usize, String> {
        let mut services = installed_services(radio, device);
        if services.is_empty() {
            services = fallback_services(device);
        }

        let mut changed = 0;
        let mut last_error = ERROR_SUCCESS;

        for service in services {
            let result = unsafe { BluetoothSetServiceState(radio.handle, device, &service, flags) };
            if result == ERROR_SUCCESS {
                changed += 1;
            } else {
                last_error = result;
            }
        }

        if changed > 0 {
            Ok(changed)
        } else {
            Err(format!(
                "Windows 没有接受这个蓝牙服务状态变更，错误码 {last_error}"
            ))
        }
    }

    fn installed_services(radio: &Radio, device: &BluetoothDeviceInfo) -> Vec<Guid> {
        let mut count = MAX_SERVICE_COUNT as Dword;
        let mut services = [Guid::from_values(0, 0, 0, [0; 8]); MAX_SERVICE_COUNT];
        let result = unsafe {
            BluetoothEnumerateInstalledServices(
                radio.handle,
                device,
                &mut count,
                services.as_mut_ptr(),
            )
        };

        if result == ERROR_SUCCESS {
            services[..(count as usize).min(MAX_SERVICE_COUNT)].to_vec()
        } else {
            Vec::new()
        }
    }

    fn fallback_services(device: &BluetoothDeviceInfo) -> Vec<Guid> {
        let name = device_name(device);
        let kind = infer_kind(&name, device.class_of_device);

        if matches!(kind.as_str(), "Headphones" | "Speaker") {
            vec![
                SERVICE_AUDIO_SINK,
                SERVICE_AUDIO_SOURCE,
                SERVICE_AV_REMOTE_CONTROL,
                SERVICE_HEADSET,
                SERVICE_HANDSFREE,
            ]
        } else if matches!(kind.as_str(), "Keyboard" | "Mouse" | "Peripheral") {
            vec![SERVICE_HUMAN_INTERFACE_DEVICE]
        } else {
            vec![
                SERVICE_AUDIO_SINK,
                SERVICE_HEADSET,
                SERVICE_HANDSFREE,
                SERVICE_HUMAN_INTERFACE_DEVICE,
            ]
        }
    }

    fn infer_kind(name: &str, class_of_device: Dword) -> String {
        let lower_name = name.to_ascii_lowercase();
        if lower_name.contains("airpods")
            || lower_name.contains("headphone")
            || lower_name.contains("buds")
        {
            return "Headphones".into();
        }
        if lower_name.contains("speaker") || lower_name.contains("homepod") {
            return "Speaker".into();
        }
        if lower_name.contains("keyboard") || lower_name.contains("keychron") {
            return "Keyboard".into();
        }
        if lower_name.contains("mouse") || lower_name.contains("mx master") {
            return "Mouse".into();
        }

        match (class_of_device >> 8) & 0x1f {
            0x04 => "Headphones".into(),
            0x05 => "Peripheral".into(),
            0x01 => "Computer".into(),
            0x02 => "Phone".into(),
            _ => "Bluetooth".into(),
        }
    }

    fn device_name(info: &BluetoothDeviceInfo) -> String {
        wide_name(&info.name)
            .unwrap_or_else(|| format!("Bluetooth {}", format_address(info.address.value)))
    }

    fn wide_name(value: &[u16]) -> Option<String> {
        let len = value
            .iter()
            .position(|char| *char == 0)
            .unwrap_or(value.len());
        if len == 0 {
            return None;
        }

        Some(String::from_utf16_lossy(&value[..len]))
    }

    fn format_address(address: u64) -> String {
        (0..6)
            .rev()
            .map(|index| format!("{:02X}", (address >> (index * 8)) & 0xff))
            .collect::<Vec<_>>()
            .join(":")
    }

    fn compact_address(address: u64) -> String {
        format_address(address)
            .replace(':', "")
            .to_ascii_lowercase()
    }

    fn normalize_device_id(device_id: &str) -> String {
        device_id
            .chars()
            .filter(|char| char.is_ascii_hexdigit())
            .collect::<String>()
            .to_ascii_lowercase()
    }

    fn last_seen_label(info: &BluetoothDeviceInfo) -> String {
        if info.connected != 0 {
            "刚刚".into()
        } else if info.remembered != 0 || info.authenticated != 0 {
            "已保存".into()
        } else if info.last_seen.year > 0 {
            "附近".into()
        } else {
            "可发现".into()
        }
    }

    #[allow(dead_code)]
    fn _null_handle() -> Handle {
        null_mut()
    }

    #[allow(dead_code)]
    fn _null_guid() -> *const Guid {
        null()
    }
}

/// Tauri 应用入口：注册插件、暴露前端可 invoke 的命令，并启动窗口。
#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_opener::init())
        .invoke_handler(tauri::generate_handler![
            get_device_snapshot,
            connect_device,
            disconnect_device,
            remove_device,
            set_audio_output
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
