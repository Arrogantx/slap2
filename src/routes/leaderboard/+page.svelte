<script>
    import * as Card from "$lib/components/ui/card";
    import * as Table from "$lib/components/ui/table";
    import * as format from "$lib/format";
    import { Button } from "$lib/components/ui/button";
    import * as slapflip from "$lib/contracts/slapflip";
    import { onMount } from "svelte";

    let leaderboard = $state([]);
    let loading = $state(true);
    let displayCount = $state(10);

   const loadLeaderboard = async () => {
    try {
        loading = true;
        const data = await slapflip.getLeaderboard(displayCount);

        leaderboard = (await Promise.all(
            data.map(async (address) => {
                const stats = await slapflip.getPlayerStats(address.player);
                return {
                    address,
                    stats
                };
            })
        ))
        // Filter out players with empty addresses or zeroed-out stats
        .filter(player => player.address?.player && player.address.player !== "0x0000000000000000000000000000000000000000");

        // Sort by most wins first, then by least losses
        leaderboard.sort((a, b) => {
            if (b.stats.won !== a.stats.won) {
                return b.stats.won - a.stats.won; // Sort by wins descending
            }
            return a.stats.lost - b.stats.lost; // If tied, sort by least losses
        });

    } catch (error) {
        console.error("Failed to load leaderboard:", error);
    } finally {
        loading = false;
    }
};


    onMount(() => {
        loadLeaderboard();
        // Refresh every 30 seconds
        const interval = setInterval(loadLeaderboard, 30000);
        return () => clearInterval(interval);
    });
</script>

<div class="container mx-auto py-8">
    <Card.Root>
        <Card.Header>
            <Card.Title>Slapboard</Card.Title>
            <Card.Description>Top slapped players</Card.Description>
        </Card.Header>
        <Card.Content>
            {#if loading && leaderboard.length === 0}
                <div class="flex justify-center p-4">
                    <span>Loading...</span>
                </div>
            {:else}
                <Table.Root>
                    <Table.Header>
                        <Table.Row class="bg-primary hover:bg-primary">
                            <Table.Head class="text-white font-semibold">Rank</Table.Head>
                            <Table.Head class="text-white font-semibold">Player</Table.Head>
                            <Table.Head class="text-white font-semibold">Slapped</Table.Head>
                            <Table.Head class="text-white font-semibold">Wins</Table.Head>
                            <Table.Head class="text-white font-semibold">Losses</Table.Head>
                            <Table.Head class="text-white font-semibold">Wagered</Table.Head>
                        </Table.Row>
                    </Table.Header>
                    <Table.Body>
                        {#each leaderboard as { address, stats }, i}
                            <Table.Row>
                                <Table.Cell class="font-bold">{i + 1}</Table.Cell>
                                <Table.Cell>{format.address(address.player)}</Table.Cell>
                                <Table.Cell>{format.wei(stats.slapped)}</Table.Cell>
                                <Table.Cell>{stats.won.toString()}</Table.Cell>
                                <Table.Cell>{stats.lost.toString()}</Table.Cell>
                                <Table.Cell>{format.wei(stats.wagered)}</Table.Cell>
                            </Table.Row>
                        {/each}
                        {#if leaderboard.length === 0}
                            <Table.Row>
                                <Table.Cell colspan="6" class="text-center text-muted-foreground">
                                    No players yet
                                </Table.Cell>
                            </Table.Row>
                        {/if}
                    </Table.Body>
                </Table.Root>
            {/if}
        </Card.Content>
    </Card.Root>
</div>