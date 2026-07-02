export function clamp(value: number, min: number, max: number) {
  return Math.max(min, Math.min(max, value));
}

export function arrayMove(arr: any[], from: number, to: number) {
  arr.splice(to, 0, arr.splice(from, 1)[0]);
}
