import { getContext, setContext } from "svelte"
import type { itemType } from "../types"

const DRAG_SYMBOL = Symbol("drag")

class DragRoot {
	dragHandle = false
	items: itemType[] = []
	zoneTag = $state<string | null>(null)
	zoneId = $state<string | null>(null)
  /**... an item in the items array, contains a list of items, indicating nested itemss */
  nestedItems = $state<boolean>(false)
	parentZoneState = $state<DragRoot | null>(null)
	/**used for listing parent nested zones, useful to make sure you cant drag an item inside itself. */
	parentZoneIds = $state<string[]>([])
	// parentZoneIds = $derived.by(() => {})
	constructor(items: itemType[], parentDraggableState: DragRoot | undefined) {
		console.log('building new zone with these items:', $state.snapshot(items))
    this.items = items
		parentDraggableState ? (this.parentZoneState = parentDraggableState) : (this.parentZoneState = null)

		if (this.parentZoneState !== null && this.parentZoneState.zoneId !== null) {
			this.parentZoneIds = [...this.parentZoneState.parentZoneIds, this.parentZoneState.zoneId]
      //find the item that contains the same items list and copy it's id for the zone id
      //this will be used to figure out if it's dragging inside itself, because the zone id becomes based off the item id.
      console.log('begin search')
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
