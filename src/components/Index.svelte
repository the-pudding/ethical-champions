<script>
	import { getContext } from "svelte";
	import CMS from "$components/helpers/CMS.svelte";
	import Footer from "$components/Footer.svelte";
	import Placeholder from "$components/Placeholder.svelte";
	import PileExample from "$components/Pile.Example.svelte";
	import loadData from "$utils/loadData.js";
	import chartData from "$runes/chartData.svelte.js";

	const copy = getContext("copy");

	const { body } = copy;

	const components = {
		Placeholder,
		PileExample
	};

	$effect(loadData);
</script>

<article>
	<CMS {body} {components} />
</article>

<svelte:boundary onerror={(e) => console.error(e)}>
	<!-- <Footer recirc={true} /> -->
</svelte:boundary>

<style>
	article > :global(section p),
	article > :global(section h1),
	article > :global(section video),
	article > :global(section img),
	article > :global(section div) {
		max-width: var(--col-width);
		margin: 2rem auto;
	}
</style>
