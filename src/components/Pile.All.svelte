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
		gap: 0.5rem;
	}

	.season {
		position: relative;
		width: calc(50% - 0.5rem);
		margin: 0;
	}

	@media (min-width: 600px) {
		.c {
			gap: 1rem;
		}

		.season {
			width: calc(33.333% - 1rem);
		}
	}

	@media (min-width: 800px) {
		.season {
			width: calc(25% - 1rem);
		}
	}
</style>
