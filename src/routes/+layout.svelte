<script>
	import "../app.css";
	import HeaderNavigation from "$lib/components/HeaderNavigation.svelte";
    import * as config from "$lib/config";

	let { children } = $props();
</script>

<div class="flex min-h-screen w-full flex-col bg-muted/40">
	<HeaderNavigation />
	<main class="p-8">
		{@render children()}
	</main>
</div>

<svelte:head>
	<title>{config.APP_TITLE}</title>
</svelte:head>