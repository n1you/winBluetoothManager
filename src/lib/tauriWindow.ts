/**
 * 安全调用 Tauri 当前窗口能力；普通浏览器预览时直接跳过。
 */
export async function withCurrentWindow(action: "close" | "minimize" | "startDragging") {
  if (!("__TAURI_INTERNALS__" in window)) return;

  try {
    const { getCurrentWindow } = await import("@tauri-apps/api/window");
    await getCurrentWindow()[action]();
  } catch {
    /**
     * 浏览器预览没有原生窗口可控制，所以这里静默跳过。
     */
  }
}

/**
 * 设置透明窗口背景和系统阴影，让 Tauri 窗口看起来像浮层。
 */
export async function ensureTransparentWindow() {
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
    /**
     * 浏览器预览没有原生窗口可调节，所以这里静默跳过。
     */
  }
}
