import { getContext, setContext } from "svelte"
import type { itemType } from "../types"

const DRAG_SYMBOL = Symbol("drag")

export class DragRoot {
	dragHandle = false
	dragSelect = false
	items: itemType[] = []
	itemsExtras: Record<string, {elm: HTMLElement, idx: number}> = {}
	zoneTag = $state<string | null>(null)
	zoneId = $state<string | null>(null)
	parentZoneState = $state<DragRoot | null>(null)
	isRootDragRoot = $state<boolean>(false)

	constructor(items: itemType[], dragSelect: boolean, parentDraggableState: DragRoot | undefined) {
		//console.log("building new zone with these items:", $state.snapshot(items))
		this.items = items
		this.dragSelect = dragSelect
		if (parentDraggableState) {
			this.parentZoneState = parentDraggableState
		} else {
			this.parentZoneState = null
			this.isRootDragRoot = true
		}

		if (this.parentZoneState !== null && this.parentZoneState.zoneId !== null) {
			//in the parent, finds the item that contains the list that this zone is being created from,
			//and gets the id of the item to make this new drag root's zone it's id.

			//this is used to check if an item is dragging inside itself later.
			for (const item of this.parentZoneState.items) {
				if (!("list" in item)) continue
				if (item.list === items) this.zoneId = item.id
			}
		}
	}
}

export function getState() {
	return getContext(DRAG_SYMBOL) as DragRoot
}

export function setState(items: any[], dragSelect: boolean = false) {
	const parentDraggableState = getState()
	return setContext(DRAG_SYMBOL, new DragRoot(items, dragSelect, parentDraggableState))
}
