<script>
	let { title } = $props();
</script>

<div class="c">
	<h1>{title}</h1>
	<p class="byline">
		<span>
			<a
				href="https://pudding.cool/author/russell-samora"
				target="_blank"
				rel="noreferrer">Russell Samora</a
			></span
		><span>July 2026</span>
	</p>
</div>

<style>
	.c {
		max-width: none;
		background: var(--color-fg);
		color: var(--color-bg);
		padding: 2rem 1rem;
		margin: 4rem auto;
	}

	h1 {
		line-height: 1;
		font-weight: 700;
		font-family: var(--font-mono);
		text-align: center;
	}

	.byline {
		text-align: center;
		font-size: var(--16px);
		display: flex;
		flex-direction: row;
		align-items: center;
		text-align: center;
		width: 100%;
		max-width: var(--col-width);
		margin: 0 auto;
		margin-top: 1rem;
		padding: 0 1rem;
	}

	.byline span {
		width: 50%;
		padding: 0 1rem;
	}

	.byline span:first-of-type {
		text-align: right;
		border-right: 1px solid var(--color-border);
	}

	.byline span:last-of-type {
		text-align: left;
	}

	a {
		color: var(--color-bg);
		text-decoration: underline;
	}
</style>
