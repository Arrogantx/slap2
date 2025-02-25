<script>
    import BoxesIcon from "lucide-svelte/icons/boxes";
    import MenuIcon from "lucide-svelte/icons/menu";
    import Connect from "./Connect.svelte";
    import * as Sheet from "$lib/components/ui/sheet";
    import { Button } from "$lib/components/ui/button";
    import * as config from "$lib/config";
    import { isAdmin, connected, signerAddress } from "$lib/store";

    $effect(() => {
        if ($connected && $signerAddress) {
            console.log('Navigation - Connected Address:', $signerAddress);https://mail.google.com/mail/u/5/#inbox/FMfcgzQZTMHMjSqbkpXBKXQnJKxNGlSD
            console.log('Navigation - Is Admin:', $isAdmin);
        }
    });
</script>

<header class="bg-background w-full sticky top-0 flex h-16 items-center border-b px-4 md:px-6 z-50">
    <nav class="flex items-center text-lg font-medium md:text-sm">
        <a href="/" class="flex items-center gap-2 font-semibold md:text-base neon-text">
            AvaxSlap
        </a>
    </nav>
    <div class="ml-auto flex items-center space-x-4">
        <a href="/whitelist" class="hover-lift">Whitelist</a>
        {#if $isAdmin}
            <a href="/admin" class="hover-lift">Admin</a>
        {/if}
        
        <a href="/leaderboard" class="hover-lift">Leaderboard</a>
        <Connect />
    </div>
</header>