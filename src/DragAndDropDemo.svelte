<script lang="ts">
	import { draggableZone } from "./attachments/draggableZone"
	import Command from "./Command.svelte"
	import DragAndDropDemoListRecursive from "./DragAndDropDemoListRecursive.svelte"
	import { globalDragState } from "./draggable/DragGlobalState.svelte"
	import { Draggable } from "./draggable/index.svelte"
	import Item from "./draggable/Item.svelte"
	import type { itemType } from "./types"
	import { generateHash } from "./utils"

	let items = $state<itemType[]>([
		{
			id: "0n1",
			name: "item 1",
			cmdContent: ``,
		},
		{
			id: "1n1",
			name: "item 2",
			cmdContent: ``,
		},
		{
			id: "2n1",
			name: "item 3",
			cmdContent: `RWAAAAAA`,
		},
		{
			id: "3n1",
			name: "item 4",
			cmdContent: `aaa`,
		},
		{
			id: "4n1",
			listColor: "blue",
			listVisible: true,
			list: [
				{
					id: "0n2",
					name: "item 1",
					cmdContent: ``,
				},
				{
					id: "1n2",
					name: "item 2",
					cmdContent: ``,
				},
				{
					id: "2n2",
					name: "item 3",
					cmdContent: ``,
				},
				{
					id: "",
					listColor: "purple",
					listVisible: false,

					list: [
						{
							id: "",
							name: "item 1",
							cmdContent: ``,
						},
						{
							id: "",
							name: "item 2",
							cmdContent: ``,
						},
						{
							id: "",
							name: "item 3",
							cmdContent: ``,
						},
						{
							id: "",
							name: "item 4",
							cmdContent: ``,
						},
						// {
						//   id: "4",
						//   list: [],
						// },
					],
				},
				{
					id: "3n2",
					name: "item 4",
					cmdContent: ``,
				},
				// {
				//   id: "4",
				//   list: [],
				// },
			],
		},
		{
			id: "5n1",
			name: "item 5",
			cmdContent: ``,
		},
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
	])
	let items2 = $state<itemType[]>([])
	let items3 = $state<itemType[]>([])

	assignUUIDs(items)

	function assignUUIDs(list: Record<string, any>[]) {
		for (const item of list) {
			item.id = window.crypto.randomUUID()
			if ("list" in item) {
				assignUUIDs(item.list)
			}
		}
	}

	// for (let i = 0; i < 5; i++) {
	//   items.push({ id: crypto.randomUUID(), name: "item " + i, cmdContent: `originally index ${i} from list 1` });
	// }
	// for (let i = 0; i < 10; i++) {
	//   items2.push({ id: crypto.randomUUID(), name: "item " + i, cmdContent: `originally index ${i} from list 2` });
	// }
	// for (let i = 0; i < 3; i++) {
	//   items3.push({ id: crypto.randomUUID(), name: "item " + i, cmdContent: `originally index ${i} from list 3` });
	// }
</script>

<!-- for testing nested lists (hell) -->
<div style="display: flex;">
	<div class="demo" style="flex-grow: 1;">
		<DragAndDropDemoListRecursive bind:items />
	</div>
	<div class="debug-info-global" style="background-color: yellow; flex-grow: 1;">
		<p>GLOBAL drag state debug</p>
		<h5 style="font-size: 2rem;">item down</h5>
		<p>id: {globalDragState.mDownListItemId}</p>
		<p>index: {globalDragState.mDownListItemIndex}</p>
		<p>origin (hash of list, not great): {generateHash(String(globalDragState.mDownListItemOrigin))}</p>
		<p>zone origin id: {globalDragState.mDownListItemZoneOriginId}</p>
		<p>mDownListItemZoneOrigin: {globalDragState.mDownListItemZoneOrigin}</p>
		<h5 style="font-size: 2rem;">hovering over list</h5>
		<p>index: {globalDragState.hoverListItemIndex}</p>
		<p>origin (list ref): {"NOT SHOWN"}</p>
		<p>drag zone (tag): {globalDragState.hoverDragZone}</p>
		<p>id: {globalDragState.hoverDragZoneId}</p>
		<h5 style="font-size: 2rem;">misc</h5>
		<p>isDragging: {globalDragState.isDragging}</p>
		<p>dragZoneTagCounter: {globalDragState.dragZoneTagCounter}</p>
		<!-- <p>mouseDownOnItemId: {dragState.mouseDownOnItemId}</p>
	  <p>mouseDownOnItemElm: {dragState.mouseDownOnItemElm}</p>
	  <p>activeDragItemId: {dragState.activeDragItemId}</p>
	  <p>activeDragItemElm: {dragState.activeDragItemElm}</p>
	  <p>activeHoverItemId: {dragState.activeHoverItemId}</p>
	  <p>placeholderPosition {dragState.placeholderPosition}</p> -->
	</div>
</div>

<!-- <div class="demo">
	<Draggable.Root bind:items>
		<Draggable.Zone zoneTag={"commands"}>
			<div class="zone">
				{#each items as item, i (item.id)}
					{#if item?.list}
						<Draggable.Item id={item.id} itemIndex={i}>
							<Draggable.ItemHandle>
								<div style="background-color: orange;">a</div>
							</Draggable.ItemHandle>
							<Draggable.Root bind:items={items[i].list}>
								<Draggable.Zone zoneTag={"commands"}>
									<div class="zone" style="padding: 1rem">
										{#each items[i].list as item, i (item.id)}
											<Draggable.Item id={item.id} itemIndex={i}>
												<Command
													name={item.name ? item.name : "??"}
													lineNumber={i}
													cmdContent={item.cmdContent ? item.cmdContent : "wawa"}
												/>
											</Draggable.Item>
										{/each}
									</div>
								</Draggable.Zone>
							</Draggable.Root>
						</Draggable.Item>
					{:else}
						<Draggable.Item id={item.id} itemIndex={i}>
							<Command
								name={item.name ? item.name : "??"}
								lineNumber={i}
								cmdContent={item.cmdContent ? item.cmdContent : "wawa"}
							/>
						</Draggable.Item>
					{/if}
				{/each}
			</div>
		</Draggable.Zone>
	</Draggable.Root>
</div> -->

<!-- for testing separate lists -->

<!-- <Draggable.Root bind:items>
  <Draggable.Zone zoneTag={"commands"}>
    <div class="zone">
      {#each items as item, i (item.id)}
        <Draggable.Item id={item.id} itemIndex={i}>
          <Command name={item.name} lineNumber={i} cmdContent={item.cmdContent} />
        </Draggable.Item>
      {/each}
    </div>
  </Draggable.Zone>
</Draggable.Root>
<Draggable.Root bind:items={items2}>
  <Draggable.Zone zoneTag={"commands"}>
    <div class="zone">
      {#each items2 as item, i (item.id)}
        <Draggable.Item id={item.id} itemIndex={i}>
          <Command name={item.name} lineNumber={i} cmdContent={item.cmdContent} />
        </Draggable.Item>
      {/each}
    </div>
  </Draggable.Zone>
</Draggable.Root> -->

<style>
	/* p {
    padding: 1rem;
    background-color: red;
  } */

	.demo {
		/* padding: 3rem; */
	}
</style>
