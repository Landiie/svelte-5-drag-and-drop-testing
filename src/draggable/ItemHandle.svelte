<script lang="ts">
  import { onMount, type Snippet } from "svelte";
  import { getState } from "./DraggableState.svelte";
  import { globalDragState } from "./DragGlobalState.svelte";

  let { children }: { children: Snippet } = $props();
  const dragState = getState();

  function onmousedown() {
    // dragState.mouseDownOnItemId should have a value even if handle
    // is above the item with the mouse down listener on it thanks to the item
    // using the capture method of event listening, taking a higher priority

    //im explaining this because i KNOW this is something im gonna forget in like 2 hours
    globalDragState.mDownOnDragHandle = true;
  }

  onMount(() => {
    dragState.dragHandle = true
  })
</script>

<div {onmousedown}>
  {@render children?.()}
</div>

<style>
div {
  width: 100%;
  height: 100%;
}
</style>
