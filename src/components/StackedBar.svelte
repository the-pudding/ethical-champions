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

	let { metric1, metric2, title = "" } = $props();

	let container;
	let svg;
	const dimensions = new useWindowDimensions();

	const vert = $derived(dimensions.width > 0 && dimensions.width < 600);
	const rows = $derived((chartData.seasons ?? []).filter((d) => d.winner));

	$effect(() => {
		const w = dimensions.width,
			h = dimensions.height;
		if (!w || !h || rows.length === 0) return;
		const cw = container.clientWidth;
		const ch = container.clientHeight;
		if (!cw || !ch) return;

		const padTop = 24;
		const padRight = 16;
		const padBottom = vert ? 48 : 16;
		const padLeft = vert ? 52 : 48;
		const innerW = cw - padLeft - padRight;
		const innerH = ch - padTop - padBottom;

		const colorFill1 = variables.color["gray-900"];
		const colorFill2 = variables.color["gray-400"];
		const colorStroke = "transparent";

		const root = select(svg);
		root.attr("width", cw).attr("height", ch);
		root.selectAll("*").remove();

		const g = root
			.append("g")
			.attr("transform", `translate(${padLeft},${padTop})`);
		const rc = rough.svg(svg);

		const seasons = rows.map((d) => String(d.season));
		const maxVal = max(rows, (d) => d[metric1] + d[metric2]);

		const roughOpts = (fill) => ({
			fill,
			fillStyle: "hachure",
			strokeWidth: 3,
			disableMultiStroke: true,
			stroke: colorStroke,
			fillWeight: 3,
			roughness: 0.67,
			hachureAngle: -60,
			hachureGap: 4
		});

		if (vert) {
			// Horizontal bars on mobile
			const xScale = scaleLinear()
				.domain([0, maxVal])
				.range([0, innerW])
				.nice();
			const yScale = scaleBand()
				.domain(seasons)
				.range([0, innerH])
				.padding(0.35);

			g.append("g")
				.attr("class", "grid")
				.attr("transform", `translate(0,${innerH})`)
				.call(axisBottom(xScale).ticks(5).tickSize(-innerH).tickFormat(""));

			rows.forEach((d) => {
				const barH = yScale.bandwidth();
				const y = yScale(String(d.season));
				const w1 = Math.max(0, xScale(d[metric1]));
				const w2 = Math.max(0, xScale(d[metric2]));

				if (w2 > 1) {
					g.node().appendChild(
						rc.rectangle(w1, y, w2, barH, roughOpts(colorFill2))
					);
				}
				if (w1 > 1) {
					g.node().appendChild(
						rc.rectangle(0, y, w1, barH, roughOpts(colorFill1))
					);
				}
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
				const x = xScale(String(d.season));
				const h1 = Math.max(0, innerH - yScale(d[metric1]));
				const h2 = Math.max(0, innerH - yScale(d[metric2]));
				const y1 = yScale(d[metric1]);
				const y2 = y1 - h2;

				if (h2 > 1) {
					g.node().appendChild(
						rc.rectangle(x, y2, barW, h2, roughOpts(colorFill2))
					);
				}
				if (h1 > 1) {
					g.node().appendChild(
						rc.rectangle(x, y1, barW, h1, roughOpts(colorFill1))
					);
				}
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
	<div class="chart" bind:this={container}>
		<svg bind:this={svg}></svg>
	</div>
	{#if title}
		<figcaption>{title}</figcaption>
	{/if}
</figure>

<style>
	.c {
		width: 100%;
		max-width: 1280px;
		margin: 0 auto;
	}

	figcaption {
		font-size: var(--12px);
		color: var(--color-fg-light);
		font-family: var(--font-mono);
		text-align: center;
		margin-top: 0.5rem;
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
		.chart {
			aspect-ratio: 2.5 / 1;
		}
	}
</style>
