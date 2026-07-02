<script>
  import { onMount } from "svelte";

const {id, name, isDragging} = $props()

onMount(() => {
  console.log(id)
})

</script>

<li {id} class:isDragging>
    {name}
</li>

<style>
 li {
    padding: 1rem;
    background-color: green;
 }
 .isDragging {
   background-color: gray;
 }
</style>