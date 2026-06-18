<script>
	import chartData from "$runes/chartData.svelte.js";
	import Select from "$components/ui/Select.svelte";

	const seasons = $derived(chartData.seasons ?? []);
	const dnp = $derived(chartData.dnp ?? []);
	const players = $derived(chartData.players ?? []);

	let selectedSeason = $state(null);
	let sortProp = $state("dpm");
	let sortDir = $state("desc");

	$effect(() => {
		if (seasons.length && selectedSeason === null) {
			selectedSeason = seasons[seasons.length - 1].season;
		}
	});

	const seasonOptions = $derived(
		seasons.map((d) => ({
			value: d.season,
			label: `${d.season} — ${d.winner}`
		}))
	);

	const playerNameMap = $derived(
		new Map(players.map((p) => [p.bbrID, p.name]))
	);

	const rows = $derived(
		!selectedSeason
			? []
			: dnp
					.filter((d) => d.season === selectedSeason && d.dpm >= 1)
					.map((d) => ({ ...d, name: playerNameMap.get(d.bbrID) ?? d.bbrID }))
					.sort((a, b) => {
						const av = a[sortProp];
						const bv = b[sortProp];
						const cmp =
							typeof av === "number" ? av - bv : av?.localeCompare(bv);
						return sortDir === "asc" ? cmp : -cmp;
					})
	);

	function sort(prop) {
		if (sortProp === prop) {
			sortDir = sortDir === "asc" ? "desc" : "asc";
		} else {
			sortProp = prop;
			sortDir = prop === "dpm" ? "desc" : "asc";
		}
	}

	const columns = [
		{ label: "name", prop: "name" },
		{ label: "team", prop: "team" },
		{ label: "relationship", prop: "relation" },
		{ label: "DPM", prop: "dpm", number: true },
		{ label: "reason", prop: "reason" },
		{ label: "round", prop: "round", number: true, hideMobile: true },
		{ label: "game", prop: "game", number: true, hideMobile: true }
	];
</script>

<div class="lookup">
	<div class="controls">
		<!-- <span class="label">Championship season</span> -->
		<Select items={seasonOptions} bind:value={selectedSeason} />
	</div>

	{#if rows.length}
		<table>
			<thead>
				<tr>
					{#each columns as col}
						<th
							class:number={col.number}
							class:active={sortProp === col.prop}
							class:hide-mobile={col.hideMobile}
						>
							<button onclick={() => sort(col.prop)}>
								{col.label}
								<span class="arrow">
									{sortProp === col.prop
										? sortDir === "asc"
											? "↑"
											: "↓"
										: "⇅"}
								</span>
							</button>
						</th>
					{/each}
				</tr>
			</thead>
			<tbody>
				{#each rows as row}
					<tr>
						<td>{row.name}</td>
						<td>{row.team}</td>
						<td>{row.relation}</td>
						<td class="number">+{row.dpm.toFixed(1)}</td>
						<td>{row.reason}</td>
						<td class="number hide-mobile">{row.round}</td>
						<td class="number hide-mobile">{row.game}</td>
					</tr>
				{/each}
			</tbody>
		</table>
	{:else if selectedSeason}
		<p class="empty">No missing players with +1 DPM for this season.</p>
	{/if}
</div>

<style>
	.lookup {
		width: 100%;
		font-family: var(--font-mono);
		max-width: 720px;
	}

	.controls {
		display: flex;
		align-items: center;
		gap: 0.75rem;
		margin-bottom: 1rem;
	}

	/* .label {
		font-weight: bold;
		font-size: var(--12px);
	} */

	table {
		width: 100%;
		border-collapse: collapse;
		font-family: var(--font-mono);
	}

	thead tr {
		border-bottom: 2px solid currentColor;
	}

	tbody tr {
		border-top: 1px solid currentColor;
	}

	tbody tr:first-of-type {
		border-top: none;
	}

	th {
		padding: 0;
		vertical-align: bottom;
		text-align: left;
		font-size: var(--12px);
	}

	th button {
		display: flex;
		align-items: baseline;
		gap: 0.25rem;
		width: 100%;
		padding: 8px;
		background: none;
		border: none;
		color: inherit;
		font-weight: bold;
		text-align: left;
		cursor: pointer;
	}

	th.number button {
		justify-content: flex-end;
		text-align: right;
	}

	.arrow {
		opacity: 0.5;
		font-weight: normal;
	}

	th.active .arrow {
		opacity: 1;
	}

	td {
		padding: 8px;
		vertical-align: bottom;
		line-height: 1.2;
		font-size: var(--12px);
	}

	td.number {
		text-align: right;
	}

	th:nth-of-type(2),
	td:nth-of-type(2) {
		width: 3.5rem;
	}

	th:nth-of-type(3),
	td:nth-of-type(3) {
		width: 8rem;
	}

	th:nth-of-type(4),
	td:nth-of-type(4) {
		width: 3.5rem;
	}

	th:nth-of-type(6),
	td:nth-of-type(6),
	th:nth-of-type(7),
	td:nth-of-type(7) {
		width: 3rem;
	}

	@media (max-width: 600px) {
		.hide-mobile {
			display: none;
		}
	}

	.empty {
		opacity: 0.5;
	}
</style>
