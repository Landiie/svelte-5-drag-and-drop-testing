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
  dragState.dragHandle = dragHandle;
</script>

<div class="debug-info"></div>
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
