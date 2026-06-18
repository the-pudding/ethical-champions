<script>
	let { src, alt = "", figcaption = "", className = "" } = $props();
</script>

<figure class={className}>
	<img {src} {alt} />
	{#if figcaption}
		<figcaption>{@html figcaption}</figcaption>
	{/if}
</figure>

<style>
	figcaption {
		text-align: center;
		font-family: var(--font-mono);
		font-size: var(--12px);
		color: var(--color-fg-light);
		margin-top: 1rem;
	}

	.small img {
		max-width: 480px;
		margin: 0 auto;
	}
</style>
