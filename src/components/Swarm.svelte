<script>
	import {
		select,
		scaleLinear,
		extent,
		format,
		axisLeft,
		axisBottom,
		forceSimulation,
		forceX,
		forceY,
		forceCollide
	} from "d3";
	import useWindowDimensions from "$runes/useWindowDimensions.svelte.js";
	import chartData from "$runes/chartData.svelte.js";
	import ToggleGroup from "$components/ui/ToggleGroup.svelte";

	let { metric, title, toggle = false } = $props();

	let localMetric = $state("net");
	const activeMetric = $derived(toggle ? localMetric : metric);
	let container;
	let svg;

	const vert = $derived(dimensions.width > 0 && dimensions.width < 600);

	const dimensions = new useWindowDimensions();

	const IMG_HEIGHTS = {
		bos: 80,
		cle: 91,
		dal: 73,
		den: 73,
		det: 70,
		gsw: 73,
		lal: 53,
		mia: 81,
		mil: 83,
		okc: 56,
		sas: 75,
		tor: 74,
		nyk: 68
	};

	const rows = $derived((chartData.seasons ?? []).filter((d) => d.winner));

	$effect(() => {
		const w = dimensions.width,
			h = dimensions.height; // reactive trigger (debounced)
		if (!w || !h || rows.length === 0) return;
		const cw = container.clientWidth;
		const ch = container.clientHeight;
		if (!cw || !ch) return;

		const padTop = 32;
		const padRight = 32;
		const padBottom = vert ? 32 : 32;
		const padLeft = vert ? 48 : 32;
		const innerW = cw - padLeft - padRight;
		const innerH = ch - padTop - padBottom;
		const r = Math.sqrt(Math.sqrt(cw * ch * 2));

		const root = select(svg);
		root.attr("width", cw).attr("height", ch);

		root.selectAll("defs").remove();
		root.selectAll("g").remove();

		const defs = root.append("defs");
		const g = root
			.append("g")
			.attr("transform", `translate(${padLeft},${padTop})`);

		const scale = scaleLinear();
		const vals = rows.map((d) => d[activeMetric]);
		const [minVal, maxVal] = extent(vals);
		const domainPad = (r / (vert ? innerH : innerW)) * (maxVal - minVal);
		scale.domain([minVal - domainPad, maxVal + domainPad]);

		if (vert) {
			scale.range([innerH, 0]);
		} else {
			scale.range([0, innerW]);
		}

		// zero line
		const zeroLine = g.append("line").attr("class", "zero-line");
		if (vert) {
			zeroLine
				.attr("x1", 0)
				.attr("x2", innerW)
				.attr("y1", scale(0))
				.attr("y2", scale(0));
		} else {
			zeroLine
				.attr("y1", 0)
				.attr("y2", innerH)
				.attr("x1", scale(0))
				.attr("x2", scale(0));
		}

		// axis (outside g so it can sit flush against the svg edge)
		const axis = root.append("g").attr("class", "axis");
		const fmt = (d) => (d === 0 ? "0" : format("+.1f")(d));
		if (vert) {
			axis.attr("transform", `translate(${padLeft},${padTop})`);
			axis.call(axisLeft(scale).ticks(6).tickSize(4).tickFormat(fmt));
		} else {
			axis.attr("transform", `translate(${padLeft},${padTop + innerH})`);
			axis.call(axisBottom(scale).ticks(6).tickSize(4).tickFormat(fmt));
		}
		axis.select(".domain").remove();

		// axis labels (outside g, below/beside the axis ticks)
		const labelG = root.append("g").attr("class", "axis-labels");
		if (vert) {
			labelG.attr("transform", `translate(${padLeft - 48},${padTop})`);
			labelG
				.append("text")
				.attr("class", "lbl-edge")
				.attr("text-anchor", "start")
				.attr("x", 16)
				.attr("y", 0)
				.attr("dominant-baseline", "hanging")
				.text("↑ more ethical");
			labelG
				.append("text")
				.attr("class", "lbl-mid")
				.attr("text-anchor", "middle")
				.attr("dominant-baseline", "middle")
				.attr("transform", `translate(12, ${innerH / 3.75}) rotate(-90)`)
				.text(title);
			labelG
				.append("text")
				.attr("class", "lbl-edge")
				.attr("text-anchor", "start")
				.attr("x", 16)
				.attr("y", innerH)
				.text("↓ less ethical");
		} else {
			labelG.attr("transform", `translate(${padLeft},${padTop})`);
			labelG
				.append("text")
				.attr("class", "lbl-edge")
				.attr("text-anchor", "start")
				.attr("x", 0)
				.attr("y", 0)
				.text("← less ethical");
			labelG
				.append("text")
				.attr("class", "lbl-mid")
				.attr("text-anchor", "middle")
				.attr("x", innerW / 2)
				.attr("y", 0)
				.text(title);
			labelG
				.append("text")
				.attr("class", "lbl-edge")
				.attr("text-anchor", "end")
				.attr("x", innerW)
				.attr("y", 0)
				.text("more ethical →");
		}

		// force simulation
		const sim = forceSimulation(rows.map((d) => ({ ...d })))
			.force(
				vert ? "y" : "x",
				(vert ? forceY : forceX)((d) => scale(d[activeMetric])).strength(1)
			)
			.force(
				vert ? "x" : "y",
				(vert ? forceX : forceY)(vert ? innerW / 2 : innerH / 2).strength(0.1)
			)
			.force("collide", forceCollide(r + 2))
			.stop();
		for (let i = 0; i < 300; i++) sim.tick();
		const simData = sim.nodes();

		// clip paths
		defs
			.selectAll("clipPath")
			.data(simData, (d) => d.season)
			.join((enter) =>
				enter
					.append("clipPath")
					.attr("id", (d) => `clip-swarm-${vert ? "v" : "h"}-${d.season}`)
					.append("circle")
					.attr("r", r)
			);

		// nodes
		const nodes = g.append("g").attr("class", "nodes");
		nodes
			.selectAll("g.node")
			.data(simData, (d) => d.season)
			.join((enter) => {
				const ng = enter.append("g").attr("class", "node");
				ng.append("image");
				ng.append("text")
					.attr("class", "lbl-season")
					.attr("text-anchor", "middle")
					.attr("font-size", Math.max(12, Math.round(r / 2.75)) + "px");
				return ng;
			})
			.each(function (d) {
				select(this).attr("transform", `translate(${d.x},${d.y})`);
				select(this)
					.select("image")
					.attr("href", `assets/teams/${d.winner.toLowerCase()}.png`)
					.attr("clip-path", `url(#clip-swarm-${vert ? "v" : "h"}-${d.season})`)
					.attr("x", -r)
					.attr("y", -r)
					.attr("width", r * 2)
					.attr("height", r * 2);
				const imgHgt = IMG_HEIGHTS[d.winner.toLowerCase()] ?? 96;
				const edgeR = (imgHgt * r) / 96;
				const aboveMid = d.y <= innerH / 2;
				select(this)
					.select(".lbl-season")
					.attr("y", aboveMid ? -edgeR - 6 : edgeR + 6)
					.attr("dominant-baseline", aboveMid ? "auto" : "hanging")
					.text(`'${String(d.season).slice(2)}`);
			});
	});
</script>

<div class="c" bind:this={container}>
	<svg bind:this={svg}></svg>
</div>
{#if toggle}
	<div class="toggle-wrap">
		<ToggleGroup
			items={[
				{ value: "net", label: "net" },
				{ value: "opp", label: "opp" }
			]}
			bind:value={localMetric}
			required
		/>
	</div>
{/if}

<style>
	.c {
		width: 100%;
		aspect-ratio: 1 / 2;
		max-width: 1280px;
		margin: 0 auto;
	}

	svg {
		display: block;
		height: 100%;
	}

	svg :global(text.lbl-season) {
		pointer-events: none;
		user-select: none;
		fill: var(--color-fg-light);
	}

	svg :global(.zero-line) {
		stroke: var(--color-fg-light);
		stroke-width: 1;
		stroke-dasharray: 4 4;
	}

	svg :global(.axis line),
	svg :global(.axis path) {
		stroke: var(--color-fg-light);
	}

	svg :global(.axis text) {
		fill: var(--color-fg-light);
		font-size: var(--12px);
	}

	svg :global(.axis-labels text) {
		pointer-events: none;
		user-select: none;
	}

	svg :global(.lbl-edge) {
		fill: var(--color-fg-light);
		font-size: var(--12px);
		font-weight: bold;
	}

	svg :global(.lbl-mid) {
		fill: var(--color-fg-light);
		font-size: var(--12px);
	}

	.toggle-wrap {
		display: flex;
		justify-content: center;
		margin-top: 0.5rem;
	}

	@media (min-width: 720px) {
		.c {
			aspect-ratio: 2.5 / 1;
		}
	}
</style>
