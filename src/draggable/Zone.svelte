<script lang="ts">
	import type { Snippet } from "svelte"
	import { getState } from "./DraggableState.svelte"
	import { globalDragState } from "./DragGlobalState.svelte"
	const dragState = getState()

	const { children, zoneTag = null }: { children?: Snippet; zoneTag?: string | null } = $props()

	zoneTag === null ? (dragState.zoneTag = globalDragState.createDragZoneTag()) : (dragState.zoneTag = zoneTag)

	dragState.zoneId === null
		? (dragState.zoneId = window.crypto.randomUUID())
		: console.error(
				"Draggable error: more than one zone is defined as a child of root. If using multiple nested zones, ensure each has a root as a parent.",
			)

	// does not bubble, so acts like capture by default
	function onmouseenter(e: MouseEvent) {
		// e.stopPropagation()
		// console.log(dragState.zoneTag)
		if (dragState.zoneTag === null || dragState.zoneId === null) return
		globalDragState.hoverDragZoneTracker.push(dragState.zoneTag)
		globalDragState.hoverDragZoneIdTracker.push(dragState.zoneId)
    console.log($state.snapshot(dragState.parentZoneIds))
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

	// function onmousemove(e: MouseEvent) {
	//   e.stopPropagation()
	//   // e.stopImmediatePropagation()
	//   globalDragState.mOverDragZoneTag = dragState.zoneTag;
	// }
</script>
<div {onmouseenter} {onmouseleave}>
<!-- <p>tesaat</p> -->
	{@render children?.()}
</div>
