import { getContext, setContext } from "svelte"

const DRAG_SYMBOL = Symbol("drag")

class DragRoot {
	dragHandle = false
	items: any[] = []
	zoneTag = $state<string | null>(null)
	zoneId = $state<string | null>(null)
	/**used for listing parent nested zones, useful to make sure you cant drag an item inside itself. */
	parentZoneState = $state<DragRoot | null>(null)
	parentZoneIds = $state<string[]>([])
	// parentZoneIds = $derived.by(() => {})
	constructor(items: any[], parentDraggableState: DragRoot | undefined) {
		this.items = items
		parentDraggableState ? (this.parentZoneState = parentDraggableState) : (this.parentZoneState = null)

		if (this.parentZoneState !== null && this.parentZoneState.zoneId !== null) {
			this.parentZoneIds = [...this.parentZoneState.parentZoneIds, this.parentZoneState.zoneId]
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
