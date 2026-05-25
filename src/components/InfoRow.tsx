/**
 * 通用信息行，用在详情页和 AirPods 元信息里。
 */
export function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="info-row">
      <span>{label}</span>
      <strong>{value}</strong>
    </div>
  );
}
