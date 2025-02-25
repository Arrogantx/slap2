<script>
    import * as Card from "$lib/components/ui/card";
    import { Button } from "$lib/components/ui/button";
    import { Input } from "$lib/components/ui/input";
    import { Label } from "$lib/components/ui/label";
    import { recentSlaps, pendingSlaps, chatMessages, sendMessage, maxBetAmount, walletConnected } from "$lib/store";
    import { writable, get } from 'svelte/store';

    import ResultsTable from "$lib/components/ResultsTable.svelte";
    import Play from "$lib/components/Play.svelte";

    let message = "";
    let betAmount = writable(0);

    const handleSend = () => {
        if (message.trim()) {
            sendMessage(message);
            message = ""; // Clear input after sending
        }
    };

    const setMaxBet = () => {
        betAmount.set(get(maxBetAmount));
    };
</script>

<div class="container mx-auto p-4">
    <div class="flex gap-4 flex-col md:flex-row">
        <div class="md:w-3/5 space-y-4">
            <div class="w-full">
                <Play />
            </div>
            <div class="w-full">
                <ResultsTable />
            </div>
            {#if $recentSlaps.length > 0}
            <div class="w-full">
                <Card.Root class="h-4/5">
                    <Card.Header>
                        <Card.Title>Recent Slaps</Card.Title>
                        <Card.Description>See the latest slap battles</Card.Description>
                    </Card.Header>
                    <Card.Content class="flex-grow overflow-y-auto h-[calc(100%-8rem)]">
                        {#each $recentSlaps as slap}
                            <div class="p-2 border-b">{slap}</div>
                        {/each}
                    </Card.Content>
                </Card.Root>
            </div>
            {/if}
            {#if $pendingSlaps.length > 0}
            <div class="w-full">
                <Card.Root class="h-4/5">
                    <Card.Header>
                        <Card.Title>Pending Slaps</Card.Title>
                        <Card.Description>Live updates of pending slaps</Card.Description>
                    </Card.Header>
                    <Card.Content class="flex-grow overflow-y-auto h-[calc(100%-8rem)]">
                        {#each $pendingSlaps as slap}
                            <div class="p-2 border-b">{slap}</div>
                        {/each}
                    </Card.Content>
                </Card.Root>
            </div>
            {/if}
        </div>

        <div class="md:w-2/5">
            <Card.Root class="h-4/5">
                <Card.Header>
                    <Card.Title>Chat</Card.Title>
                    <Card.Description>
                        Chat with other players
                    </Card.Description>
                </Card.Header>
                <Card.Content class="flex-grow overflow-y-auto h-[calc(100%-8rem)]">
                    <div class="space-y-4">
                        {#each $chatMessages.slice(-50) as msg} <!-- Show last 50 messages -->
                            <div class="p-2 border-b">{msg}</div>
                        {/each}
                    </div>
                </Card.Content>
               <Card.Footer class="border-t pt-2">
    <div class="flex gap-2 w-full">
        <Input 
            id="chatMessage" 
            name="chatMessage" 
            bind:value={message} 
            placeholder="Type a message..." 
            on:keydown={(e) => e.key === 'Enter' && handleSend()} 
        />
        <Button on:click={handleSend}>Send</Button>
    </div>
</Card.Footer>

            </Card.Root>
        </div>
    </div>
    

   
</div>
