<!--I dont know if i want to use this component yet-->
<script lang="ts">

function onmousedown(e:MouseEvent) {
    console.log('WAA')
}

</script>

<div></div>

<svelte:window {onmousedown}/>

<style>
	div {
        /* width: 10rem;
        height: 10rem; */
        background-color: red;
		position: absolute;
	}
</style>
