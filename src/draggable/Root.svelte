<script lang="ts">
	import { onDestroy, onMount, type Snippet } from "svelte"
	import { getState as getDragState, setState as setDragState } from "./DraggableState.svelte"
	import { globalDragState } from "./DragGlobalState.svelte"
	import { generateHash } from "../utils"
	import ItemSelectBox from "./ItemSelectBox.svelte"

	const { items = $bindable(), children }: { items: any[]; children?: Snippet } = $props()


	setDragState(items)
	const dragState = getDragState()

	function onmousedown(e: MouseEvent) {
		globalDragState.isDraggingSelect = true
		globalDragState.dragSelectRoot = dragState
	}

	onDestroy(() => {})
</script>

<!-- <div class="debug-info"></div> -->
{#if dragState.isRootDragRoot}
	{#if !globalDragState.isDragging && globalDragState.isDraggingSelect && globalDragState.dragSelectRoot === dragState}
		<ItemSelectBox />
	{/if}
	<div {onmousedown}>
		{@render children?.()}
	</div>
{:else}
	{@render children?.()}
{/if}

<style>
	.debug-info {
		background-color: red;
		/* position: fixed; */
	}
	/* .drag-vanity {
    background-color: blue;
    opacity: 0.8;
    height: 1rem;
    position: absolute;
    height: auto;
    width: auto;
    top: 0;
    left: 0;
    outline: 1px yellow !important;
    pointer-events: none;
  } */
</style>
