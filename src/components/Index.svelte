<script>
	import { getContext } from "svelte";
	import CMS from "$components/helpers/CMS.svelte";
	import Footer from "$components/Footer.svelte";
	import Placeholder from "$components/Placeholder.svelte";

	const copy = getContext("copy");
	const { body } = copy;
	const components = {
		Placeholder
	};
</script>

<article>
	<CMS {body} {components} />
</article>

<svelte:boundary onerror={(e) => console.error(e)}>
	<!-- <Footer recirc={true} /> -->
</svelte:boundary>

<style>
	article > :global(section p),
	article > :global(section video),
	article > :global(section div) {
		max-width: var(--col-width);
		margin: 2rem auto;
	}
</style>
