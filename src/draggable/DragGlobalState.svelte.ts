import { getContext, setContext, tick } from "svelte"
import { arrayMove, arrayMoveToArray, arrayOfObjsIncludes } from "../utils"
import { DragRoot } from "./DraggableState.svelte"

const DRAG_DEADZONE_X = 5
const DRAG_DEADZONE_Y = 5

const SYMBOL = Symbol("drag_global")

class DraggableState {
	//general tracking
	clientX = $state(-1)
	clientY = $state(-1)
	mDownLeft = $state(false)
	mDownRight = $state(false)
	mDownX = $state(-1)
	mDownY = $state(-1)
	mDownXDiff = $derived(this.clientX - this.mDownX)
	mDownYDiff = $derived(this.clientY - this.mDownY)
	mDownOriginX = -1
	mDownOriginY = -1

	kDownCtrl = $state(false)

	//list item tracking
	mDownListItemIndex = $state<number | null>(null)
	// mDownListItemOrigin = $state<any[] | null>(null)
	mDownListItemId = $state<string | null>(null)
	mDownListItemContext = $state<DragRoot | null>(null)
	mDownElm = $state<HTMLElement | null>(null)
	mDownItemRequiresDragHandle = false
	mDownOnDragHandle = false
	mDownOnListItem = $derived(this.mDownLeft && this.mDownListItemId !== null)

	mouseDownOnItem(e: MouseEvent, itemIndex: number, itemId: string, itemElm: HTMLElement, itemContext: DragRoot) {
		if (e.button !== 0) {
			e.preventDefault()
			return
		}
		// this.mDownOnItemId = itemId;
		this.mDownListItemIndex = itemIndex
		// this.mDownListItemOrigin.items = itemOriginArr
		this.mDownListItemContext = itemContext
		this.mDownElm = itemElm
		this.mDownOriginX = e.clientX
		this.mDownOriginY = e.clientY
		this.mDownItemRequiresDragHandle = itemContext.dragHandle
		this.mDownListItemId = itemId
	}
	//drag zone
	dragZoneTagCounter = 0
	createDragZoneTag() {
		const tag = "zone" + String(this.dragZoneTagCounter)
		this.dragZoneTagCounter++
		return tag
	}
	mOverDragZoneTag = $state<string | null>(null)

	//hover
	hoverListItemIndex = $state<number | null>(null)
	// hoverListItemOrigin = $state<any[] | null>(null)
	hoverListItemContext = $state<DragRoot | null>(null)
	hoverZoneContext = $state<DragRoot | null>(null)
	hoverDragZoneTracker = $state<string[]>([])
	hoverDragZoneIdTracker = $state<string[]>([])
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

	//drag
	isDragging = $state(false)
	draggingHalf = $state<"top" | "bottom" | null>(null)
	dragVanityElm = $state<HTMLElement | null>(null)

	resetDragState() {
		this.mDownElm = null
		this.mDownListItemId = null
		this.mDownListItemIndex = null
		// this.mDownListItemOrigin = null
		this.mDownListItemContext = null
		this.hoverListItemIndex = null
		// this.hoverListItemOrigin = null
		this.hoverListItemContext = null
		this.mDownItemRequiresDragHandle = false
		this.mDownOnDragHandle = false
		this.isDragging = false
		this.isDraggingSelect = false
		this.dragSelectRoot = null
		document.body.style.cursor = "default"
		if (this.dragVanityElm === null) return
		this.dragVanityElm.innerHTML = ""
	}

	//select stuff

	// first selection determines which subsequent items
	// are allowed to be selected from, must have matching
	// zone tag and origin (so no selecting from multiple nested lists
	// because my brain can't figure that out right now)
	selectedListItems = $state<Array<{ id: string; idx: number; context: DragRoot }>>([])
	// selectedListItemsFiltered = $derived()
	// selectedListItemFirst = $derived(this.selectedListItems[0] ? this.selectedListItems[0] : "")
	selectedListItemFirst = $state<{ id: string; idx: number; context: DragRoot } | null>(null)
	selectedListItemLastSelected = $state<{ id: string; idx: number; context: DragRoot } | null>(null)

	isDraggingSelect = $state(false)
	dragSelectRoot = $state<DragRoot | null>(null)

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
		// e.stopImmediatePropagation()
		if (e instanceof MouseEvent) {
			console.log("mouse was used")
			console.log("button used to trigger select: ", e.button)
			if (arrayOfObjsIncludes(this.selectedListItems, "id", itemId)) {
				if (e.ctrlKey) {
					//unselect item and do no further processing
					for (let i = 0; i < this.selectedListItems.length; i++) {
						const item = this.selectedListItems[i]
						if (item.id === itemId) {
							this.selectedListItems.splice(i, 1)
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
				((dragState.zoneId !== this.selectedListItemFirst.context.zoneId && e.ctrlKey) ||
					(dragState.zoneId !== this.selectedListItemFirst.context.zoneId && e.shiftKey) ||
					(dragState.zoneId !== this.selectedListItemFirst.context.zoneId && this.isDraggingSelect))
			)
				return

			//handles shift click logic, which, will capture all items
			//inbetween an already selected item and the target index.

			if (
				e.shiftKey &&
				this.selectedListItemLastSelected !== null &&
				this.selectedListItemLastSelected.idx !== itemIdx
			) {
				console.log("shift click valid")
				//clear list if not holding ctrl
				if (!e.ctrlKey) {
					this.clearItemSelect()
					// re-add the last selected item since it got cleared
					this.selectedListItems.push(this.selectedListItemLastSelected)
					this.selectedListItemFirst = { id: itemId, idx: itemIdx, context: dragState }
				}
				if (this.selectedListItemLastSelected.idx < itemIdx) {
					//select from first, to target
					console.log("first, to target", this.selectedListItemLastSelected.idx, itemIdx)
					console.log("first id", this.selectedListItemLastSelected.id)
					console.log("target id", itemId)
					for (let i = this.selectedListItemLastSelected.idx + 1; i < itemIdx; i++) {
						const item = dragState.items[i]
						// console.log("analyzing", $state.snapshot(item))
						if (arrayOfObjsIncludes(this.selectedListItems, "id", item.id)) continue
						this.selectedListItems.push({ id: item.id, idx: i, context: dragState })
					}
				} else {
					//select from target, to first
					console.log("target, to first", this.selectedListItemLastSelected.idx, itemIdx)
					console.log("target id", itemId)
					console.log("first id", this.selectedListItemLastSelected.id)
					for (let i = this.selectedListItemLastSelected.idx; i > itemIdx; i--) {
						console.log(i)
						const item = dragState.items[i]
						// console.log("analyzing", $state.snapshot(item))
						if (arrayOfObjsIncludes(this.selectedListItems, "id", item.id)) continue
						this.selectedListItems.push({ id: item.id, idx: i, context: dragState })
					}
				}
				//add the actual selecting item itself if not already in
				if (!arrayOfObjsIncludes(this.selectedListItems, "id", itemId)) {
					this.selectedListItems.push({ id: itemId, idx: itemIdx, context: dragState })
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
					this.selectedListItems.splice(i, 1)
					break
				}
			}
		}
		this.selectedListItems.push({ id: itemId, idx: itemIdx, context: dragState })

		if (this.selectedListItems.length === 1 && dragState.zoneId !== null) {
			this.selectedListItemFirst = { id: itemId, idx: itemIdx, context: dragState }
		}

		this.selectedListItemLastSelected = { id: itemId, idx: itemIdx, context: dragState }
	}

	//state checks
	isDraggingItemInSameContext() {
		return (
			this.mDownListItemContext !== null &&
			this.hoverZoneContext !== null &&
			this.mDownListItemContext.items === this.hoverZoneContext.items
		)
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
		return this.hoverZoneContext !== null && this.hoverDragZone !== this.hoverZoneContext.zoneTag
	}

	isDraggingItemInsideItself() {
		return (
			(this.mDownListItemId !== null && this.hoverDragZoneIdTracker.includes(this.mDownListItemId)) ||
			this.mDownListItemId === this.hoverDragZoneId
		)
	}

	isDraggingItemInEmptyList() {
		return (
			this.mDownListItemId !== null &&
			this.hoverZoneContext !== null &&
			this.isDragging &&
			this.hoverZoneContext.items.length === 0
		)
	}

	//global handlers
	handleMouseUp = async (e: MouseEvent) => {
		console.log("mouseup")
		if (e.button === 0) this.mDownLeft = false
		if (e.button === 1) this.mDownRight = false

		if (e.button !== 0) {
			e.preventDefault()
			return
		}
		//process drop target if any
		console.log(
			this.isDragging,
			this.hoverZoneContext !== null,
			this.mDownListItemIndex !== null,
			this.mDownListItemContext !== null,
		)
		if (
			this.isDragging &&
			this.hoverZoneContext !== null &&
			this.mDownListItemIndex !== null &&
			this.mDownListItemContext !== null
		) {
			console.log("passed valid drop target")
			if (
				this.isDraggingItemInSamePlace() ||
				(this.isDraggingItemDirectlyAboveItself() && this.draggingHalf === "bottom") ||
				(this.isDraggingItemDirectlyBelowItself() && this.draggingHalf === "top") ||
				this.isDraggingItemInMismatchingZoneTag() ||
				this.isDraggingItemInsideItself()
			) {
				this.resetDragState()
				return //don't run on dropping in place
			}

			console.log("dropped!")
			if (this.hoverZoneContext !== null && this.hoverListItemIndex === null) {
				console.log('dropped in zone itself and not relative to item')
				//dropped something in list itself and not on any item.
				if (this.isDraggingItemInSameContext()) {
					if (this.selectedListItems.length > 1 && this.selectedListItemFirst !== null) {
						console.log("dropped multiple")
						arrayMove(
							this.mDownListItemContext.items,
							this.selectedListItems.map((a) => a.idx),
							this.hoverZoneContext.items.length,
						)

						//waits for the reordering to occur, allowing the effect that sets the new index, to run
						await tick()

						//reselect items to update their state
						const targetIds = this.selectedListItems.map((v) => v.id)
						for (const id of targetIds) {
							this.itemSelect(
								id,
								this.selectedListItemFirst.context.itemsExtras[id].idx,
								this.selectedListItemFirst.context,
							)
						}
					} else {
						arrayMove(this.mDownListItemContext.items, this.mDownListItemIndex, this.hoverZoneContext.items.length)
					}
				} else {
					if (
						this.selectedListItems.length > 1 &&
						this.selectedListItemFirst !== null &&
						this.selectedListItemLastSelected !== null
					) {
						const targetIds = this.selectedListItems.map((a) => a.id)
						arrayMoveToArray(
							this.mDownListItemContext.items,
							this.selectedListItems.map((a) => a.idx),
							this.hoverZoneContext.items,
							this.hoverZoneContext.items.length,
						)

						//remove any extra info from source array's ids removed
						for (const id of targetIds) {
							delete this.selectedListItemFirst.context.itemsExtras[id]
						}

						//waits for the reordering to occur, allowing the effect that sets the new index, to run
						await tick()

						//reselect items to update their state
						for (const id of targetIds) {
							this.itemSelect(id, this.hoverZoneContext.itemsExtras[id].idx, this.hoverZoneContext)
						}
						//update the context of first selected (and last selected?) to new list
						this.selectedListItemFirst.context = this.hoverZoneContext
					} else {
						// im gonna be so honest i don't really know why forcing
						// the offset to 1 before any placeholder checks when
						// outside the originating list works
						// offset = 1
						arrayMoveToArray(
							this.mDownListItemContext.items,
							this.mDownListItemIndex,
							this.hoverZoneContext.items,
							this.hoverZoneContext.items.length,
						)
					}
				}
				this.resetDragState()
				return
			}
			//from here on out, its doing checks related to dropping items on other items. so exit otherwise.
			if (this.hoverListItemIndex === null || this.draggingHalf === null) {
				this.resetDragState()
				return
			}
			let offset = -1
			if (this.selectedListItems.length > 1) {
				// offset = this.hoverListItemIndex < this.selectedListItems[0].idx ? 1 : -(this.selectedListItems.length - 1)
				if (this.hoverListItemIndex < this.selectedListItems[0].idx) {
					offset = 1
				} else {
					offset = 1
					for (const item of this.selectedListItems) {
						if (this.hoverListItemIndex > item.idx) offset--
					}
				}
			} else {
				offset = this.hoverListItemIndex < this.mDownListItemIndex ? 1 : 0
			}
			if (this.draggingHalf === "bottom") {
				//fancy thing just changing which function to use if dragging across contexts or not
				if (this.isDraggingItemInSameContext()) {
					if (this.selectedListItems.length > 1 && this.selectedListItemFirst !== null) {
						console.log("dropped multiple")
						arrayMove(
							this.mDownListItemContext.items,
							this.selectedListItems.map((a) => a.idx),
							this.hoverListItemIndex + offset,
						)

						//waits for the reordering to occur, allowing the effect that sets the new index, to run
						await tick()

						//reselect items to update their state
						const targetIds = this.selectedListItems.map((v) => v.id)
						for (const id of targetIds) {
							console.log("item id being operated on", id)
							console.log("before item select", $state.snapshot(this.selectedListItems))
							this.itemSelect(
								id,
								this.selectedListItemFirst.context.itemsExtras[id].idx,
								this.selectedListItemFirst.context,
							)
							console.log("after item select", $state.snapshot(this.selectedListItems))
						}
					} else {
						arrayMove(this.mDownListItemContext.items, this.mDownListItemIndex, this.hoverListItemIndex + offset)
					}
				} else {
					// im gonna be so honest i don't really know why forcing
					// the offset to 1 before any placeholder checks when
					// outside the originating list works
					offset = 1
					if (
						this.selectedListItems.length > 1 &&
						this.selectedListItemFirst !== null &&
						this.hoverListItemContext !== null &&
						this.selectedListItemLastSelected !== null
					) {
						const targetIds = this.selectedListItems.map((a) => a.id)
						arrayMoveToArray(
							this.mDownListItemContext.items,
							this.selectedListItems.map((a) => a.idx),
							this.hoverZoneContext.items,
							this.hoverListItemIndex + offset,
						)

						//remove any extra info from source array's ids removed
						for (const id of targetIds) {
							delete this.selectedListItemFirst.context.itemsExtras[id]
						}

						//waits for the reordering to occur, allowing the effect that sets the new index, to run
						await tick()

						//reselect items to update their state
						for (const id of targetIds) {
							this.itemSelect(id, this.hoverListItemContext.itemsExtras[id].idx, this.hoverListItemContext)
						}
						//update the context of first selected (and last selected?) to new list
						this.selectedListItemFirst.context = this.hoverListItemContext
					} else {
						// im gonna be so honest i don't really know why forcing
						// the offset to 1 before any placeholder checks when
						// outside the originating list works
						// offset = 1
						arrayMoveToArray(
							this.mDownListItemContext.items,
							this.mDownListItemIndex,
							this.hoverZoneContext.items,
							this.hoverListItemIndex + offset,
						)
					}
				}

				//   console.log("bottom", dragState.mouseDownOnItemIndex, dragState.activeHoverItemIndex + offset);
			} else {
				if (this.isDraggingItemInSameContext()) {
					if (this.selectedListItems.length > 1 && this.selectedListItemFirst !== null) {
						console.log("dropped multiple")
						arrayMove(
							this.mDownListItemContext.items,
							this.selectedListItems.map((a) => a.idx),
							this.hoverListItemIndex + offset - 1,
						)

						//waits for the reordering to occur, allowing the effect that sets the new index, to run
						await tick()

						//reselect items to update their state
						const targetIds = this.selectedListItems.map((v) => v.id)
						for (const id of targetIds) {
							console.log("item id being operated on", id)
							console.log("before item select", $state.snapshot(this.selectedListItems))
							this.itemSelect(
								id,
								this.selectedListItemFirst.context.itemsExtras[id].idx,
								this.selectedListItemFirst.context,
							)
							console.log("after item select", $state.snapshot(this.selectedListItems))
						}
					} else {
						arrayMove(this.mDownListItemContext.items, this.mDownListItemIndex, this.hoverListItemIndex + offset - 1)
					}
				} else {
					// im gonna be so honest i don't really know why forcing
					// the offset to 1 before any placeholder checks when
					// outside the originating list works

					offset = 1
					if (
						this.selectedListItems.length > 1 &&
						this.selectedListItemFirst !== null &&
						this.hoverListItemContext !== null
					) {
						const targetIds = this.selectedListItems.map((v) => v.id)
						arrayMoveToArray(
							this.mDownListItemContext.items,
							this.selectedListItems.map((a) => a.idx),
							this.hoverZoneContext.items,
							this.hoverListItemIndex + offset - 1,
						)

						//remove any extra info from source array's ids removed
						for (const id of targetIds) {
							delete this.selectedListItemFirst.context.itemsExtras[id]
						}

						//waits for the reordering to occur, allowing the effect that sets the new index, to run
						await tick()

						//reselect items to update their state
						for (const id of targetIds) {
							this.itemSelect(id, this.hoverListItemContext.itemsExtras[id].idx, this.hoverListItemContext)
						}
						//update the context of first selected (and last selected?) to new list
						this.selectedListItemFirst.context = this.hoverListItemContext
					} else {
						// im gonna be so honest i don't really know why forcing
						// the offset to 1 before any placeholder checks when
						// outside the originating list works
						// offset = 1
						arrayMoveToArray(
							this.mDownListItemContext.items,
							this.mDownListItemIndex,
							this.hoverZoneContext.items,
							this.hoverListItemIndex + offset - 1,
						)
					}
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

		this.dragVanityElm = document.createElement("div")
		this.dragVanityElm.classList.add("drag-vanity", "dnd-dragging")
		document.body.append(this.dragVanityElm)

		//we can't normally use effects in non-component files, but effect.root allows us to!!
		$effect.root(() => {
			//always sort whenever the array is changed. this is a little scary because it mutates itself directly,
			//and im not sure if this will have consequences of tracking itself or if svelte accounts for that.
			$effect(() => {
				this.selectedListItems.sort((a, b) => a.idx - b.idx)
			})

			//determines if a clone should be made, and to unselect everything
			$effect(() => {
				if (this.mDownElm === null || !this.isDragging || this.dragVanityElm === null) return

				// console.log("make clone", this.selectedListItems.length, $state.snapshot(this.selectedListItemFirst))
				document.body.style.cursor = "move"
				if (this.selectedListItems.length > 1 && this.selectedListItemFirst !== null) {
					console.log("multiple clones")
					for (const item of this.selectedListItems) {
						console.log("making clone of elm", this.selectedListItemFirst.context.itemsExtras[item.id].elm)
						this.dragVanityElm.appendChild(this.selectedListItemFirst.context.itemsExtras[item.id].elm.cloneNode(true))
					}
				} else {
					this.dragVanityElm.appendChild(this.mDownElm.cloneNode(true))
				}
				// this.selectedListItems = []
			})

			//updates clone position
			$effect(() => {
				if (this.dragVanityElm === null) return
				this.dragVanityElm.style.top = this.clientY + "px"
				this.dragVanityElm.style.left = this.clientX + "px"
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

export function getState() {
	return getContext(SYMBOL) as DraggableState
}

export function setState() {
	return setContext(SYMBOL, new DraggableState())
}
