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

export function arrayMove<T>(arr: T[], from: number|number[], to: number) {
	let arrRes: T[] = []
	let processed = 0;
	if (Array.isArray(from)) {
		for (let i = 0; i < from.length; i++) {
			const num = from[i]
			arrRes.push(arr.splice(num - processed, 1)[0])
			processed++
		}
	} else {
		arrRes.push(arr.splice(from, 1)[0])
	}
	if (to < 0) to = 0
	// if (to > arr.length - 1) to = arr.length - 1
	arr.splice(to, 0, ...arrRes)
}

export function arrayMoveToArray<T>(sourceArray: T[], from: number | number[], targetArray: T[], to: number) {
	let arrRes: T[] = []
	let processed = 0;
	if (Array.isArray(from)) {
		for (let i = 0; i < from.length; i++) {
			const num = from[i]
			arrRes.push(sourceArray.splice(num - processed, 1)[0])
			processed++
		}
	} else {
		arrRes.push(sourceArray.splice(from, 1)[0])
	}
	if (to < 0) to = 0
	// if (to > arr.length - 1) to = arr.length - 1
	targetArray.splice(to, 0, ...arrRes)
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
