<script lang="ts">
  import { onMount, type Snippet } from "svelte";
  import { getState as getDragState, setState as setDragState } from "./DraggableState.svelte";
  import { globalDragState } from "./DragGlobalState.svelte";
  import { generateHash } from "../utils";

  const {
    items = $bindable(),
    dragHandle = false,
    children,
  }: { items: any[]; dragHandle?: boolean; children?: Snippet } = $props();

  setDragState(items);
  const dragState = getDragState();
</script>

<div class="debug-info-global" style="background-color: yellow;">
  <p>GLOBAL drag state debug</p>
  <p>mDownListItemIndex: {globalDragState.mDownListItemIndex}</p>
  <p>mDownListItemOrigin: {generateHash(String(globalDragState.mDownListItemOrigin))}</p>
  <!-- <p>mouseDownOnItemId: {dragState.mouseDownOnItemId}</p>
  <p>mouseDownOnItemElm: {dragState.mouseDownOnItemElm}</p>
  <p>activeDragItemId: {dragState.activeDragItemId}</p>
  <p>activeDragItemElm: {dragState.activeDragItemElm}</p>
  <p>activeHoverItemId: {dragState.activeHoverItemId}</p>
  <p>placeholderPosition {dragState.placeholderPosition}</p> -->
</div>

<div class="debug-info">
  <p>mouseDownOnItemId: {dragState.mouseDownOnItemId}</p>
  <p>mouseDownOnItemElm: {dragState.mouseDownOnItemElm}</p>
  <p>activeDragItemId: {dragState.activeDragItemId}</p>
  <p>activeDragItemElm: {dragState.activeDragItemElm}</p>
  <p>activeHoverItemId: {dragState.activeHoverItemId}</p>
  <p>placeholderPosition {dragState.placeholderPosition}</p>
</div>
{@render children?.()}

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
