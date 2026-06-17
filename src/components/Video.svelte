<script>
	import rough from "roughjs";

	let { src, figcaption = "" } = $props();

	let videoEl;
	let svgEl;

	$effect(() => {
		if (!videoEl || !svgEl) return;

		const ro = new ResizeObserver((entries) => {
			const { width, height } = entries[0].contentRect;
			if (!width || !height) return;

			const rc = rough.svg(svgEl);
			svgEl.setAttribute("width", width);
			svgEl.setAttribute("height", height);
			while (svgEl.firstChild) svgEl.firstChild.remove();

			const pad = 3;
			const node = rc.rectangle(pad, pad, width + pad, height, {
				stroke: "var(--color-fg)",
				strokeWidth: 6,
				roughness: 2
				// disableMultiStroke: false
			});
			svgEl.appendChild(node);
		});

		ro.observe(videoEl);
		return () => ro.disconnect();
	});
</script>

<figure>
	<div class="video-wrap">
		<video bind:this={videoEl} {src} preload autoplay muted loop></video>
		<svg bind:this={svgEl} class="border-svg" aria-hidden="true"></svg>
	</div>
	{#if figcaption}
		<figcaption>{@html figcaption}</figcaption>
	{/if}
</figure>

<style>
	.video-wrap {
		position: relative;
		display: block;
		padding: 4px;
	}

	video {
		display: block;
		width: 100%;
	}

	.border-svg {
		position: absolute;
		inset: 0;
		pointer-events: none;
	}

	figcaption {
		text-align: center;
		font-family: var(--font-mono);
		font-size: var(--12px);
		color: var(--color-fg-light);
		margin-top: 1rem;
	}
</style>
