<!--I dont know if i want to use this component yet-->
<script lang="ts">
	import { onMount } from "svelte"
	import { getState as getGlobalDragState } from "./DragGlobalState.svelte"
	const globalDragState = getGlobalDragState()

	let elm = $state<HTMLElement | null>(null)

	let initialX = $state(0)
	let initialY = $state(0)

	$effect(() => {
		if (elm === null || globalDragState.clientX === initialX || globalDragState.clientY === initialY) return
        elm.style.opacity = '0.4'
		elm.style.left = globalDragState.mDownXDiff < 0 ? `${initialX + globalDragState.mDownXDiff}px` : `${initialX}px`
		elm.style.top = globalDragState.mDownYDiff < 0 ? `${initialY + globalDragState.mDownYDiff}px` : `${initialY}px`
		elm.style.width = `${Math.abs(globalDragState.mDownXDiff)}px`
		elm.style.height = `${Math.abs(globalDragState.mDownYDiff)}px`
	})

	onMount(() => {
		initialX = globalDragState.clientX
		initialY = globalDragState.clientY
		if (elm === null) return
		elm.style.top = `${initialY}px`
		elm.style.left = `${initialX}px`
        elm.style.opacity = '0'
	})
</script>

<div bind:this={elm}></div>

<style>
	div {
        pointer-events: none;
		top: 0;
		left: 0;
		background-color: rgb(255, 220, 168);
		outline: 3px orange solid;
		opacity: 0.4;
		position: absolute;
	}
</style>
