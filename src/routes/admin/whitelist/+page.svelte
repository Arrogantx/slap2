<script>
    import { supabase } from '$lib/supabase';
    import * as Card from "$lib/components/ui/card";
    import * as Table from "$lib/components/ui/table";
    import { Button } from "$lib/components/ui/button";
    import { connected, signerAddress, isAdmin } from "$lib/store";
    import { onMount } from 'svelte';
    import * as format from "$lib/format";
    import { goto } from '$app/navigation';

    let approvedRequests = $state([]);
    let deniedRequests = $state([]);
    let loading = $state(true);
    let activeTab = $state('approved'); // 'approved' or 'denied'
    let error = $state(null);

    async function loadRequests() {
        if (!$isAdmin) return;
        
        try {
            loading = true;
            error = null;
            const [approvedData, deniedData] = await Promise.all([
                supabase
                    .from('whitelist_requests')
                    .select('*')
                    .eq('status', 'approved')
                    .order('updated_at', { ascending: false }),
                supabase
                    .from('whitelist_requests')
                    .select('*')
                    .eq('status', 'denied')
                    .order('updated_at', { ascending: false })
            ]);

            if (approvedData.error) throw approvedData.error;
            if (deniedData.error) throw deniedData.error;

            approvedRequests = approvedData.data || [];
            deniedRequests = deniedData.data || [];
        } catch (err) {
            console.error('Failed to load requests:', err);
            error = 'Failed to load requests. Please try again.';
        } finally {
            loading = false;
        }
    }

    function exportToCSV(data, filename) {
        const headers = ['Wallet Address', 'X Handle', 'Status', 'Date', 'Updated'];
        const csvContent = [
            headers.join(','),
            ...data.map(row => [
                row.wallet_address,
                row.twitter_handle || '',
                row.status,
                new Date(row.created_at).toISOString(),
                new Date(row.updated_at).toISOString()
            ].join(','))
        ].join('\n');

        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        const url = URL.createObjectURL(blob);
        link.setAttribute('href', url);
        link.setAttribute('download', filename);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    }

    $effect(() => {
        if ($connected && $signerAddress && $isAdmin) {
            loadRequests();
        }
    });

    onMount(() => {
        const interval = setInterval(() => {
            if ($connected && $signerAddress && $isAdmin) {
                loadRequests();
            }
        }, 15000);

        return () => clearInterval(interval);
    });
</script>

<div class="container mx-auto py-8">
    {#if !$connected}
        <Card.Root class="max-w-md mx-auto">
            <Card.Content class="text-center py-8">
                Please connect your wallet to access the admin panel.
            </Card.Content>
        </Card.Root>
    {:else if !$isAdmin}
        <Card.Root class="max-w-md mx-auto">
            <Card.Content class="text-center py-8">
                You don't have admin access.
            </Card.Content>
        </Card.Root>
    {:else}
        <Card.Root>
            <Card.Header>
                <div class="flex justify-between items-center">
                    <div>
                        <Card.Title>Whitelist Management</Card.Title>
                        <Card.Description>Manage approved and denied whitelist requests</Card.Description>
                    </div>
                    <div class="flex gap-4">
                        <Button variant="outline" on:click={() => goto('/admin')}>
                            Return to Pending Requests
                        </Button>
                        <Button 
                            on:click={() => exportToCSV(
                                activeTab === 'approved' ? approvedRequests : deniedRequests,
                                `whitelist-${activeTab}-${new Date().toISOString().split('T')[0]}.csv`
                            )}
                        >
                            Export as CSV
                        </Button>
                    </div>
                </div>
            </Card.Header>
            <Card.Content>
                {#if error}
                    <div class="bg-destructive/10 text-destructive p-4 rounded-md mb-4">
                        {error}
                    </div>
                {/if}
                
                
                <div class="flex gap-4 mb-6">
                    <Button 
                        variant={activeTab === 'approved' ? 'default' : 'outline'}
                        on:click={() => activeTab = 'approved'}
                    >
                        Approved Requests
                    </Button>
                    <Button 
                        variant={activeTab === 'denied' ? 'default' : 'outline'}
                        on:click={() => activeTab = 'denied'}
                    >
                        Denied Requests
                    </Button>
                </div>

                <Table.Root>
                    <Table.Header>
                        <Table.Row>
                            <Table.Head>Wallet</Table.Head>
                            <Table.Head>X Handle</Table.Head>
                            <Table.Head>Status</Table.Head>
                            <Table.Head>Date</Table.Head>
                            <Table.Head>Updated</Table.Head>
                        </Table.Row>
                    </Table.Header>
                    <Table.Body>
                        {#if loading}
                            <Table.Row>
                                <Table.Cell colspan="5" class="text-center">Loading...</Table.Cell>
                            </Table.Row>
                        {:else}
                            {#each (activeTab === 'approved' ? approvedRequests : deniedRequests) as request}
                                <Table.Row>
                                    <Table.Cell>{format.address(request.wallet_address)}</Table.Cell>
                                    <Table.Cell>
                                        {#if request.twitter_handle}
                                            <a 
                                                href="https://x.com/{request.twitter_handle}" 
                                                target="_blank" 
                                                rel="noopener noreferrer" 
                                                class="text-primary hover:underline"
                                            >
                                                @{request.twitter_handle}
                                            </a>
                                        {:else}
                                            -
                                        {/if}
                                        
                                    </Table.Cell>
                                    <Table.Cell>
                                        <span class={activeTab === 'approved' ? 'text-green-500' : 'text-red-500'}>
                                            {request.status}
                                        </span>
                                    </Table.Cell>
                                    <Table.Cell>
                                        {new Date(request.created_at).toLocaleDateString()}
                                    </Table.Cell>
                                    <Table.Cell>
                                        {new Date(request.updated_at).toLocaleDateString()}
                                    </Table.Cell>
                                </Table.Row>
                            {/each}
                            
                            
                            {#if (activeTab === 'approved' ? approvedRequests : deniedRequests).length === 0}
                                <Table.Row>
                                    <Table.Cell colspan="5" class="text-center text-muted-foreground">
                                        No {activeTab} requests found
                                    </Table.Cell>
                                </Table.Row>
                            {/if}
                            
                        {/if}
                        
                    </Table.Body>
                </Table.Root>
            </Card.Content>
        </Card.Root>
    {/if}
    
</div>