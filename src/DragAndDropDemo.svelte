<script lang="ts">
  import { draggableZone } from "./attachments/draggableZone";
  import Command from "./Command.svelte";
  import { Draggable } from "./draggable/index.svelte";

  type item = {
    id: number;
    name: string;
  };

  let items = $state<item[]>([
    // {
    //   id: "0",
    //   name: "item 1",
    // },
    // {
    //   id: "1",
    //   name: "item 2",
    // },
    // {
    //   id: "2",
    //   name: "item 3",
    // },
    // {
    //   id: "3",
    //   name: "item 4",
    // },
    // {
    //   id: "4",
    //   name: "item 5",
    // },
  ]);

  for (let i = 0; i < 200; i++) {
    items.push({ id: i, name: "item " + i });
  }
</script>

<Draggable.Root bind:items>
  <Draggable.Zone>
    <div class="zone">
      {#each items as item, i (item.id)}
        <Draggable.Item id={item.id} itemIndex={i}>
          <Command name={item.name} lineNumber={i} />
        </Draggable.Item>
      {/each}
    </div>
  </Draggable.Zone>
</Draggable.Root>

<style>
  p {
    padding: 1rem;
    background-color: red;
  }
  .zone {
    padding-top: 1rem;
    padding-bottom: 1rem;
    background-color: green;
  }
</style>
