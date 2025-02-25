<script>
    import { supabase } from '$lib/supabase';
    import { writable } from 'svelte/store';
    import { connected, signerAddress, isAdmin } from "$lib/store";
    import { onMount } from 'svelte';
    import * as format from "$lib/format";
    import * as Card from "$lib/components/ui/card";
    import * as Table from "$lib/components/ui/table";
    import { Button } from "$lib/components/ui/button";
    import { Input } from "$lib/components/ui/input";
    import { Label } from "$lib/components/ui/label";
  
    let blacklistedAddresses = writable([]);
    let loading = writable(true);
    let adding = writable(false);
    let error = writable(null);
    let newAddress = writable('');
    let reason = writable('');
  
    async function loadBlacklist() {
      if (!$isAdmin) return;
  
      try {
        loading.set(true);
        error.set(null);
  
        const { data, error: fetchError } = await supabase
          .from('blacklist')
          .select('*')
          .order('created_at', { ascending: false });
  
        if (fetchError) throw fetchError;
        blacklistedAddresses.set(data || []);
      } catch (err) {
        console.error('Failed to load blacklist:', err);
        error.set('Failed to load blacklist. Please try again.');
      } finally {
        loading.set(false);
      }
    }
  
    async function addToBlacklist() {
      if (!$isAdmin || !newAddress || adding) return;
  
      try {
        adding.set(true);
        error.set(null);
  
        const formattedAddress = newAddress.toLowerCase();
  
        const { data: existing, error: fetchError } = await supabase
          .from('blacklist')
          .select('id')
          .eq('wallet_address', formattedAddress)
          .maybeSingle();
  
        if (fetchError) {
          console.error('Supabase Error:', fetchError);
        }
  
        if (existing) {
          error.set('Address is already blacklisted');
          return;
        }
  
        const { error: insertError } = await supabase
          .from('blacklist')
          .insert({
            wallet_address: formattedAddress,
            reason: reason || null,
            created_by: $signerAddress
          });
  
        if (insertError) throw insertError;
  
        // Auto-deny any pending whitelist requests
        const { error: updateError } = await supabase
          .from('whitelist_requests')
          .update({
            status: 'denied',
            updated_at: new Date().toISOString()
          })
          .eq('wallet_address', formattedAddress)
          .eq('status', 'pending');
  
        if (updateError) {
          console.error('Failed to auto-deny whitelist:', updateError);
        }
  
        newAddress.set('');
        reason.set('');
        await loadBlacklist();
  
      } catch (err) {
        console.error('Failed to add to blacklist:', err);
        error.set(`Failed to add address to blacklist: ${err.message}`);
      } finally {
        adding.set(false);
      }
    }
  
    async function removeFromBlacklist(id, address) {
      if (!$isAdmin) return;
  
      try {
        error.set(null);
  
        const { error: deleteError } = await supabase
          .from('blacklist')
          .delete()
          .eq('id', id);
  
        if (deleteError) throw deleteError;
  
        blacklistedAddresses.update((list) =>
          list.filter((item) => item.id !== id)
        );
  
      } catch (err) {
        console.error('Failed to remove from blacklist:', err);
        error.set(`Failed to remove address from blacklist: ${err.message}`);
      }
    }
  
    onMount(() => {
      if ($connected && $signerAddress && $isAdmin) {
        loadBlacklist();
      }
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
        <div class="space-y-8">
            <Card.Root>
                <Card.Header>
                    <Card.Title>Blacklist Management</Card.Title>
                    <Card.Description>Add or remove addresses from the blacklist</Card.Description>
                </Card.Header>
                <Card.Content>
                    {#if error}
                        <div class="bg-destructive/10 text-destructive p-4 rounded-md mb-4">
                            {error}
                        </div>
                    {/if}
                    
                    
                    <div class="space-y-4 mb-8">
                        <div class="grid gap-4">
                            <div class="grid gap-2">
                                <Label for="address">Wallet Address</Label>
                                <Input 
                                    id="address"
                                    bind:value={newAddress}
                                    placeholder="0x..."
                                />
                            </div>
                            <div class="grid gap-2">
                                <Label for="reason">Reason (optional)</Label>
                                <Input 
                                    id="reason"
                                    bind:value={reason}
                                    placeholder="Reason for blacklisting"
                                />
                            </div>
                        </div>
                        <Button 
                            disabled={!newAddress || adding} 
                            on:click={addToBlacklist}
                        >
                            {adding ? 'Adding...' : 'Add to Blacklist'}
                        </Button>
                    </div>

                    <Table.Root>
                        <Table.Header>
                            <Table.Row>
                                <Table.Head>Wallet</Table.Head>
                                <Table.Head>Reason</Table.Head>
                                <Table.Head>Added By</Table.Head>
                                <Table.Head>Date</Table.Head>
                                <Table.Head>Actions</Table.Head>
                            </Table.Row>
                        </Table.Header>
                        <Table.Body>
                            {#if loading}
                                <Table.Row>
                                    <Table.Cell colspan="5" class="text-center">Loading...</Table.Cell>
                                </Table.Row>
                            {:else if blacklistedAddresses.length === 0}
                                <Table.Row>
                                    <Table.Cell colspan="5" class="text-center">No addresses blacklisted</Table.Cell>
                                </Table.Row>
                            {:else}
                                {#each blacklistedAddresses as address}
                                    <Table.Row>
                                        <Table.Cell>{format.address(address.wallet_address)}</Table.Cell>
                                        <Table.Cell>{address.reason || '-'}</Table.Cell>
                                        <Table.Cell>{format.address(address.created_by)}</Table.Cell>
                                        <Table.Cell>
                                            {new Date(address.created_at).toLocaleDateString()}
                                        </Table.Cell>
                                        <Table.Cell>
                                            <Button
                                                variant="destructive"
                                                size="sm"
                                                on:click={() => removeFromBlacklist(address.id, address.wallet_address)}
                                            >
                                                Remove
                                            </Button>
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