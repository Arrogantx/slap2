<script>
    import { supabase } from '$lib/supabase';
    import * as Card from "$lib/components/ui/card";
    import * as Table from "$lib/components/ui/table";
    import { Button } from "$lib/components/ui/button";
    import { connected, signerAddress, isAdmin } from "$lib/store";
    import { onMount } from 'svelte';
    import * as format from "$lib/format";
    import { goto } from '$app/navigation';
    import { writable } from 'svelte/store';

    let requests = writable([]);
    let loading = writable(true);
    let updating = writable({});  // Store to track updating state per request
    let error = writable(null);

    async function loadRequests() {
        if (!connected || !signerAddress || !isAdmin) {
            requests.set([]);
            return;
        }

        try {
            loading.set(true);
            error.set(null);
            const { data, error: fetchError } = await supabase
                .from('whitelist_requests')
                .select('*')
                .eq('status', 'pending')
                .order('created_at', { ascending: false });

            if (fetchError) throw fetchError;
            requests.set(data || []);
        } catch (err) {
            console.error('Failed to load requests:', err);
            error.set('Failed to load whitelist requests. Please try again.');
            requests.set([]);
        } finally {
            loading.set(false);
        }
    }

    async function updateStatus(id, newStatus) {
        if (!id || !newStatus) return;

        updating.update(state => ({ ...state, [id]: true }));

        try {
            error.set(null);

            // First verify the request still exists and is pending
            const { data: currentRequest, error: checkError } = await supabase
                .from('whitelist_requests')
                .select('status')
                .eq('id', id)
                .maybeSingle();  // Prevents 406 error if not found

            if (checkError) throw checkError;
            if (!currentRequest) throw new Error('Request not found');
            if (currentRequest.status !== 'pending') throw new Error('Request is no longer pending');

            // Perform the update with optimistic concurrency control
            const { error: updateError } = await supabase
                .from('whitelist_requests')
                .update({
                    status: newStatus,
                    updated_at: new Date().toISOString()
                })
                .eq('id', id)
                .eq('status', 'pending');

            if (updateError) throw updateError;

            // Verify the update was successful
            const { data: verifyRequest, error: verifyError } = await supabase
                .from('whitelist_requests')
                .select('status')
                .eq('id', id)
                .maybeSingle();

            if (verifyError) throw verifyError;
            if (!verifyRequest || verifyRequest.status !== newStatus) {
                throw new Error('Failed to verify status update');
            }

            // Remove the updated request from local state
            requests.update(reqs => reqs.filter(request => request.id !== id));
        } catch (err) {
            console.error('Failed to update status:', err);
            error.set(`Failed to update request status: ${err.message}`);
            await loadRequests();
        } finally {
            updating.update(state => ({ ...state, [id]: false }));
        }
    }

    onMount(() => {
        loadRequests();
        const interval = setInterval(() => {
            if (connected && signerAddress && isAdmin) {
                loadRequests();
            }
        }, 15000);

        return () => clearInterval(interval);
    });
</script>

<!-- UI Section -->
<div class="container mx-auto py-8">
    {#if !connected}
        <Card.Root class="max-w-md mx-auto">
            <Card.Content class="text-center py-8">
                Please connect your wallet to access the admin panel.
            </Card.Content>
        </Card.Root>
    {:else if !isAdmin}
        <Card.Root class="max-w-md mx-auto">
            <Card.Content class="text-center py-8">
                You don't have admin access.
            </Card.Content>
        </Card.Root>
    {:else}
        <div class="space-y-8">
            <Card.Root>
                <Card.Header>
                    <div class="flex justify-between items-center">
                        <div>
                            <Card.Title>Pending Whitelist Requests</Card.Title>
                            <Card.Description>Manage pending whitelist requests</Card.Description>
                        </div>
                        <div class="flex gap-4">
                            <Button on:click={() => goto('/admin/blacklist')}>Manage Blacklist</Button>
                            <Button on:click={() => goto('/admin/whitelist')}>View All Requests</Button>
                        </div>
                    </div>
                </Card.Header>
                <Card.Content>
                    {#if $error}
                        <div class="bg-destructive/10 text-destructive p-4 rounded-md mb-4">
                            {$error}
                        </div>
                    {/if}
                    
                    <Table.Root>
                        <Table.Header>
                            <Table.Row>
                                <Table.Head>Wallet</Table.Head>
                                <Table.Head>X Account</Table.Head>
                                <Table.Head>Status</Table.Head>
                                <Table.Head>Date</Table.Head>
                                <Table.Head>Actions</Table.Head>
                            </Table.Row>
                        </Table.Header>
                        <Table.Body>
                            {#if $loading}
                                <Table.Row>
                                    <Table.Cell colspan="5" class="text-center">Loading...</Table.Cell>
                                </Table.Row>
                            {:else if $requests.length === 0}
                                <Table.Row>
                                    <Table.Cell colspan="5" class="text-center">No pending requests found</Table.Cell>
                                </Table.Row>
                            {:else}
                                {#each $requests as request}
                                    <Table.Row>
                                        <Table.Cell>{format.address(request.wallet_address)}</Table.Cell>
                                        <Table.Cell>
                                            {#if request.twitter_handle}
                                                <a href="https://x.com/{request.twitter_handle}" target="_blank" rel="noopener noreferrer" class="text-primary hover:underline">
                                                    @{request.twitter_handle}
                                                </a>
                                            {:else}
                                                -
                                            {/if}
                                        </Table.Cell>
                                        <Table.Cell>{request.status}</Table.Cell>
                                        <Table.Cell>{new Date(request.created_at).toLocaleDateString()}</Table.Cell>
                                        <Table.Cell>
                                            <div class="flex gap-2">
                                                <Button
                                                    size="sm"
                                                    disabled={$updating[request.id]}
                                                    on:click={() => updateStatus(request.id, 'approved')}
                                                >
                                                    {$updating[request.id] ? 'Updating...' : 'Approve'}
                                                </Button>
                                                <Button
                                                    size="sm"
                                                    variant="destructive"
                                                    disabled={$updating[request.id]}
                                                    on:click={() => updateStatus(request.id, 'denied')}
                                                >
                                                    {$updating[request.id] ? 'Updating...' : 'Deny'}
                                                </Button>
                                            </div>
                                        </Table.Cell>
                                    </Table.Row>
                                {/each}
                            {/if}
                        </Table.Body>
                    </Table.Root>
                </Card.Content>
            </Card.Root>
        </div>
    {/if}
</div>
