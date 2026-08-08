<script lang="ts">
  import { RenderScan } from "svelte-render-scan";
  import DragAndDropDemo from "./DragAndDropDemo.svelte";

  function oncontextmenu(e: Event) {
    e.preventDefault();
  }

</script>

<svelte:window {oncontextmenu} />

<!-- setting to false doesn't work for whatever reason -->
<RenderScan initialEnabled={false} />

<DragAndDropDemo />
