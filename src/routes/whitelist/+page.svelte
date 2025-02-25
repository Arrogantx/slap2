<script>
    import { supabase } from '$lib/supabase';
    import * as Card from "$lib/components/ui/card";
    import { Button } from "$lib/components/ui/button";
    import { connected, signerAddress } from "$lib/store";
    import { onMount } from 'svelte';
    import { signIn, signOut } from '@auth/sveltekit/client';
    import { page } from '$app/stores';
    import { writable } from 'svelte/store';

    // Reactive variables (writable stores)
    let status = writable('');
    let loading = writable(false);
    let lastChecked = writable(null);
    let twitterHandle = writable(null);

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
                .maybeSingle(); // Prevents 406 errors

            if (blacklistError) {
                console.error('Blacklist check error:', blacklistError);
                throw blacklistError;
            }

            if (blacklistData) {
                status.set('denied');
                lastChecked.set(new Date());
                return;
            }

            // Check whitelist status
            const { data, error } = await supabase
                .from('whitelist_requests')
                .select('status, updated_at, twitter_handle')
                .eq('wallet_address', lowerAddress)
                .order('updated_at', { ascending: false })
                .limit(1);

            if (error) throw error;

            if (data && data.length > 0) {
                status.set(data[0].status);
                lastChecked.set(new Date(data[0].updated_at));
                twitterHandle.set(data[0].twitter_handle);
            } else {
                status.set('');
                lastChecked.set(null);
                twitterHandle.set(null);
            }

            console.log('Whitelist status:', data?.[0]?.status, 'Last updated:', lastChecked);
        } catch (error) {
            console.error('Failed to check whitelist status:', error);
        }
    }

    async function requestWhitelist() {
        let address;
        let sessionUser;
        signerAddress.subscribe(value => { address = value; });
        page.subscribe(data => { sessionUser = data?.session?.user?.username; });

        if (!address || !sessionUser) return;

        loading.set(true);
        try {
            const lowerAddress = address.toLowerCase();
            console.log('Submitting whitelist request for:', lowerAddress);

            // Check if address is blacklisted
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

            // Create whitelist request with Twitter handle
            const { error } = await supabase
                .from('whitelist_requests')
                .insert([{ 
                    wallet_address: lowerAddress,
                    twitter_handle: sessionUser,
                    status: 'pending',
                    created_at: new Date().toISOString(),
                    updated_at: new Date().toISOString()
                }]);
            
            if (error) {
                console.error('Whitelist request error:', error);
                throw error;
            }

            status.set('pending');
            twitterHandle.set(sessionUser);
            lastChecked.set(new Date());
            console.log('Whitelist request submitted successfully');
        } catch (error) {
            console.error('Failed to request whitelist:', error);
            alert('Failed to submit whitelist request. Please try again.');
        } finally {
            loading.set(false);
        }
    }

    // Set up periodic status check
    let statusCheckInterval;

    onMount(() => {
        if (connected && signerAddress) {
            checkWhitelistStatus();
        }

        statusCheckInterval = setInterval(() => {
            if (connected && signerAddress) {
                checkWhitelistStatus();
            }
        }, 30000);

        return () => clearInterval(statusCheckInterval);
    });
</script>

<!-- UI Section -->
<div class="container mx-auto py-8">
    <Card.Root class="max-w-md mx-auto neon-glow">
        <Card.Header>
            <Card.Title class="text-2xl font-bold text-center neon-text">Presale Whitelist</Card.Title>
            <Card.Description class="text-center">
                Request to join the presale whitelist
            </Card.Description>
        </Card.Header>
        <Card.Content>
            {#if connected}
                {#if !$page.data?.session}
                    <div class="text-center">
                        <p class="mb-4">Please connect your X (Twitter) account to continue.</p>
                        <Button class="hover-lift" on:click={() => signIn('twitter')}>
                            Connect X Account
                        </Button>
                    </div>
                {:else if $status === ''}
                    <div class="text-center">
                        <p class="mb-4">Connected as @{$page.data.session.user.username}</p>
                        <p class="mb-4">You haven't requested to join the whitelist yet.</p>
                        <Button class="hover-lift" disabled={$loading} on:click={requestWhitelist}>
                            {$loading ? 'Submitting...' : 'Request Whitelist'}
                        </Button>
                    </div>
                {:else if $status === 'pending'}
                    <div class="text-center">
                        <p class="text-yellow-500">Your whitelist request is pending approval.</p>
                        <p class="text-sm mt-2">X Account: @{$twitterHandle}</p>
                        {#if $lastChecked}
                            <p class="text-sm text-muted-foreground mt-2">
                                Submitted: {$lastChecked.toLocaleDateString()} {$lastChecked.toLocaleTimeString()}
                            </p>
                        {/if}
                    </div>
                {:else if $status === 'approved'}
                    <div class="text-center">
                        <p class="text-green-500">Congratulations! You are whitelisted for the presale.</p>
                        <p class="text-sm mt-2">X Account: @{$twitterHandle}</p>
                        {#if $lastChecked}
                            <p class="text-sm text-muted-foreground mt-2">
                                Approved: {$lastChecked.toLocaleDateString()} {$lastChecked.toLocaleTimeString()}
                            </p>
                        {/if}
                    </div>
                {:else if $status === 'denied'}
                    <div class="text-center">
                        <p class="text-red-500">Your whitelist request was not approved.</p>
                        <p class="text-sm mt-2">X Account: @{$twitterHandle}</p>
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
