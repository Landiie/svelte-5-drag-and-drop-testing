export function clamp(value: number, min: number, max: number) {
  return Math.max(min, Math.min(max, value));
}

export function arrayMove(arr: any[], from: number, to: number) {
  arr.splice(to, 0, arr.splice(from, 1)[0]);
}

export function arrayMoveToArray(sourceArray: any[], from: number, targetArray: any[], to: number) {
  targetArray.splice(to, 0, sourceArray.splice(from, 1)[0]);
}

export function generateHash(str: string) {
  let hash = 0;
  for (const char of str) {
    hash = (hash << 5) - hash + char.charCodeAt(0);
    hash |= 0; // Constrain to 32bit integer
  }
  return hash;
}
