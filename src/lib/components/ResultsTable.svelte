<script>
    import * as Card from "$lib/components/ui/card";
    import * as Table from "$lib/components/ui/table";
    import * as format from "$lib/format";
    import { Button } from "$lib/components/ui/button";
    import * as slapflip from "$lib/contracts/slapflip";
    import { onMount } from "svelte";
    
    let pendingSlaps = $state([]);
    let fulfilledSlaps = $state([]);
    let loading = $state(true);
    let displayCount = $state(10);

    const loadSlaps = async () => {
        try {
            loading = true;
            const [pending, fulfilled] = await Promise.all([
                slapflip.getRecentPendingSlaps(displayCount),
                slapflip.getRecentFulfilledSlaps(displayCount)
            ]);
            pendingSlaps = pending.map(slapflip.formatSlapStatus);
            fulfilledSlaps = fulfilled.map(slapflip.formatSlapStatus);
        } catch (error) {
            console.error('Failed to load slaps:', error);
        } finally {
            loading = false;
        }
    };

    onMount(() => {
        loadSlaps();
        // Refresh every 15 seconds
        const interval = setInterval(loadSlaps, 15000);
        return () => clearInterval(interval);
    });
</script>

<div class="flex flex-col gap-4">
    {#if !loading && pendingSlaps.length > 0}
        <Card.Root>
            <Card.Header>
                <Card.Title>Pending Slaps</Card.Title>
            </Card.Header>
            <Card.Content>
                <div class="rounded-lg overflow-hidden border">
                    <Table.Root>
                        <Table.Header>
                            <Table.Row class="bg-primary hover:bg-primary border-l border-r">
                                <Table.Head class="text-white font-semibold">Player</Table.Head>
                                <Table.Head class="text-white font-semibold">Slapped</Table.Head>
                                <Table.Head class="text-white font-semibold">Amount</Table.Head>
                                <Table.Head class="text-white font-semibold">Type</Table.Head>
                                <Table.Head class="text-white font-semibold">Status</Table.Head>
                            </Table.Row>
                        </Table.Header>
                        <Table.Body>
                            {#each pendingSlaps as slap, i}
                                <Table.Row class="border-l border-r {i === pendingSlaps.length - 1 ? 'border-b' : ''} {i % 2 === 0 ? 'bg-warning/5' : 'bg-warning/10'}">
                                    <Table.Cell>{format.address(slap.player)}</Table.Cell>
                                    <Table.Cell>{format.address(slap.slappee)}</Table.Cell>
                                    <Table.Cell>{format.wei(slap.amount)}</Table.Cell>
                                    <Table.Cell>{slap.tokenType === 0 ? 'AVAX' : 'SLAP'}</Table.Cell>
                                    <Table.Cell>PENDING</Table.Cell>
                                </Table.Row>
                            {/each}
                        </Table.Body>
                    </Table.Root>
                </div>
            </Card.Content>
        </Card.Root>
    {/if}

    <Card.Root>
        <Card.Header>
            <Card.Title>Recent Slaps</Card.Title>
        </Card.Header>
        <Card.Content>
            {#if loading && fulfilledSlaps.length === 0}
                <div class="flex justify-center p-4">
                    <span>Loading...</span>
                </div>
            {:else}
                <div class="rounded-lg overflow-hidden border">
                    <Table.Root>
                        <Table.Header>
                            <Table.Row class="bg-primary hover:bg-primary border-l border-r">
                                <Table.Head class="text-white font-semibold">Player</Table.Head>
                                <Table.Head class="text-white font-semibold">Slapped</Table.Head>
                                <Table.Head class="text-white font-semibold">Amount</Table.Head>
                                <Table.Head class="text-white font-semibold">Swing</Table.Head>
                                <Table.Head class="text-white font-semibold">Result</Table.Head>
                            </Table.Row>
                        </Table.Header>
                        <Table.Body>
                            {#each fulfilledSlaps as slap, i}
                                <Table.Row 
                                    class={`border-l border-r ${i === fulfilledSlaps.length - 1 ? 'border-b' : ''} 
                                    ${slap.won 
                                        ? (i % 2 === 0 ? 'bg-success/5' : 'bg-success/10')
                                        : (i % 2 === 0 ? 'bg-destructive/5' : 'bg-destructive/10')
                                    }`}
                                >
                                    <Table.Cell>{format.address(slap.player)}</Table.Cell>
                                    <Table.Cell>{format.address(slap.slappee)}</Table.Cell>
                                    <Table.Cell>{format.wei(slap.amount)}</Table.Cell>
                                    <Table.Cell>{slap.tokenType === 0 ? 'SLAP' : 'AVAX'}</Table.Cell>
                                    <Table.Cell>{slap.won ? 'SLAPPED' : 'MISSED'}</Table.Cell>
                                </Table.Row>
                            {/each}
                            {#if fulfilledSlaps.length === 0}
                                <Table.Row class="border-l border-r border-b">
                                    <Table.Cell colspan="5" class="text-center text-muted-foreground">
                                        No fulfilled slaps
                                    </Table.Cell>
                                </Table.Row>
                            {/if}
                        </Table.Body>
                    </Table.Root>
                </div>
            {/if}
        </Card.Content>
    </Card.Root>
</div>