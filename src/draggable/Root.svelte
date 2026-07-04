<script lang="ts">
  import type { Snippet } from "svelte";
  import { getState as getDragState, setState } from "./DraggableState.svelte";
  import { arrayMove } from "../utils";

  const {
    items = $bindable(),
    dragHandle = false,
    children,
  }: { items: any[]; dragHandle?: boolean; children?: Snippet } = $props();

  const DRAG_DEADZONE_X = 5;
  const DRAG_DEADZONE_Y = 5;

  setState(items);
  const dragState = getDragState();

  let clientX = $state(-1);
  let clientY = $state(-1);

  let dragVanityElm = $state<HTMLElement | null>(null);

  function onmouseup(e: MouseEvent) {
    if (e.button !== 0) {
      e.preventDefault();
      return;
    }
    document.body.style.cursor = "default";

    //process drop target if any
    if (
      dragState.activeHoverItemId !== null &&
      dragState.activeDragItemId !== null &&
      dragState.mouseDownOnItemIndex !== null &&
      dragState.activeHoverItemIndex !== null
    ) {
      if (
        dragState.activeHoverItemIndex === dragState.mouseDownOnItemIndex ||
        (dragState.activeHoverItemIndex === dragState.mouseDownOnItemIndex - 1 &&
          dragState.placeholderPosition === "bottom") ||
        (dragState.activeHoverItemIndex === dragState.mouseDownOnItemIndex + 1 &&
          dragState.placeholderPosition === "top")
      ) {
        resetDragState();
        return; //don't run on dropping in place
      }

      console.log("dropped!");
      let offset = 0;
      if (dragState.activeHoverItemIndex < dragState.mouseDownOnItemIndex) offset = 1;
      if (dragState.placeholderPosition === "bottom") {
        arrayMove(items, dragState.mouseDownOnItemIndex, dragState.activeHoverItemIndex + offset);
        console.log("bottom", dragState.mouseDownOnItemIndex, dragState.activeHoverItemIndex + offset);
      } else {
        arrayMove(items, dragState.mouseDownOnItemIndex, dragState.activeHoverItemIndex + offset - 1);
        console.log("top", dragState.mouseDownOnItemIndex, dragState.activeHoverItemIndex + offset - 1);
      }
    }
    resetDragState();
  }

  function resetDragState() {
    dragState.activeDragItemId = null;
    dragState.activeDragItemElm = null;
    dragState.mouseDownOnItemId = null;
    dragState.mouseDownOnItemElm = null;
    dragState.mouseDownOnItemIndex = null;
    dragState.mouseDownOnDragHandle = false;
    dragState.activeHoverItemIndex = null;
  }

  function onmousemove(e: MouseEvent) {
    clientX = e.pageX;
    clientY = e.pageY;

    console.log(dragState.dragHandle, dragState.mouseDownOnDragHandle)
    if (dragState.dragHandle && !dragState.mouseDownOnDragHandle) return
    if (dragState.mouseDownOnItemId === null) return;
    // console.log(e)
    if (dragState.activeDragItemId === null) {
      if (
        e.pageX > dragState.holdXOrigin + DRAG_DEADZONE_X ||
        e.pageX < dragState.holdXOrigin - DRAG_DEADZONE_X ||
        e.pageY > dragState.holdYOrigin + DRAG_DEADZONE_Y ||
        e.pageY < dragState.holdYOrigin - DRAG_DEADZONE_Y
      ) {
        dragState.activeDragItemId = dragState.mouseDownOnItemId;
        dragState.activeDragItemElm = dragState.mouseDownOnItemElm;
        // isBeingDraggedOver = true;
      }
      return;
    }
  }

  // function onmousemove(e: MouseEvent) {
  //   e.preventDefault()
  //   console.log('root', e.target)
  // }

  $effect(() => {
    if (dragState.activeDragItemElm === null || dragVanityElm === null) return;
    document.body.style.cursor = "move";
    const clonedElm = dragState.activeDragItemElm.cloneNode(true) as HTMLElement;
    dragVanityElm.appendChild(clonedElm);
  });

  $effect(() => {
    if (dragVanityElm === null) return;
    dragVanityElm.style.top = clientY + "px";
    dragVanityElm.style.left = clientX + "px";
  });
</script>

<div class="debug-info">
  <p>mouseDownOnItemId: {dragState.mouseDownOnItemId}</p>
  <p>mouseDownOnItemElm: {dragState.mouseDownOnItemElm}</p>
  <p>activeDragItemId: {dragState.activeDragItemId}</p>
  <p>activeDragItemElm: {dragState.activeDragItemElm}</p>
  <p>activeHoverItemId: {dragState.activeHoverItemId}</p>
  <p>placeholderPosition {dragState.placeholderPosition}</p>
</div>
<svelte:window {onmouseup} {onmousemove} />
{#if dragState.activeDragItemElm !== null}
  <div bind:this={dragVanityElm} class="drag-vanity dnd-dragging"></div>
{/if}
{@render children?.()}

<style>
  .debug-info {
    background-color: red;
    /* position: fixed; */
  }
  .drag-vanity {
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
  }
</style>
