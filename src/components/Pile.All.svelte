<script>
	import Pile from "$components/Pile.svelte";
	import { range } from "d3";
	import chartData from "$runes/chartData.svelte.js";

	let { seasonStart, seasonEnd } = $props();

	let seasons = $derived(
		range(+seasonStart, +seasonEnd + 1).map((d) => `${d}`)
	);
</script>

<div class="c">
	{#if chartData.seasons}
		{#each seasons as season}
			<div class="season">
				<Pile {season} />
			</div>
		{/each}
	{/if}
</div>

<style>
	.c {
		width: 100%;
		max-width: 1280px;
		display: flex;
		flex-wrap: wrap;
		gap: 1rem;
	}

	.season {
		position: relative;
		width: calc(25% - 1rem);
		margin: 0;
	}

</style>
