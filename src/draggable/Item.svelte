<script lang="ts">
	import { onMount, type Snippet } from "svelte"
	import { getState as getDragState } from "./DraggableState.svelte"
	import { getState as getGlobalDragState } from "./DragGlobalState.svelte"
	const globalDragState = getGlobalDragState()

	import DragPlaceholder from "./DragPlaceholder.svelte"
	import type { itemType } from "../types"
	import { arrayOfObjsIncludes, arrayRemoveItemAll } from "../utils"
	import { Draggable } from "./index.svelte"

	const { children, id, itemIndex }: { children?: Snippet; id: string; itemIndex: number } = $props()

	const dragState = getDragState()

	const ITEM_SELECT_CLICK_THRESHOLD = 5

	let elm: null | HTMLElement = null

	let mDownOnSelectedItem = false;

	// let isMouseDown = false;
	// let isDragging = $state(false);
	let isBeingDraggedOver = $derived(
		globalDragState.isDragging &&
			globalDragState.hoverListItemIndex === itemIndex &&
			globalDragState.hoverZoneContext !== null &&
			dragState.items === globalDragState.hoverZoneContext.items,
	)

	const isSelected = $derived(
		id !== undefined && dragState.zoneId !== id && arrayOfObjsIncludes(globalDragState.selectedListItems, "id", id),
	)

	// let draggedOverTargetBounds: null | DOMRect = null;
	// let placeholderPosition = $state<"top" | "bottom" | null>(null);
	//$inspect(isBeingDraggedOver);

	// has priority over direct element being clicked (like the optional item handle)
	// intended to let item handle (if exists) know ahead of time what item its clicking
	function onmousedowncapture(e: MouseEvent) {
		if (elm === null) return
		// if (!e.ctrlKey || !e.shiftKey) {
		// 	globalDragState.clearItemSelect()
		// }
		globalDragState.mouseDownOnItem(e, itemIndex, id, elm, dragState)
	}

	function onmousedown(e: MouseEvent) {
		e.stopPropagation()
		if (elm === null) return
		if (arrayOfObjsIncludes(globalDragState.selectedListItems, "id", id)) {
			mDownOnSelectedItem = true
			return
		} 
		globalDragState.handleItemSelect(e, dragState, id, itemIndex, elm)
	}

	function onmouseup(e: MouseEvent) {
		if (!mDownOnSelectedItem || elm === null) return
		mDownOnSelectedItem = false
		globalDragState.handleItemSelect(e, dragState, id, itemIndex, elm)
	}

	function onmouseenter(e: MouseEvent) {
		// globalDragState.hoverListItemIndex = id;
		if (elm === null) return
		globalDragState.hoverListItemIndex = itemIndex
		globalDragState.hoverListItemContext = dragState
		if (globalDragState.isDraggingSelect) {
			globalDragState.handleItemSelect(e, dragState, id, itemIndex, elm)
		}
	}

	// function onclick(e: MouseEvent) {
	// 	// e.stopPropagation()
	// 	if (elm === null) return
	// 	//prevents a click from registering if the mdown was too far from mup (when click actually registers)
	// 	if (
	// 		e.pageX > globalDragState.mDownX + ITEM_SELECT_CLICK_THRESHOLD ||
	// 		e.pageX < globalDragState.mDownX - ITEM_SELECT_CLICK_THRESHOLD ||
	// 		e.pageY > globalDragState.mDownY + ITEM_SELECT_CLICK_THRESHOLD ||
	// 		e.pageY < globalDragState.mDownY - ITEM_SELECT_CLICK_THRESHOLD
	// 	)
	// 		return
	// 	console.log(
	// 		"click registered, diff between origin:",
	// 		"x",
	// 		globalDragState.mDownX - e.pageX,
	// 		"y",
	// 		globalDragState.mDownY - e.pageY,
	// 	)
	// 	globalDragState.handleItemSelect(e, dragState, id, itemIndex, elm)
	// }

	// use capture since lists could be nested, and we'd want to process the frontmost one.
	// this still processes each underlying item, but the end result is the frontmost.
	function onmousemovecapture(e: MouseEvent) {
		// console.log(isBeingDraggedOver);
		if (isBeingDraggedOver && elm !== null && !globalDragState.isDraggingItemInEmptyList()) {
			const bounds = elm.getBoundingClientRect()
			//console.log(e.clientY, bounds.top, bounds.top + bounds.height / 2);
			if (e.clientY > bounds.top + bounds.height / 2) {
				// placeholderPosition = "bottom";
				globalDragState.draggingHalf = "bottom"
			} else {
				// placeholderPosition = "top";
				globalDragState.draggingHalf = "top"
			}
		} else {
			// placeholderPosition = null;
			globalDragState.draggingHalf = null
		}
	}

	function onmouseleave(e: MouseEvent) {
		// placeholderPosition = null;
		globalDragState.hoverListItemIndex = null
		globalDragState.hoverListItemContext = null
		globalDragState.draggingHalf = null
	}

	function onfocusin(e: FocusEvent) {
		e.stopImmediatePropagation()
		if (elm === null) return

		// if (elm === null && !(e.target instanceof Element)) return
		// //traverse up until elm matches
		// let targetElm = e.target as HTMLElement
		// while (targetElm !== elm) {
		// 	if (targetElm.parentElement === null) break;
		// 	targetElm = targetElm.parentElement
		// }
		// console.log('traverse result: ', targetElm === elm, targetElm, elm)
		globalDragState.handleItemSelect(e, dragState, id, itemIndex, elm)
	}

	// function onmouseover(e: MouseEvent) {
	//   // if (!dragState.activeDragItemId) return;
	//   dragState.activeHoverItemId = id
	//   // console.log(e.target, elm)
	//   // if (e.target === elm) {
	//   //   console.log('thas meeee')
	//   // }
	//   // const bounds = (e.target as HTMLElement).getBoundingClientRect()
	//   // console.log(bounds.bottom)
	// }

	//on drag, update drag item i
	// $effect(() => {
	//   isDragging ? (dragState.activeDragItemId = id) : (dragState.activeDragItemId = null);
	// });

	// $effect(() => {
	//   $inspect(isBeingDraggedOver)
	// })

	//

	$effect(() => {
		if (elm === null) return
		dragState.itemsExtras[id] = { elm, idx: itemIndex }
	})

	onMount(() => {
		return () => {
			// console.log("unmounted", id)
			//delete dragState.itemsExtras[id]
		}
	})

	function allowedPlaceholderBottom() {
		return (
			isBeingDraggedOver &&
			!globalDragState.isDraggingItemInMismatchingZoneTag() &&
			!globalDragState.isDraggingItemInSamePlace() &&
			!globalDragState.isDraggingItemDirectlyAboveItself() &&
			!globalDragState.isDraggingItemInsideItself() &&
			globalDragState.draggingHalf === "bottom"
		)
	}

	function allowedPlaceholderTop() {
		return (
			isBeingDraggedOver &&
			!globalDragState.isDraggingItemInMismatchingZoneTag() &&
			!globalDragState.isDraggingItemInSamePlace() &&
			!globalDragState.isDraggingItemDirectlyBelowItself() &&
			!globalDragState.isDraggingItemInsideItself() &&
			globalDragState.draggingHalf === "top"
		)
	}
	// $inspect(allowedPlaceholderTop())
</script>

<!-- <svelte:window {onmouseup} {onmousemove}/> -->
{#if allowedPlaceholderTop()}
	<DragPlaceholder />
{/if}
<div
	class:selected={isSelected}
	bind:this={elm}
	{onmousedowncapture}
	{onmousedown}
	{onmouseup}
	{onmouseenter}
	{onmousemovecapture}
	{onmouseleave}
	// {onclick}
	{onfocusin}
>
	{@render children?.()}
</div>
{#if allowedPlaceholderBottom()}
	<DragPlaceholder />
{/if}

<style>
	.selected {
		/* outline-style: solid; */
		/* outline-width: 0.125rem; */
		/* outline-color: yellow; */
		filter: brightness(140%) !important;
	}
	div {
		width: 100%;
		height: 100%;
	}
</style>
