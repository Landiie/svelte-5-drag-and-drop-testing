<script lang="ts">
  import { getState } from "./draggable/DraggableState.svelte";
  import { Draggable } from "./draggable/index.svelte";

  const { name, lineNumber }: { name: string; lineNumber: number } = $props();

  const dragState = getState();
  function onmouseenter(e: MouseEvent) {
    if (dragState.activeDragItemId !== null) return;
    ((e.target as HTMLElement).parentNode as HTMLElement).style.minHeight = "5rem";
    ((e.target as HTMLElement).querySelector(".up") as HTMLElement).style.flexGrow = "1";
    ((e.target as HTMLElement).querySelector(".down") as HTMLElement).style.flexGrow = "1";
  }

  function onmouseleave(e: MouseEvent) {
    if (dragState.activeDragItemId !== null) return;
    ((e.target as HTMLElement).parentNode as HTMLElement).style.minHeight = "3rem";
    ((e.target as HTMLElement).querySelector(".up") as HTMLElement).style.flexGrow = "0";
    ((e.target as HTMLElement).querySelector(".down") as HTMLElement).style.flexGrow = "0";
  }
</script>

<div class="base">
  <div class="line-number">{lineNumber}</div>
  <div class="nav">
    <div class="up"></div>
    <Draggable.ItemHandle>
      <div class="drag-handle">a</div>
    </Draggable.ItemHandle>
    <div class="down"></div>
  </div>
  <div class="base-contents">
    <!-- <div class="base-header">
      <p class="command-name">{name}</p>
      <div class="config">
        <button>a</button>
        <button>a</button>
        <button>a</button>
      </div>
    </div> -->
    <div class="fields">
      <div>
        <label for="">test</label>
        <input type="text" />
      </div>
      <div>
        <label for="">test</label>
        <input type="text" style="text-decoration: none;" />
      </div>
      <div>
        <label for="">test</label>
        <input type="text" />
      </div>
    </div>
  </div>
</div>

<style>
  .fields {
    min-width: 0;
    gap: 0.25rem;
    display: flex;
    flex-grow: 1;
    & div {
      min-width: 0;
      display: flex;
      flex-direction: column;
      flex-grow: 1;
    }
  }
  .command-name {
    background-color: black;
    color: white;
    text-wrap: nowrap;
    position: static;
    overflow: hidden;
    text-overflow: ellipsis;
    max-width: 10rem;
  }
  .line-number {
    min-width: 1.5rem;
    background-color: aqua;
  }
  .base {
    display: flex;
    overflow: hidden;
    min-height: 3rem;
    /* outline-style: solid;
    outline-width: 0.125rem;
    outline-color: blue; */
  }
  .nav {
    min-width: 1.5rem;
    background-color: yellow;
    display: flex;
    flex-direction: column;
    .up {
      height: auto;
      flex-grow: 0;
      background-color: red;
    }
    .drag-handle {
      height: 100%;
      width: 100%;
      background-color: orange;
      /* pointer-events: none; */
    }
    /* &:hover {
      & .down {
        flex-grow: 1;
      }
      & .up {
        flex-grow: 1;
      }
    } */
    .down {
      height: auto;
      flex-grow: 0;
      background-color: blue;
    }
  }

  .base-contents {
    flex-grow: 1;
    min-width: 0;
    display: flex;
  }

  .base-header {
    max-width: 10rem;
    background-color: purple;
    margin-right: 0.3rem;
  }

  .base-main {
    display: flex;
  }
  /* .base-main {
    display: flex;
  } */
</style>
