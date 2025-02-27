<script>
    import { supabase } from '$lib/supabase';
    import * as Card from "$lib/components/ui/card";
    import { Button } from "$lib/components/ui/button";
    import { Input } from "$lib/components/ui/input";
    import { Label } from "$lib/components/ui/label";
    import { connected, signerAddress } from "$lib/store";
    import { onMount } from 'svelte';
    import { writable } from 'svelte/store';

    let status = writable('');
    let loading = writable(false);
    let lastChecked = writable(null);
    let xHandle = writable('');
    let error = writable('');

    async function checkWhitelistStatus() {
        let address;
        signerAddress.subscribe(value => { address = value; });

        if (!address || typeof address !== 'string') {
            console.error("signerAddress is invalid:", address);
            return;
        }

        const lowerAddress = address.toLowerCase();
        console.log('Checking whitelist status for:', lowerAddress);

        try {
            const { data: blacklistData, error: blacklistError } = await supabase
                .from('blacklist')
                .select('id')
                .eq('wallet_address', lowerAddress)
                .maybeSingle();

            if (blacklistError) {
                console.error('Blacklist check error:', blacklistError);
                throw blacklistError;
            }

            if (blacklistData) {
                status.set('denied');
                lastChecked.set(new Date());
                return;
            }

            const { data, error: whitelistError } = await supabase
                .from('whitelist_requests')
                .select('status, updated_at, twitter_handle')
                .eq('wallet_address', lowerAddress)
                .order('updated_at', { ascending: false })
                .limit(1);

            if (whitelistError) throw whitelistError;

            if (data && data.length > 0) {
                status.set(data[0].status);
                lastChecked.set(new Date(data[0].updated_at));
                xHandle.set(data[0].twitter_handle || '');
            } else {
                status.set('');
                lastChecked.set(null);
                xHandle.set('');
            }

        } catch (err) {
            console.error('Failed to check whitelist status:', err);
            error.set('Failed to check status. Please try again.');
        }
    }

    async function requestWhitelist() {
        let address;
        signerAddress.subscribe(value => { address = value; });

        if (!address || !$xHandle) {
            error.set('Please enter your X handle');
            return;
        }

        // Remove @ if present and trim whitespace
        const cleanHandle = $xHandle.replace('@', '').trim();
        if (!cleanHandle) {
            error.set('Please enter a valid X handle');
            return;
        }

        loading.set(true);
        error.set('');

        try {
            const lowerAddress = address.toLowerCase();

            // Check if address is blacklisted
            const { data: blacklistData, error: blacklistError } = await supabase
                .from('blacklist')
                .select('id')
                .eq('wallet_address', lowerAddress)
                .maybeSingle();
            
            if (blacklistError) throw blacklistError;

            if (blacklistData) {
                status.set('denied');
                lastChecked.set(new Date());
                return;
            }

            // Create whitelist request
            const { error: insertError } = await supabase
                .from('whitelist_requests')
                .insert([{ 
                    wallet_address: lowerAddress,
                    twitter_handle: cleanHandle,
                    status: 'pending',
                    created_at: new Date().toISOString(),
                    updated_at: new Date().toISOString()
                }]);
            
            if (insertError) throw insertError;

            status.set('pending');
            lastChecked.set(new Date());
            console.log('Whitelist request submitted successfully');
        } catch (err) {
            console.error('Failed to request whitelist:', err);
            error.set('Failed to submit request. Please try again.');
        } finally {
            loading.set(false);
        }
    }

    let statusCheckInterval;

    onMount(() => {
        if ($connected && $signerAddress) {
            checkWhitelistStatus();
        }

        statusCheckInterval = setInterval(() => {
            if ($connected && $signerAddress) {
                checkWhitelistStatus();
            }
        }, 30000);

        return () => clearInterval(statusCheckInterval);
    });
</script>

<div class="container mx-auto py-8">
    <Card.Root class="max-w-md mx-auto neon-glow">
        <Card.Header>
            <Card.Title class="text-2xl font-bold text-center neon-text">Presale Whitelist</Card.Title>
            <Card.Description class="text-center">
                Request to join the presale whitelist
            </Card.Description>
        </Card.Header>
        <Card.Content>
            {#if $connected}
                {#if $status === ''}
                    <div class="space-y-4">
                        {#if $error}
                            <p class="text-red-500 text-center">{$error}</p>
                        {/if}
                        
                        <div class="space-y-2">
                            <Label for="x-handle">X Handle</Label>
                            <Input 
                                id="x-handle"
                                bind:value={$xHandle}
                                placeholder="@username"
                            />
                        </div>
                        <Button 
                            class="w-full hover-lift" 
                            disabled={$loading} 
                            on:click={requestWhitelist}
                        >
                            {$loading ? 'Submitting...' : 'Request Whitelist'}
                        </Button>
                    </div>
                {:else if $status === 'pending'}
                    <div class="text-center">
                        <p class="text-yellow-500">Your whitelist request is pending approval.</p>
                        <p class="text-sm mt-2">X Handle: @{$xHandle}</p>
                        {#if $lastChecked}
                            <p class="text-sm text-muted-foreground mt-2">
                                Submitted: {$lastChecked.toLocaleDateString()} {$lastChecked.toLocaleTimeString()}
                            </p>
                        {/if}
                        
                    </div>
                {:else if $status === 'approved'}
                    <div class="text-center">
                        <p class="text-green-500">Congratulations! You are whitelisted for the presale.</p>
                        <p class="text-sm mt-2">X Handle: @{$xHandle}</p>
                        {#if $lastChecked}
                            <p class="text-sm text-muted-foreground mt-2">
                                Approved: {$lastChecked.toLocaleDateString()} {$lastChecked.toLocaleTimeString()}
                            </p>
                        {/if}
                        
                    </div>
                {:else if $status === 'denied'}
                    <div class="text-center">
                        <p class="text-red-500">Your whitelist request was not approved.</p>
                        <p class="text-sm mt-2">X Handle: @{$xHandle}</p>
                        {#if $lastChecked}
                            <p class="text-sm text-muted-foreground mt-2">
                                Updated: {$lastChecked.toLocaleDateString()} {$lastChecked.toLocaleTimeString()}
                            </p>
                        {/if}
                        
                    </div>
                {/if}
                
            {:else}
                <div class="text-center">
                    <p>Please connect your wallet to request whitelist access.</p>
                </div>
            {/if}
            
        </Card.Content>
    </Card.Root>
</div>