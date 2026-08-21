<script lang="ts">
	import type { Snippet } from "svelte"
	import { getState } from "./DraggableState.svelte"
	import { getState as getGlobalDragState } from "./DragGlobalState.svelte"
	const globalDragState = getGlobalDragState()
	const dragState = getState()

	const { children, zoneTag = null }: { children?: Snippet; zoneTag?: string | null } = $props()

	zoneTag === null ? (dragState.zoneTag = globalDragState.createDragZoneTag()) : (dragState.zoneTag = zoneTag)

	if (dragState.zoneId === null) {
		dragState.zoneId = window.crypto.randomUUID()
	}

	// does not bubble, so acts like capture by default
	function onmouseenter(e: MouseEvent) {
		// e.stopPropagation()
		// console.log(dragState.zoneTag)
		if (dragState.zoneTag === null || dragState.zoneId === null) return
		globalDragState.hoverDragZoneTracker.push(dragState.zoneTag)
		globalDragState.hoverDragZoneIdTracker.push(dragState.zoneId)
		globalDragState.hoverListItemIndex = null
		globalDragState.hoverListItemContext = null
	}

	function onmouseleave(e: MouseEvent) {
		// e.stopPropagation()
		if (dragState.zoneTag === null) return
		globalDragState.hoverDragZoneTracker.splice(
			globalDragState.hoverDragZoneTracker.findLastIndex((v) => {
				return v === dragState.zoneTag
			}),
			1,
		)
		globalDragState.hoverDragZoneIdTracker.splice(
			globalDragState.hoverDragZoneIdTracker.findLastIndex((v) => {
				return v === dragState.zoneId
			}),
			1,
		)
	}

	// use capture since lists could be nested, and we'd want to process the frontmost one.
	// this still processes each underlying item, but the end result is the frontmost.
	function onmousemovecapture(e: MouseEvent) {
		// console.log(isBeingDraggedOver);
		if (dragState.zoneId !== globalDragState.hoverDragZoneId) return
		if (globalDragState.hoverZoneContext !== dragState) globalDragState.hoverZoneContext = dragState
		if (!globalDragState.isDragging || dragState.items.length > 0) return
		console.log("moving in id", dragState.zoneId)
	}

	// function onmousemove(e: MouseEvent) {
	//   e.stopPropagation()
	//   // e.stopImmediatePropagation()
	//   globalDragState.mOverDragZoneTag = dragState.zoneTag;
	// }
</script>

<div {onmouseenter} {onmouseleave} {onmousemovecapture} style="background-color: yellow;">
	<!-- <p>tesaat</p> -->
	{@render children?.()}
</div>
