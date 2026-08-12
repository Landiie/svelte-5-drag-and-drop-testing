<script lang="ts">
	import type { Snippet } from "svelte"
	import { getState as getDragState } from "./DraggableState.svelte"
	import { getState as getGlobalDragState } from "./DragGlobalState.svelte"
	const globalDragState = getGlobalDragState()

	import DragPlaceholder from "./DragPlaceholder.svelte"
	import type { itemType } from "../types"
	import { arrayOfObjsIncludes, arrayRemoveItemAll } from "../utils"

	const { children, id, itemIndex }: { children?: Snippet; id: string; itemIndex: number } = $props()

	const dragState = getDragState()

	let elm: null | HTMLElement = null

	// let isMouseDown = false;
	// let isDragging = $state(false);
	let isBeingDraggedOver = $derived(
		globalDragState.isDragging &&
			globalDragState.hoverListItemIndex === itemIndex &&
			dragState.items === globalDragState.hoverListItemOrigin,
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
		if (elm === null || dragState.zoneId == null) return
		globalDragState.mouseDownOnItem(
			e,
			itemIndex,
			dragState.items,
			elm,
			dragState.dragHandle,
			globalDragState.hoverDragZone,
			id,
			dragState.zoneId,
		)
	}

	function onmouseenter(e: MouseEvent) {
		// globalDragState.hoverListItemIndex = id;
		if (elm === null) return
		globalDragState.hoverListItemIndex = itemIndex
		globalDragState.hoverListItemOrigin = dragState.items
		if (globalDragState.isDraggingSelect) {
			globalDragState.handleItemSelect(e, dragState, id, itemIndex, elm)
		}
	}

	function onclick(e: MouseEvent) {
		if (elm === null) return
		globalDragState.handleItemSelect(e, dragState, id, itemIndex, elm)
	}

	// use capture since lists could be nested, and we'd want to process the frontmost one.
	// this still processes each underlying item, but the end result is the frontmost.
	function onmousemovecapture(e: MouseEvent) {
		// console.log(isBeingDraggedOver);
		if (isBeingDraggedOver && elm !== null) {
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
		globalDragState.draggingHalf = null
	}

	function onfocusin(e: FocusEvent) {
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
		dragState.itemsExtras[id] = {elm}
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
	$inspect(allowedPlaceholderTop())
</script>

<!-- <svelte:window {onmouseup} {onmousemove}/> -->
{#if allowedPlaceholderTop()}
	<DragPlaceholder />
{/if}
<div
	class:selected={isSelected}
	bind:this={elm}
	{onmousedowncapture}
	{onmouseenter}
	{onmousemovecapture}
	{onmouseleave}
	{onclick}
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
