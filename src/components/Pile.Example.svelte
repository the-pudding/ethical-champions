<script>
	import Pile from "$components/Pile.svelte";

	let { season, winner = false } = $props();
</script>

<div class="c">
	<Pile {season} {winner} />
</div>

<style>
	.c {
		width: 100%;
		aspect-ratio: 1.5 / 1;
	}
</style>
