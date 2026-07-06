<script lang="ts">
  import type { Snippet } from "svelte";
  import { getState } from "./DraggableState.svelte";
  import { globalDragState } from "./DragGlobalState.svelte";
  const dragState = getState();

  const { children, zoneTag = null }: { children?: Snippet; zoneTag?: string | null } = $props();

  zoneTag === null ? (dragState.zoneTag = globalDragState.createDragZoneTag()) : (dragState.zoneTag = zoneTag);

  // does not bubble, so acts like capture by default
  function onmouseenter(e: MouseEvent) {
    // e.stopPropagation()
    // console.log(dragState.zoneTag)
    if (dragState.zoneTag === null) return;
    globalDragState.hoverDragZoneTracker.push(dragState.zoneTag);
  }

  function onmouseleave(e: MouseEvent) {
    // e.stopPropagation()
    if (dragState.zoneTag === null) return;
    globalDragState.hoverDragZoneTracker.splice(globalDragState.hoverDragZoneTracker.findLastIndex((v) => {return v === dragState.zoneTag}), 1)
  }

  // function onmousemove(e: MouseEvent) {
  //   e.stopPropagation()
  //   // e.stopImmediatePropagation()
  //   globalDragState.mOverDragZoneTag = dragState.zoneTag;
  // }
</script>

<div {onmouseenter} {onmouseleave}>
  {@render children?.()}
</div>
