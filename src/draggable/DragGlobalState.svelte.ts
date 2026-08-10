import { getContext, onMount, setContext } from "svelte"
import { arrayMove, arrayMoveToArray, arrayOfObjsIncludes, arrayRemoveItem, arrayRemoveItemAll } from "../utils"
import type { itemType } from "../types"
import type { DragRoot } from "./DraggableState.svelte"
const DRAG_DEADZONE_X = 5
const DRAG_DEADZONE_Y = 5

const SYMBOL = Symbol("drag_global")

const dragVanityElm = document.createElement("div")
dragVanityElm.classList.add("drag-vanity", "dnd-dragging")
document.body.append(dragVanityElm)

class DragGlobalState {
	dragZoneTagCounter = 0
	createDragZoneTag() {
		const tag = "zone" + String(this.dragZoneTagCounter)
		this.dragZoneTagCounter++
		return tag
	}
	mDownLeft = $state(false)
	mDownRight = $state(false)

	mDownListItemIndex = $state<number | null>(null)
	mDownListItemOrigin = $state<any[] | null>(null)
	mDownListItemId = $state<string | null>(null)
	mDownListItemZoneOrigin = $state<string | null>(null)
	mDownListItemZoneOriginId = $state<string | null>(null)
	mDownElm = $state<HTMLElement | null>(null)
	mDownItemRequiresDragHandle = false
	mDownOnDragHandle = false

	mDownOriginX = -1
	mDownOriginY = -1

	mOverDragZoneTag = $state<string | null>(null)

	clientX = $state(-1)
	clientY = $state(-1)
	mDownX = $state(-1)
	mDownY = $state(-1)
	mDownXDiff = $derived(this.clientX - this.mDownX)
	mDownYDiff = $derived(this.clientY - this.mDownY)

	mDownOnListItem = $derived.by(() => {
		if (!this.mDownLeft) return false
		if (this.mDownListItemId === null) return false
		return true
	})

	isDragging = $state(false)
	draggingHalf = $state<"top" | "bottom" | null>(null)
	draggingCloneElm = $state<HTMLElement | null>(null)

	hoverListItemIndex = $state<number | null>(null)
	hoverListItemOrigin = $state<any[] | null>(null)
	hoverDragZoneTracker = $state<string[]>([])
	hoverDragZoneIdTracker = $state<string[]>([])

	//select stuff

	// first selection determines which subsequent items
	// are allowed to be selected from, must have matching
	// zone tag and origin (so no selecting from multiple nested lists
	// because my brain can't figure that out right now)
	selectedListItems = $state<Array<{ id: string; idx: number; zoneId: string }>>([])
	// selectedListItemFirst = $derived(this.selectedListItems[0] ? this.selectedListItems[0] : "")
	selectedListItemFirst = $state<{ id: string; idx: number; zoneId: string } | null>(null)
	selectedListItemLastSelected = $state<{ id: string; idx: number; zoneId: string } | null>(null)

	isDraggingSelect = $state(false)
	dragSelectRoot = $state<DragRoot | null>(null)

	kDownCtrl = $state(false)

	hoverDragZone = $derived.by(() => {
		const res = this.hoverDragZoneTracker[this.hoverDragZoneTracker.length - 1]
		if (res === undefined) return null
		return res
	})
	hoverDragZoneId = $derived.by(() => {
		const res = this.hoverDragZoneIdTracker[this.hoverDragZoneIdTracker.length - 1]
		if (res === undefined) return null
		return res
	})

	debugArrayMoveResult = $state(0)

	mouseDownOnItem(
		e: MouseEvent,
		itemIndex: number,
		itemOriginArr: any[],
		itemElm: HTMLElement,
		dragHandle: boolean = false,
		itemOriginZoneTag: string | null,
		itemId: string,
		itemZoneOriginId: string,
	) {
		if (e.button !== 0) {
			e.preventDefault()
			return
		}
		// this.mDownOnItemId = itemId;
		this.mDownListItemIndex = itemIndex
		this.mDownListItemOrigin = itemOriginArr
		this.mDownElm = itemElm
		this.mDownOriginX = e.clientX
		this.mDownOriginY = e.clientY
		this.mDownItemRequiresDragHandle = dragHandle
		this.mDownListItemZoneOrigin = itemOriginZoneTag
		this.mDownListItemId = itemId
		this.mDownListItemZoneOriginId = itemZoneOriginId
	}

	isDraggingItemInSameContext() {
		return this.mDownListItemOrigin === this.hoverListItemOrigin
	}

	isDraggingItemInSamePlace() {
		return this.mDownListItemIndex === this.hoverListItemIndex && this.isDraggingItemInSameContext()
	}

	isDraggingItemDirectlyAboveItself() {
		if (this.mDownListItemIndex === null) return false
		return this.mDownListItemIndex - 1 === this.hoverListItemIndex && this.isDraggingItemInSameContext()
	}

	isDraggingItemDirectlyBelowItself() {
		if (this.mDownListItemIndex === null) return false
		return this.mDownListItemIndex + 1 === this.hoverListItemIndex && this.isDraggingItemInSameContext()
	}

	isDraggingItemInMismatchingZoneTag() {
		return this.mDownListItemZoneOrigin !== null && this.hoverDragZone !== this.mDownListItemZoneOrigin
	}

	isDraggingItemInsideItself() {
		return (
			(this.mDownListItemId !== null && this.hoverDragZoneIdTracker.includes(this.mDownListItemId)) ||
			this.mDownListItemId === this.hoverDragZoneId
		)
	}

	resetDragState() {
		this.mDownElm = null
		this.mDownListItemId = null
		this.mDownListItemIndex = null
		this.mDownListItemOrigin = null
		this.hoverListItemIndex = null
		this.hoverListItemOrigin = null
		this.mDownItemRequiresDragHandle = false
		this.mDownOnDragHandle = false
		this.isDragging = false
		this.isDraggingSelect = false
		this.dragSelectRoot = null
		this.mDownListItemZoneOrigin = null
		this.mDownListItemZoneOriginId = null
		document.body.style.cursor = "default"
		if (!this.draggingCloneElm) return
		dragVanityElm.removeChild(this.draggingCloneElm)
		this.draggingCloneElm = null
	}

	clearItemSelect = () => {
		this.selectedListItems = []
		this.selectedListItemFirst = null
	}

	handleItemSelect = (
		e: MouseEvent | FocusEvent,
		dragState: DragRoot,
		itemId: string,
		itemIdx: number,
		itemElm: HTMLElement,
	) => {
		if (this.isDragging || dragState.zoneId === null) return
		console.log("handleItemSelect")
		console.log("------------------------")
		e.stopImmediatePropagation()
		if (e instanceof MouseEvent) {
			console.log("mouse was used")
			console.log("button used to trigger select: ", e.button)
			if (arrayOfObjsIncludes(this.selectedListItems, "id", itemId)) {
				if (e.ctrlKey) {
					//unselect item and do no further processing
					for (let i = 0; i < this.selectedListItems.length; i++) {
						const item = this.selectedListItems[i]
						if (item.id === itemId) {
							this.selectedListItems = this.selectedListItems.splice(i, 1)
							break
						}
					}
					return
				}
			}

			//this handles only allowing multi-select from the first item's originating list.
			//maybe someday i'll support selecting across multiple lists but i don't have time for that atm.
			if (
				this.selectedListItemFirst !== null &&
				this.selectedListItems.length >= 1 &&
				((dragState.zoneId !== this.selectedListItemFirst.zoneId && e.ctrlKey) ||
					(dragState.zoneId !== this.selectedListItemFirst.zoneId && e.shiftKey) ||
					(dragState.zoneId !== this.selectedListItemFirst.zoneId && this.isDraggingSelect))
			)
				return

			//handles shift click logic, which, will capture all items
			//inbetween an already selected item and the target index.

			if (e.shiftKey && this.selectedListItemLastSelected !== null && this.selectedListItemLastSelected.idx !== itemIdx) {
				console.log("shift click valid")
				//clear list if not holding ctrl
				if (!e.ctrlKey) {
					this.clearItemSelect()
					// re-add the last selected item since it got cleared
					this.selectedListItems.push(this.selectedListItemLastSelected)
				}
				if (this.selectedListItemLastSelected.idx < itemIdx) {
					//select from first, to target
					console.log("first, to target", this.selectedListItemLastSelected.idx, itemIdx)
					console.log("first id", this.selectedListItemLastSelected.id)
					console.log("target id", itemId)
					for (let i = this.selectedListItemLastSelected.idx + 1; i < itemIdx; i++) {
						const item = dragState.items[i]
						console.log("analyzing", $state.snapshot(item))
						if (arrayOfObjsIncludes(this.selectedListItems, "id", item.id)) continue
						this.selectedListItems.push({ id: item.id, idx: itemIdx, zoneId: dragState.zoneId })
					}
				} else {
					//select from target, to first
					console.log("target, to first", this.selectedListItemLastSelected.idx, itemIdx)
					console.log("target id", itemId)
					console.log("first id", this.selectedListItemLastSelected.id)
					for (let i = this.selectedListItemLastSelected.idx; i > itemIdx; i--) {
						console.log(i)
						const item = dragState.items[i]
						console.log("analyzing", $state.snapshot(item))
						if (arrayOfObjsIncludes(this.selectedListItems, "id", item.id)) continue
						this.selectedListItems.push({ id: item.id, idx: itemIdx, zoneId: dragState.zoneId })
					}
				}
				//add the actual selecting item itself if not already in
				if (!arrayOfObjsIncludes(this.selectedListItems, "id", itemId)) {
					this.selectedListItems.push({ id: itemId, idx: itemIdx, zoneId: dragState.zoneId })
				}

				return
			}

			if (e.ctrlKey !== true && !this.isDraggingSelect) {
				console.log("ctrl not held, clearing list")
				this.clearItemSelect()
			}

			//handles the default behavior of ctrl click, which is just select the target.
			this.itemSelect(itemId, itemIdx, dragState)
		} else {
			console.log("focus was used")
			const mouseUsed = this.mDownLeft || this.mDownRight

			if (mouseUsed) return

			this.selectedListItems = []
			this.selectedListItemFirst = null
			this.itemSelect(itemId, itemIdx, dragState)
		}
	}

	itemSelect = (itemId: string, itemIdx: number, dragState: DragRoot) => {
		if (dragState.zoneId === null) return

		while (arrayOfObjsIncludes(this.selectedListItems, "id", itemId)) {
			// arrayRemoveItemAll(this.selectedListItems, itemId)
			for (let i = 0; i < this.selectedListItems.length; i++) {
				const item = this.selectedListItems[i]
				if (item.id === itemId) {
					this.selectedListItems = this.selectedListItems.splice(i, 1)
					break
				}
			}
		}
		this.selectedListItems.push({ id: itemId, idx: itemIdx, zoneId: dragState.zoneId })

		if (this.selectedListItems.length === 1 && dragState.zoneId !== null) {
			this.selectedListItemFirst = { id: itemId, idx: itemIdx, zoneId: dragState.zoneId }
		}

		this.selectedListItemLastSelected = { id: itemId, idx: itemIdx, zoneId: dragState.zoneId }
	}

	handleMouseUp = (e: MouseEvent) => {
		if (e.button === 0) this.mDownLeft = false
		if (e.button === 1) this.mDownRight = false

		if (e.button !== 0) {
			e.preventDefault()
			return
		}
		//process drop target if any
		if (
			this.isDragging &&
			this.hoverListItemIndex !== null &&
			this.hoverListItemOrigin !== null &&
			this.mDownListItemIndex !== null &&
			this.mDownListItemOrigin !== null
		) {
			if (
				this.isDraggingItemInSamePlace() ||
				(this.isDraggingItemDirectlyAboveItself() && this.draggingHalf === "bottom") ||
				(this.isDraggingItemDirectlyBelowItself() && this.draggingHalf === "top") ||
				this.draggingHalf === null ||
				this.isDraggingItemInMismatchingZoneTag() ||
				this.isDraggingItemInsideItself()
			) {
				this.resetDragState()
				return //don't run on dropping in place
			}

			console.log("dropped!")
			let offset = this.hoverListItemIndex < this.mDownListItemIndex ? 1 : 0
			if (this.draggingHalf === "bottom") {
				//fancy thing just changing which function to use if dragging across contexts or not
				if (this.isDraggingItemInSameContext()) {
					this.debugArrayMoveResult = 1
					arrayMove(this.mDownListItemOrigin, this.mDownListItemIndex, this.hoverListItemIndex + offset)
				} else {
					// im gonna be so honest i don't really know why forcing
					// the offset to 1 before any placeholder checks when
					// outside the originating list works
					offset = 1
					arrayMoveToArray(
						this.mDownListItemOrigin,
						this.mDownListItemIndex,
						this.hoverListItemOrigin,
						this.hoverListItemIndex + offset,
					)
				}

				//   console.log("bottom", dragState.mouseDownOnItemIndex, dragState.activeHoverItemIndex + offset);
			} else {
				if (this.isDraggingItemInSameContext()) {
					this.debugArrayMoveResult = 1
					arrayMove(this.mDownListItemOrigin, this.mDownListItemIndex, this.hoverListItemIndex + offset - 1)
				} else {
					// im gonna be so honest i don't really know why forcing
					// the offset to 1 before any placeholder checks when
					// outside the originating list works
					offset = 1
					arrayMoveToArray(
						this.mDownListItemOrigin,
						this.mDownListItemIndex,
						this.hoverListItemOrigin,
						this.hoverListItemIndex + offset - 1,
					)
				}
				//   console.log("top", dragState.mouseDownOnItemIndex, dragState.activeHoverItemIndex + offset - 1);
			}
		}
		this.resetDragState()
	}

	handleMouseMove = (e: MouseEvent) => {
		this.clientX = e.pageX
		this.clientY = e.pageY

		//   console.log(dragState.dragHandle, dragState.mouseDownOnDragHandle);
		//   if (dragState.dragHandle && !dragState.mouseDownOnDragHandle) return;
		if (
			e.ctrlKey === true ||
			this.mDownListItemIndex === null ||
			(this.mDownItemRequiresDragHandle && !this.mDownOnDragHandle)
		)
			return

		if (!this.isDragging) {
			if (
				e.pageX > this.mDownOriginX + DRAG_DEADZONE_X ||
				e.pageX < this.mDownOriginX - DRAG_DEADZONE_X ||
				e.pageY > this.mDownOriginY + DRAG_DEADZONE_Y ||
				e.pageY < this.mDownOriginY - DRAG_DEADZONE_Y
			) {
				this.isDragging = true
			}
		}

		if (this.isDraggingItemInMismatchingZoneTag()) {
			document.body.style.cursor = "not-allowed"
		} else {
			document.body.style.cursor = "move"
		}
	}
	handleMouseDown = (e: MouseEvent) => {
		if (e.button === 0) this.mDownLeft = true
		if (e.button === 1) this.mDownRight = true
		this.mDownX = this.clientX
		this.mDownY = this.clientY
	}

	handleKeyDown = (e: KeyboardEvent) => {
		if (e.ctrlKey) this.kDownCtrl = true
		if (e.key === "ArrowDown" && this.selectedListItems.length > 0) {
			//push items down the list
			//wip, gotta rework stored list items so it has more context
		}
	}
	handleKeyUp = (e: KeyboardEvent) => {
		if (e.ctrlKey) this.kDownCtrl = false
	}
	constructor() {
		document.addEventListener("mousedown", this.handleMouseDown)
		document.addEventListener("mouseup", this.handleMouseUp)
		document.addEventListener("mousemove", this.handleMouseMove)
		document.addEventListener("keydown", this.handleKeyDown)
		document.addEventListener("keyup", this.handleKeyUp)

		//we can't normally use effects in non-component files, but effect.root allows us to!!
		$effect.root(() => {
			//determines if a clone should be made, and to unselect everything
			$effect(() => {
				if (this.mDownElm === null || !this.isDragging || this.draggingCloneElm !== null) return
				this.selectedListItems = []
				console.log("make clone")
				document.body.style.cursor = "move"
				this.draggingCloneElm = this.mDownElm.cloneNode(true) as HTMLElement
				dragVanityElm.appendChild(this.draggingCloneElm)
			})

			//updates clone position
			$effect(() => {
				if (this.draggingCloneElm === null) return
				dragVanityElm.style.top = this.clientY + "px"
				dragVanityElm.style.left = this.clientX + "px"
			})

			//unselects everything if not clicking on an item
			// $effect(() => {
			// 	$inspect('mdownonlistitem', this.mDownOnListItem)
			// 	if (this.mDownOnListItem) return
			// 	this.clearItemSelect()
			// })
		})
	}

	//should never be destroyed anyways but... nice to remember what could leak
	//if there were to be multiple instances.
	destroy() {
		document.removeEventListener("mouseup", this.handleMouseUp)
		document.removeEventListener("mousemove", this.handleMouseMove)
		document.removeEventListener("keydown", this.handleKeyDown)
		document.removeEventListener("keyup", this.handleKeyUp)
	}
}

export const globalDragState = new DragGlobalState()
