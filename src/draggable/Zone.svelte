<script lang="ts">
  import type { Snippet } from "svelte";
  import { getState } from "./DraggableState.svelte";
  const dragState = getState();

  const { children }: { children?: Snippet } = $props();

  function onmouseleave(e: MouseEvent) {
    dragState.activeHoverItemId = null;
  }
</script>

<div {onmouseleave}>
  {@render children?.()}
</div>
