<script>
	import Matter from "matter-js";
	import rough from "roughjs";
	import { scaleSqrt, max, ascending, sum } from "d3";
	import debounce from "lodash.debounce";
	import chartData from "$runes/chartData.svelte.js";

	let { season } = $props();
	let container;
	let svgEl;
	let containerWidth = $state(0);
	let containerHeight = $state(0);
	let isVisible = $state(false);

	const MIN_SCALE = 0.02;
	const MAX_SCALE = 0.1;

	const data = $derived.by(() => {
		if (chartData.heads && chartData.players && chartData.dnp) {
			return chartData.dnp
				.filter((d) => d.season === +season && d.relation === "opponent")
				.map((d) => {
					const player = chartData.players.find((p) => p.bbrID === d.bbrID);
					return {
						...d,
						name: player?.name ?? "Unknown",
						head: chartData.heads[d.bbrID]
					};
				})
				.filter((d) => d.head && d.head.length >= 3)
				.sort(
					(a, b) => ascending(a.round, b.round) || ascending(a.game, b.game)
				);
		}
		return [];
	});

	const seasonInfo = $derived.by(() => {
		if (!chartData.seasons) return null;
		return chartData.seasons.find((s) => s.season === +season) ?? null;
	});

	const missedCount = $derived(data.length);

	const maxSeasonDpm = $derived.by(() => {
		if (!chartData.players) return 1;
		return (
			max(
				chartData.players.filter((p) => p.season === +season),
				(p) => p.missingDpm
			) ?? 1
		);
	});

	$effect(() => {
		const onResize = debounce((entries) => {
			const rect = entries[0].contentRect;
			containerWidth = rect.width;
			containerHeight = rect.height;
		}, 250);
		const ro = new ResizeObserver(onResize);
		ro.observe(container);
		return () => {
			onResize.cancel();
			ro.disconnect();
		};
	});

	$effect(() => {
		const io = new IntersectionObserver(
			([entry]) => {
				if (entry.isIntersecting) {
					isVisible = true;
					io.disconnect();
				}
			},
			{ threshold: 0.1 }
		);
		io.observe(container);
		return () => io.disconnect();
	});

	$effect(() => {
		const width = containerWidth;
		if (!width || !svgEl) return;

		const height = 16;
		svgEl.setAttribute("width", width);
		svgEl.setAttribute("height", height);
		while (svgEl.firstChild) svgEl.firstChild.remove();

		const rc = rough.svg(svgEl);
		const node = rc.line(0, height / 2, width, height / 2, {
			stroke: "var(--color-fg)",
			strokeWidth: 2,
			roughness: 1.5,
			disableMultiStroke: true
		});
		svgEl.appendChild(node);
	});

	function angledWall(Bodies, p1, p2, color = "#fff", thickness = 2) {
		const cx = (p1.x + p2.x) / 2;
		const cy = (p1.y + p2.y) / 2;
		const len = Math.hypot(p2.x - p1.x, p2.y - p1.y);
		const angle = Math.atan2(p2.y - p1.y, p2.x - p1.x);
		return Bodies.rectangle(cx, cy, len, thickness, {
			isStatic: true,
			angle,
			render: { fillStyle: "transparent" }
		});
	}

	function polygonArea(verts) {
		let area = 0;
		const n = verts.length;
		for (let i = 0; i < n; i++) {
			const j = (i + 1) % n;
			area += verts[i].x * verts[j].y;
			area -= verts[j].x * verts[i].y;
		}
		return Math.abs(area) / 2;
	}

	function makeCenteredVertices(verts, targetArea) {
		const xs = verts.map((v) => v.x);
		const ys = verts.map((v) => v.y);
		const minX = Math.min(...xs),
			maxX = Math.max(...xs);
		const minY = Math.min(...ys),
			maxY = Math.max(...ys);
		const naturalArea = polygonArea(verts);
		const scale = Math.sqrt(targetArea / naturalArea);
		const cx = (minX + maxX) / 2;
		const cy = (minY + maxY) / 2;
		return verts.map((v) => ({ x: (v.x - cx) * scale, y: (v.y - cy) * scale }));
	}

	$effect(() => {
		const currentData = data;
		const width = containerWidth;
		const height = containerHeight;
		const visible = isVisible;
		if (!width || !height || currentData.length === 0 || !visible) return;

		const { Engine, Render, Runner, Bodies, Body, Composite, Common } = Matter;

		const sizeScale = scaleSqrt()
			.domain([0, maxSeasonDpm])
			.range([(width * MIN_SCALE) ** 2, (width * MAX_SCALE) ** 2]);

		const engine = Engine.create({ gravity: { x: 0, y: 1.0 } });
		const render = Render.create({
			element: container,
			engine,
			options: {
				width,
				height,
				wireframes: false,
				background: "#fff",
				pixelRatio: window.devicePixelRatio || 1
			}
		});

		const floor = Bodies.rectangle(width / 2, height, width * 2, width * 0.04, {
			isStatic: true,
			render: { fillStyle: "transparent" }
		});
		const leftWall = Bodies.rectangle(
			-1,
			height / 2,
			width * 0.04,
			height * 2,
			{
				isStatic: true,
				render: { fillStyle: "transparent" }
			}
		);
		const rightWall = Bodies.rectangle(
			width + 1,
			height / 2,
			width * 0.04,
			height * 2,
			{
				isStatic: true,
				render: { fillStyle: "transparent" }
			}
		);

		const containerTop = 0;
		const binLeft = angledWall(
			Bodies,
			{ x: width * 0.2, y: containerTop },
			{ x: width * 0, y: height },
			"transparent",
			width * 0.02
		);
		const binRight = angledWall(
			Bodies,
			{ x: width * 0.8, y: containerTop },
			{ x: width * 1, y: height },
			"transparent",
			width * 0.02
		);

		Composite.add(engine.world, [
			floor,
			leftWall,
			rightWall,
			binLeft,
			binRight
		]);

		Common._seed = 6;

		const physBodies = currentData.map((d, i) => {
			const headArea = sizeScale(d.missingDpm);
			const centeredVerts = makeCenteredVertices(d.head, headArea);
			const x = width * 0.5 + Common.random(-width * 0.05, width * 0.05);
			const y = -i * Math.sqrt(headArea) * 1.5;

			const body = Bodies.fromVertices(
				x,
				y,
				[centeredVerts],
				{
					restitution: 0.12,
					friction: 0.5,
					frictionAir: 0.012,
					density: 0.2,
					render: {
						fillStyle: "fff",
						strokeStyle: "#fff",
						lineWidth: 1,
						sprite: {
							texture: `assets/heads-trimmed/${d.bbrID}.png`,
							xScale: 1,
							yScale: 1
						}
					}
				},
				true
			);

			Body.rotate(body, Common.random(-0.2, 0.2));

			const img = new Image();
			img.onload = () => {
				const b = body.bounds;
				body.render.sprite.xScale = (b.max.x - b.min.x) / img.naturalWidth;
				body.render.sprite.yScale = (b.max.y - b.min.y) / img.naturalHeight;
			};
			img.src = `assets/heads-trimmed/${d.bbrID}.png`;

			return body;
		});

		Composite.add(engine.world, physBodies);
		Render.run(render);
		const runner = Runner.run(Runner.create(), engine);

		return () => {
			Runner.stop(runner);
			Render.stop(render);
			render.canvas.remove();
			Engine.clear(engine);
		};
	});

	// $inspect(data);
</script>

<div class="pile-wrap">
	<div class="c" bind:this={container}></div>
	<svg bind:this={svgEl} class="divider" aria-hidden="true"></svg>
	{#if seasonInfo}
		<div class="meta">
			<div class="meta-left">
				<div class="meta-title">{season} | {seasonInfo.winner}</div>
				<div class="meta-sub">{missedCount} missed games by opponents</div>
			</div>
			<img
				class="team-logo"
				src="assets/teams/{seasonInfo.winner.toLowerCase()}.png"
				alt={seasonInfo.winner}
			/>
		</div>
	{/if}
</div>

<style>
	.pile-wrap {
		width: 100%;
		display: flex;
		flex-direction: column;
	}

	.c {
		width: 100%;
		aspect-ratio: 1.5 / 1;
		position: relative;
		overflow: hidden;
		margin: 0;
	}

	.c::after {
		content: "";
		position: absolute;
		inset: 0 0 auto 0;
		height: 10%;
		background: linear-gradient(to bottom, #fff, transparent);
		pointer-events: none;
		z-index: 1;
	}

	.c :global(canvas) {
		display: block;
	}

	.divider {
		display: block;
		width: 100%;
		flex-shrink: 0;
	}

	.meta {
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: 0.5rem;
	}

	.meta-left {
		display: flex;
		flex-direction: column;
		gap: 0.25em;
	}

	.meta-title {
		font-family: var(--font-mono);
		font-size: var(--14px);
		line-height: 1.2;
	}

	.meta-sub {
		font-family: var(--font-mono);
		font-size: var(--12px);
		color: var(--color-fg-light);
	}

	.team-logo {
		height: 3rem;
		width: auto;
		flex-shrink: 0;
	}
</style>
