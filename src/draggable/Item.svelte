<script lang="ts">
  import type { Snippet } from "svelte";
  import { getState } from "./DraggableState.svelte";
  import DragPlaceholder from "./DragPlaceholder.svelte";

  const { children, id, itemIndex }: { children?: Snippet; id: number; itemIndex: number } = $props();

  const dragState = getState();

  let elm: null | HTMLElement = null;

  let isMouseDown = false;
  let isDragging = $state(false);
  let isBeingDraggedOver = $derived(dragState.activeHoverItemId === id && dragState.activeDragItemId !== null);
  let draggedOverTargetBounds: null | DOMRect = null;
  let placeholderPosition = $state<"top" | "bottom" | null>(null);
  //$inspect(isBeingDraggedOver);

  function onmousedown(e: MouseEvent) {
    if (e.button !== 0) {
      e.preventDefault();
      return;
    }
    dragState.mouseDownOnItemId = id;
    dragState.mouseDownOnItemIndex = itemIndex;
    dragState.mouseDownOnItemElm = elm;
    dragState.holdXOrigin = e.clientX;
    dragState.holdYOrigin = e.clientY;
  }

  function onmouseenter(e: MouseEvent) {
    dragState.activeHoverItemId = id;
    dragState.activeHoverItemIndex = itemIndex;
  }

  function onmousemove(e: MouseEvent) {
    if (isBeingDraggedOver && elm !== null) {
      const bounds = elm.getBoundingClientRect();
      //console.log(e.clientY, bounds.top, bounds.top + bounds.height / 2);
      if (e.clientY > bounds.top + bounds.height / 2) {
        placeholderPosition = "bottom";
        dragState.placeholderPosition = "bottom";
      } else {
        placeholderPosition = "top";
        dragState.placeholderPosition = "top";
      }
    } else {
      placeholderPosition = null;
      dragState.placeholderPosition = null;
    }
  }

  function onmouseleave(e: MouseEvent) {
    placeholderPosition = null;
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
</script>

<!-- <svelte:window {onmouseup} {onmousemove}/> -->
{#if placeholderPosition === "top"}
  <DragPlaceholder />
{/if}
<div bind:this={elm} {onmousedown} {onmouseenter} {onmousemove} {onmouseleave}>
  {@render children?.()}
</div>
{#if placeholderPosition === "bottom"}
  <DragPlaceholder />
{/if}

<style>
</style>
