<script>
	import Pile from "$components/Pile.svelte";

	let { season } = $props();
</script>

<div class="c">
	<Pile {season} />
</div>

<style>
	.c {
		width: 100%;
		aspect-ratio: 1.5 / 1;
	}
</style>
