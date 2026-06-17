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
			{@const winner = chartData.seasons.find(
				(s) => s.season === +season
			)?.winner}
			<div class="season">
				<div class="pile">
					<Pile {season} />
				</div>
				<div class="label">{season} ({winner})</div>
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

	.pile {
		aspect-ratio: 1.5 / 1;
		margin: 0;
		position: relative;
	}

	.label {
		text-align: center;
		margin: 0;
	}
</style>
