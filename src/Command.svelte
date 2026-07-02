<script lang="ts">
  const { name }: { name: string } = $props();
</script>

<div class="base">
  <div class="nav">
    <div class="up"></div>
    <div class="drag-handle"></div>
    <div class="down"></div>
  </div>
  <div class="base-contents">
    <div class="base-header">
      <p>{name}</p>
    </div>
    <div class="base-main">
      <div class="config"></div>
      <div class="fields"></div>
    </div>
  </div>
</div>

<style>
  .base {
    display: flex;
    min-height: 5rem;
  }
  .nav {
    width: 2rem;
    background-color: yellow;
    display: flex;
    flex-direction: column;

    .up {
      height: auto;
      flex-grow: 1;
      background-color: red;
    }
    .drag-handle {
      height: auto;
      flex-grow: 3;
      background-color: orange;
    }
    .down {
      height: auto;
      flex-grow: 1;
      background-color: blue;
    }
  }
  /* .base-main {
    display: flex;
  } */
</style>
