export function yuan(value: number): string {
  if (Math.abs(value) >= 1_0000_0000) {
    return (value / 1_0000_0000).toFixed(1) + "亿";
  }
  if (Math.abs(value) >= 1_0000) {
    return (value / 1_0000).toFixed(1) + "万";
  }
  return value.toLocaleString("zh-CN");
}

export function yuanFull(value: number): string {
  return value.toLocaleString("zh-CN") + "元";
}

export function pct(value: number): string {
  return value.toFixed(1) + "%";
}
