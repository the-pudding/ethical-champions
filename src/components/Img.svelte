<script>
	let { src, alt = "", figcaption = "" } = $props();
</script>

<figure>
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
</style>
