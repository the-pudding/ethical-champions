<script>
	import {
		select,
		scaleLinear,
		scaleBand,
		max,
		axisLeft,
		axisBottom
	} from "d3";
	import rough from "roughjs";
	import useWindowDimensions from "$runes/useWindowDimensions.svelte.js";
	import chartData from "$runes/chartData.svelte.js";
	import variables from "$data/variables.json";

	let { metric, title = "" } = $props();

	let container;
	let svg;
	const dimensions = new useWindowDimensions();

	const vert = $derived(dimensions.width > 0 && dimensions.width < 600);
	const rows = $derived((chartData.seasons ?? []).filter((d) => d.winner));

	$effect(() => {
		const w = dimensions.width;
		if (!w || rows.length === 0) return;
		const cw = container.clientWidth;
		const ch = container.clientHeight;
		if (!cw || !ch) return;

		const padTop = 24;
		const padRight = 16;
		const padBottom = vert ? 48 : 16;
		const padLeft = vert ? 52 : 48;
		const innerW = cw - padLeft - padRight;
		const innerH = ch - padTop - padBottom;

		const colorFill = variables.color["gray-900"];
		const colorStroke = "transparent";

		const root = select(svg);
		root.attr("width", cw).attr("height", ch);
		root.selectAll("*").remove();

		const g = root
			.append("g")
			.attr("transform", `translate(${padLeft},${padTop})`);
		const rc = rough.svg(svg);

		const seasons = rows.map((d) => String(d.season));
		const maxVal = max(rows, (d) => d[metric]);

		if (vert) {
			// Horizontal bars on mobile
			const xScale = scaleLinear()
				.domain([0, maxVal])
				.range([0, innerW])
				.nice();
			const yScale = scaleBand()
				.domain(seasons)
				.range([0, innerH])
				.padding(0.25);

			g.append("g")
				.attr("class", "grid")
				.attr("transform", `translate(0,${innerH})`)
				.call(axisBottom(xScale).ticks(5).tickSize(-innerH).tickFormat(""));

			rows.forEach((d) => {
				const barW = Math.max(0, xScale(d[metric]));
				const barH = yScale.bandwidth();
				const y = yScale(String(d.season));
				if (barW < 1) return;
				const node = rc.rectangle(0, y, barW, barH, {
					fill: colorFill,
					fillStyle: "hachure",
					strokeWidth: 3,
					disableMultiStroke: true,
					stroke: colorStroke,
					fillWeight: 3,
					roughness: 0.67,
					hachureAngle: -60,
					hachureGap: 4
				});
				g.node().appendChild(node);
			});

			root
				.append("g")
				.attr("class", "axis")
				.attr("transform", `translate(${padLeft},${padTop + innerH})`)
				.call(axisBottom(xScale).ticks(5).tickSize(4));

			root
				.append("g")
				.attr("class", "axis")
				.attr("transform", `translate(${padLeft},${padTop})`)
				.call(
					axisLeft(yScale)
						.tickSize(4)
						.tickFormat((d) => `'${String(d).slice(2)}`)
				);
		} else {
			// Vertical bars on wide screens
			const xScale = scaleBand()
				.domain(seasons)
				.range([0, innerW])
				.padding(0.35);
			const yScale = scaleLinear()
				.domain([0, maxVal])
				.range([innerH, 0])
				.nice();

			g.append("g")
				.attr("class", "grid")
				.call(axisLeft(yScale).ticks(5).tickSize(-innerW).tickFormat(""));

			rows.forEach((d) => {
				const barW = xScale.bandwidth();
				const barH = Math.max(0, innerH - yScale(d[metric]));
				const x = xScale(String(d.season));
				const y = yScale(d[metric]);
				if (barH < 1) return;
				const node = rc.rectangle(x, y, barW, barH, {
					fill: colorFill,
					fillStyle: "hachure",
					strokeWidth: 3,
					disableMultiStroke: true,
					stroke: colorStroke,
					fillWeight: 3,
					roughness: 0.67,
					hachureAngle: -60,
					hachureGap: 4
				});
				g.node().appendChild(node);
			});

			root
				.append("g")
				.attr("class", "axis")
				.attr("transform", `translate(${padLeft},${padTop + innerH})`)
				.call(
					axisBottom(xScale)
						.tickSize(4)
						.tickFormat((d) => `'${String(d).slice(2)}`)
				);

			root
				.append("g")
				.attr("class", "axis")
				.attr("transform", `translate(${padLeft},${padTop})`)
				.call(axisLeft(yScale).ticks(5).tickSize(4));
		}

		root.selectAll(".axis .domain").remove();
		root.selectAll(".axis line").attr("stroke", "var(--color-fg-light)");
		root.selectAll(".axis text").attr("fill", "var(--color-fg-light)");
		root
			.selectAll(".axis .tick")
			.filter((d) => d === 0)
			.style("display", "none");
		root
			.selectAll(".grid .tick")
			.filter((d) => d === 0)
			.style("display", "none");
	});
</script>

<figure class="c">
	{#if title}
		<figcaption>{@html title}</figcaption>
	{/if}
	<div class="chart" bind:this={container}>
		<svg bind:this={svg}></svg>
	</div>
</figure>

<style>
	.c {
		width: 100%;
		max-width: 1280px;
		margin: 0 auto;
		display: flex;
		flex-direction: column;
	}

	figcaption {
		font-size: var(--12px);
		color: var(--color-fg-light);
		font-family: var(--font-mono);
		text-align: center;
		margin-bottom: 0.5rem;
	}

	figcaption :global(span) {
		color: var(--color-black);
	}

	.chart {
		width: 100%;
		max-width: none;
		aspect-ratio: 1 / 2;
	}

	svg {
		display: block;
	}

	svg :global(.grid line) {
		stroke: var(--color-fg-light);
		stroke-dasharray: 4 4;
	}

	svg :global(.grid .domain),
	svg :global(.grid text) {
		display: none;
	}

	svg :global(.axis text) {
		fill: var(--color-fg-light);
		font-size: var(--12px);
	}

	svg :global(.axis line) {
		stroke: var(--color-fg-light);
	}

	@media (min-width: 720px) {
		.c {
			flex-direction: column-reverse;
		}

		.chart {
			aspect-ratio: 2.5 / 1;
		}

		figcaption {
			margin-top: 0.5rem;
			margin-bottom: 0;
		}
	}
</style>
