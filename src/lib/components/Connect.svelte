<script>
    import { onMount } from "svelte";
    import { browser } from "$app/environment";
    import { modal, wagmiAdapter } from "$lib/appkit";
    import { supabase } from "$lib/supabase";
    import {
        accountState,
        networkState,
        appKitState,
        themeState,
        events,
        walletInfo,
        signerAddress,
        connected,
        isAdmin
    } from "$lib/store";

    import { getAccount, getBalance } from '@wagmi/core';
    import { Button } from "$lib/components/ui/button";

    let props = $props();

    async function checkAdminStatus(address) {
        if (!address) {
            $isAdmin = false;
            return;
        }
        
        try {
            const lowerAddress = address.toLowerCase();
            console.log('Checking admin status for:', lowerAddress);
            
            const { data, error } = await supabase
                .from('admins')
                .select('*')
                .eq('wallet_address', lowerAddress);
                
            if (error) {
                console.error('Admin check error:', error);
                $isAdmin = false;
                return;
            }
            
            $isAdmin = data && data.length > 0;
            console.log('Admin status result:', $isAdmin, 'Data:', data);
        } catch (error) {
            console.error('Admin check failed:', error);
            $isAdmin = false;
        }
    }

    onMount(async () => {
        if (!modal) return;

        modal.subscribeAccount((state) => {
            $accountState = state;
            $connected = $accountState.isConnected;
            $signerAddress = $accountState.address;
            
            // Check admin status when wallet connects
            if ($connected && $signerAddress) {
                checkAdminStatus($signerAddress);
            } else {
                $isAdmin = false;
            }
        });

        modal.subscribeNetwork((state) => {
            $networkState = state;
        });

        modal.subscribeState((state) => {
            $appKitState = state;
        });

        modal.subscribeEvents((state) => {
            $events = state;
        });

        modal.subscribeWalletInfo((state) => {
            $walletInfo = state;
        });
    });
</script>

<appkit-button props></appkit-button>