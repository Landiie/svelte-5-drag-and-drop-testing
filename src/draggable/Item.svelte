<script lang="ts">
  import type { Snippet } from "svelte";
  import { getState as getDragState } from "./DraggableState.svelte";
  import { globalDragState } from "./DragGlobalState.svelte";

  import DragPlaceholder from "./DragPlaceholder.svelte";

  const { children, id, itemIndex }: { children?: Snippet; id: string; itemIndex: number } = $props();

  const dragState = getDragState();

  let elm: null | HTMLElement = null;

  // let isMouseDown = false;
  // let isDragging = $state(false);
  let isBeingDraggedOver = $derived(
    globalDragState.isDragging &&
      globalDragState.hoverListItemIndex === itemIndex &&
      dragState.items === globalDragState.hoverListItemOrigin,
  );
  // let draggedOverTargetBounds: null | DOMRect = null;
  // let placeholderPosition = $state<"top" | "bottom" | null>(null);
  //$inspect(isBeingDraggedOver);

  // has priority over direct element being clicked (like the optional item handle)
  // intended to let item handle (if exists) know ahead of time what item its clicking
  function onmousedowncapture(e: MouseEvent) {
    if (elm === null) return;
    globalDragState.mouseDownOnItem(
      e,
      itemIndex,
      dragState.items,
      elm,
      dragState.dragHandle,
      globalDragState.hoverDragZone,
    );
  }

  function onmouseenter(e: MouseEvent) {
    // globalDragState.hoverListItemIndex = id;
    globalDragState.hoverListItemIndex = itemIndex;
    globalDragState.hoverListItemOrigin = dragState.items;
  }

  // use capture since lists could be nested, and we'd want to process the frontmost one.
  // this still processes each underlying item, but the end result is the frontmost.
  function onmousemovecapture(e: MouseEvent) {
    // console.log(isBeingDraggedOver);
    if (isBeingDraggedOver && elm !== null) {
      const bounds = elm.getBoundingClientRect();
      //console.log(e.clientY, bounds.top, bounds.top + bounds.height / 2);
      if (e.clientY > bounds.top + bounds.height / 2) {
        // placeholderPosition = "bottom";
        globalDragState.draggingHalf = "bottom";
      } else {
        // placeholderPosition = "top";
        globalDragState.draggingHalf = "top";
      }
    } else {
      // placeholderPosition = null;
      globalDragState.draggingHalf = null;
    }
  }

  function onmouseleave(e: MouseEvent) {
    // placeholderPosition = null;
    globalDragState.draggingHalf = null;
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

  function allowedPlaceholderBottom() {
    return (
      isBeingDraggedOver &&
      !globalDragState.isDraggingItemInMismatchingZoneTag() &&
      !globalDragState.isDraggingItemInSamePlace() &&
      !globalDragState.isDraggingItemDirectlyAboveItself() &&
      globalDragState.draggingHalf === "bottom"
    );
  }

  function allowedPlaceholderTop() {
    return (
      isBeingDraggedOver &&
      !globalDragState.isDraggingItemInMismatchingZoneTag() &&
      !globalDragState.isDraggingItemInSamePlace() &&
      !globalDragState.isDraggingItemDirectlyBelowItself() &&
      globalDragState.draggingHalf === "top"
    );
  }
  $inspect(allowedPlaceholderTop())
</script>

<!-- <svelte:window {onmouseup} {onmousemove}/> -->
{#if allowedPlaceholderTop()}
  <DragPlaceholder />
{/if}
<div bind:this={elm} {onmousedowncapture} {onmouseenter} {onmousemovecapture} {onmouseleave}>
  {@render children?.()}
</div>
{#if allowedPlaceholderBottom()}
  <DragPlaceholder />
{/if}

<style>
  div {
    width: 100%;
    height: 100%;
  }
</style>
