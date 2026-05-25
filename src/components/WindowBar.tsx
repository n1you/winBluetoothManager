/**
 * 顶部窗口栏：提供拖拽、关闭和最小化入口。
 */
export function WindowBar({
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
