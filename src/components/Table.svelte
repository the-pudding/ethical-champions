<script>
	import chartData from "$runes/chartData.svelte.js";

	let { title } = $props();
	const players = $derived(chartData.topPlayers ?? []);
</script>

<div class="c">
	<table>
		<caption>{title}</caption>
		<thead>
			<tr>
				<th class="rank">#</th>
				<th class="img"></th>
				<th class="name">name</th>
				<th class="dpm">DPM</th>
			</tr>
		</thead>
		<tbody>
			{#each players as player, i}
				<tr>
					<td class="rank">{i + 1}</td>
					<td class="img">
						<img
							src="assets/heads-trimmed/{player.bbrID}.png"
							alt={player.name}
						/>
					</td>
					<td class="name">{player.name}</td>
					<td class="dpm">{player.dpm > 0 ? "+" : ""}{player.dpm.toFixed(1)}</td
					>
				</tr>
			{/each}
		</tbody>
	</table>
</div>

<style>
	table {
		border-collapse: collapse;
		width: 100%;
		font-family: var(--font-mono);
	}

	caption {
		text-align: center;
		font-size: var(--12px);
		padding-bottom: 0.5rem;
		color: var(--color-fg-light);
	}

	thead tr {
		border-bottom: 2px solid var(--color-border);
	}

	tbody tr {
		border-bottom: 1px solid var(--color-border);
	}

	tbody tr:last-of-type {
		border-bottom: none;
	}

	th {
		text-align: left;
		padding: 0.5rem;
		color: var(--color-fg-light);
		font-size: var(--12px);
		font-weight: normal;
	}

	td {
		padding: 0.5rem;
		vertical-align: middle;
		font-size: var(--12px);
	}

	.rank {
		width: 2.25rem;
		text-align: right;
		color: var(--color-fg-light);
	}

	.img {
		width: 4rem;
	}

	.img img {
		display: block;
		width: 3rem;
		height: 3rem;
		object-fit: contain;
	}

	.dpm {
		text-align: right;
		width: 4rem;
	}

	@media (min-width: 600px) {
		th,
		td {
			font-size: var(--14px);
		}
	}
</style>
