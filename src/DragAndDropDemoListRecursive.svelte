<script lang="ts">
	import Command from "./Command.svelte"
	import { Draggable } from "./draggable/index.svelte"
	import DragAndDropDemoListRecursive from "./DragAndDropDemoListRecursive.svelte"
	import type { itemType } from "./types"

	let {
		items = $bindable(),
		color,
		visible = $bindable(true),
	}: { items: itemType[]; color?: string; visible?: boolean } = $props()
</script>

<div class="depth" style:background-color={color ?? 'green'}>
	<h1>huh</h1>
    <button onclick={() => {
        visible = !visible
    }}>show/hide</button>
	{#if visible}
		<Draggable.Root bind:items>
			<Draggable.Zone zoneTag={"commands"}>
				<div class="zone">
					{#each items as item, i (item.id)}
						{#if item?.list}
							<Draggable.Item id={item.id} itemIndex={i}>
								<Draggable.ItemHandle>
									<div style="background-color: orange;">a</div>
								</Draggable.ItemHandle>
								<DragAndDropDemoListRecursive bind:items={item.list} color={item.listColor} bind:visible={item.listVisible} />
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
	{/if}
</div>

<style>
	.depth {
		padding-top: 2rem;
		padding-left: 1rem;
	}
	.zone {
		padding-top: 1rem;
		padding-bottom: 1rem;
	}
</style>
