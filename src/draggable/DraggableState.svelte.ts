import { getContext, setContext } from "svelte"
import type { itemType } from "../types"

const DRAG_SYMBOL = Symbol("drag")

class DragRoot {
	dragHandle = false
	items: itemType[] = []
	zoneTag = $state<string | null>(null)
	zoneId = $state<string | null>(null)
	parentZoneState = $state<DragRoot | null>(null)
	constructor(items: itemType[], parentDraggableState: DragRoot | undefined) {
		console.log('building new zone with these items:', $state.snapshot(items))
    this.items = items
		parentDraggableState ? (this.parentZoneState = parentDraggableState) : (this.parentZoneState = null)

		if (this.parentZoneState !== null && this.parentZoneState.zoneId !== null) {
      //in the parent, finds the item that contains the list that this zone is being created from,
      //and gets the id of the item to make this new drag root's zone it's id.

      //this is used to check if an item is dragging inside itself later.
      for (const item of this.parentZoneState.items) {
        if (!('list' in item)) continue
        if (item.list === items) this.zoneId = item.id
      }
		}
	}
}

export function getState() {
	return getContext(DRAG_SYMBOL) as DragRoot
}

export function setState(items: any[]) {
	const parentDraggableState = getState()
	return setContext(DRAG_SYMBOL, new DragRoot(items, parentDraggableState))
}
