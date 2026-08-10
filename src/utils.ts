import type { SvelteSet } from "svelte/reactivity"

export function clamp(value: number, min: number, max: number) {
	return Math.max(min, Math.min(max, value))
}

export function arrayOfObjsIncludes<T>(arrOfObjs: T[], targetKey: string, targetValue: any) {
	for (const obj of arrOfObjs) {
		if ((obj as any)[targetKey] === targetValue) return true
	}
	return false
}

export function arrayMove(arr: any[], from: number, to: number) {
	if (to < 0) to = 0
	arr.splice(to, 0, arr.splice(from, 1)[0])
}

export function arrayMoveToArray(sourceArray: any[], from: number, targetArray: any[], to: number) {
	if (to < 0) to = 0
	targetArray.splice(to, 0, sourceArray.splice(from, 1)[0])
}

export function arrayRemoveItem<T>(arr: Array<T>, value: T) {
	const idx = arr.indexOf(value)
	if (idx > -1) {
		arr.splice(idx, 1)
	}
	return arr
}

export function arrayRemoveItemAll<T>(arr: T[], value: T) {
	let foundValue = -1
	foundValue = arr.indexOf(value)
	while (foundValue > -1) {
		arr.splice(foundValue, 1)
		foundValue = arr.indexOf(value)
	}
  return arr
}

export function setToString<T>(set: SvelteSet<T>) {
	let str = ''
	for (const item of set) {
		str += item
	}
	return str
}

export function generateHash(str: string) {
	let hash = 0
	for (const char of str) {
		hash = (hash << 5) - hash + char.charCodeAt(0)
		hash |= 0 // Constrain to 32bit integer
	}
	return hash
}
