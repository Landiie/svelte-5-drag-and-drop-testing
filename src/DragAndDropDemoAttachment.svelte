<script lang="ts">
  import ListItem from "./ListItem.svelte";
  import { draggableZone } from "./attachments/draggableZone";

  type item = {
    id: String;
    name: String;
  };

  let itemList1 = $state<item[]>([
    { id: "item1", name: "item 1" },
    { id: "item2", name: "item 2" },
    { id: "item3", name: "item 3" },
    { id: "item4", name: "item 4" },
    { id: "item5", name: "item 5" },
  ]);
  let itemList2 = $state<item[]>([
    { id: "item1", name: "item 1" },
    { id: "item2", name: "item 2" },
    { id: "item3", name: "item 3" },
    { id: "item4", name: "item 4" },
    { id: "item5", name: "item 5" },
  ]);

  // $inspect(itemList1);
  let itemList1ActiveDraggedItem = $state<string | null>(null);
  let itemList2ActiveDraggedItem = $state<string | null>(null);

  const setActiveDraggedItemList1 = (id: string | null) => {
    itemList1ActiveDraggedItem = id;
  };
  const setActiveDraggedItemList2 = (id: string | null) => {
    itemList2ActiveDraggedItem = id;
  };
</script>

<ul {@attach draggableZone(itemList1, setActiveDraggedItemList1)} class="list-1">
  {#each itemList1 as item (item.id)}
    <!-- <DraggableItem {...item} /> -->
    <ListItem {...item} isDragging={itemList1ActiveDraggedItem === item.id} />
  {/each}
</ul>
<ul {@attach draggableZone(itemList2, setActiveDraggedItemList2)} class="list-2">
  {#each itemList2 as item (item.id)}
    <!-- <DraggableItem {...item} /> -->
    <ListItem {...item} isDragging={itemList2ActiveDraggedItem === item.id} />
  {/each}
</ul>

<style>
  .list-1 {
    background-color: blue;
    margin: 10rem;
    overflow-y: auto;
    max-height: 20rem;
  }
  .list-2 {
    background-color: green;
  }
</style>
