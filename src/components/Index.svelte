<script>
	import { getContext } from "svelte";
	import CMS from "$components/helpers/CMS.svelte";
	import Footer from "$components/Footer.svelte";
	import Hero from "$components/Hero.svelte";
	import Img from "$components/Img.svelte";
	import Video from "$components/Video.svelte";
	import Swarm from "$components/Swarm.svelte";
	import Bar from "$components/Bar.svelte";
	import StackedBar from "$components/StackedBar.svelte";
	import Table from "$components/Table.svelte";
	import Placeholder from "$components/Placeholder.svelte";
	import PileExample from "$components/Pile.Example.svelte";
	import PileAll from "$components/Pile.All.svelte";
	import Lookup from "$components/Lookup.svelte";
	import loadData from "$utils/loadData.js";
	import chartData from "$runes/chartData.svelte.js";

	const copy = getContext("copy");

	const { body } = copy;

	const components = {
		Hero,
		Img,
		Video,
		Swarm,
		Bar,
		StackedBar,
		Table,
		Placeholder,
		PileExample,
		PileAll,
		Lookup
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
	article > :global(section > p),
	article > :global(section > video),
	article > :global(section > img),
	article > :global(section > div),
	article > :global(section > table),
	article > :global(section > table),
	article > :global(section > figure),
	article > :global(section > h2) {
		max-width: var(--col-width);
		margin: 2rem auto;
	}

	article > :global(section > p:first-of-type) {
		font-size: var(--32px);
	}
</style>
