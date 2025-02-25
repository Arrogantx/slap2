<script>
    import * as Card from "$lib/components/ui/card";
    import * as Tabs from "$lib/components/ui/tabs";
    import { Button } from "$lib/components/ui/button";
    import { Input } from "$lib/components/ui/input";
    import { Label } from "$lib/components/ui/label";
    import { onMount } from "svelte";
    import { getPublicClient } from "@wagmi/core";
    import { wagmiAdapter } from "$lib/appkit";

    import { connected, signerAddress } from "$lib/store";
    import * as format from "$lib/format";
    import * as tokenContract from "$lib/contracts/token";
    import * as slapflip from "$lib/contracts/slapflip"; 
    import { formatEther, parseEther } from 'viem';
    import { SLAPFLIP_ADDRESS } from "$lib/config";

    import HEADER_IMAGE from "$lib/assets/avax.svg";

    let tokenBalance = $state(null);
    let nativeBalance = $state(null);
    let symbol = $state("");
    let allowance = $state(null);
    let slapAmount = $state(100);
    let avaxAmount = $state(1)
    let toSlap = $state("");
    let maxSlap = $state(null);
    let maxSlapNativeAmount = $state(null);
    let amountError = $state("");
    let selectedTab = $state("avax");

    $effect(() => {
        if (selectedTab === "token" && slapAmount) {
            try {
                const amount = parseEther(slapAmount.toString());
                
                if (maxSlap && amount > maxSlap) {
                    amountError = `Amount exceeds maximum slap of ${format.wei(maxSlap)} SLAP`;
                } else {
                    amountError = "";
                }
            } catch (e) {
                amountError = "Invalid amount";
            }
        } else if (selectedTab === "avax" && avaxAmount) {
            try {
                const amount = parseEther(avaxAmount.toString());
                
                if (maxSlapNativeAmount && amount > maxSlapNativeAmount) {
                    amountError = `Amount exceeds maximum slap of ${format.wei(maxSlapNativeAmount)} AVAX`;
                } else {
                    amountError = "";
                }
            } catch (e) {
                amountError = "Invalid amount";
            }
        } else {
            amountError = "";
        }
    });

    const update = async () => {
        if ($connected) {
            const [native, tokenBal, allowanceVal, maxSlapVal, maxSlapNativeVal] = await Promise.all([
                getPublicClient(wagmiAdapter.wagmiConfig).getBalance({ address: $signerAddress }),
                tokenContract.balanceOf($signerAddress),
                tokenContract.allowance($signerAddress, SLAPFLIP_ADDRESS),
                slapflip.maxSlap(),
                slapflip.maxSlapNative()
            ]);

            nativeBalance = native;
            tokenBalance = tokenBal;
            symbol = await tokenContract.symbol();
            allowance = allowanceVal;
            maxSlap = maxSlapVal;
            maxSlapNativeAmount = maxSlapNativeVal;
        }
    };

    const handleApprove = async () => {
        if ($connected) {
            await tokenContract.approve(
                SLAPFLIP_ADDRESS,
                BigInt(2) ** BigInt(256) - BigInt(1),
            );
            await update();
        }
    };

    const handleSlap = async () => {
        if ($connected) {
            const targetAddress = toSlap || "0x0000000000000000000000000000000000000000";
            
            try {
                if (selectedTab === "token") {
                    await slapflip.slapWithToken(targetAddress, parseEther(slapAmount.toString()));
                } else {
                    await slapflip.slapWithNative(
                        targetAddress, 
                        parseEther(avaxAmount.toString())
                    );
                }
                await update();
            } catch (e) {
                console.error("Slap failed:", e);
            }
        }
    };

    onMount(async () => {
        if ($connected) {
            await update();
        }
        setInterval(update, 7777);
    });
</script>

<Card.Root>
    <Card.Header>
        <img src="/tokens/slap.png" class="max-w-xs mx-auto" alt="SLAP" />
    </Card.Header>
    <Card.Content>
        <Tabs.Root value={selectedTab} class="w-full" onValueChange={(value) => selectedTab = value}>
            <Tabs.List class="grid w-full grid-cols-2">
                <Tabs.Trigger value="avax">AVAX</Tabs.Trigger>
                <Tabs.Trigger value="token">SLAP</Tabs.Trigger>
            </Tabs.List>
            
            <Tabs.Content value="avax">
                <div class="mt-4">
                    <div class="flex w-full flex-col gap-1.5">
                        <Label for="avax-who" class="text-sm text-left">Slap</Label>
                        <Input id="avax-who" name="avax-who" bind:value={toSlap} type="text" placeholder="Who to slap" />
                    </div>
                    
                    <div class="flex w-full flex-col gap-1.5 mt-4">
                        <div class="flex w-full items-center justify-between">
                            <Label for="avax-amount" class="text-sm">Amount</Label>
                            <div class="text-right text-sm text-gray-700">
                                Balance: <span class="font-medium">
                                    {nativeBalance === null ? "~" : format.wei(nativeBalance)} AVAX
                                </span>
                            </div>
                        </div>
                        <div class="relative">
                            <div class="absolute inset-y-0 left-0 flex items-center pl-3">
                                <img src="/tokens/avax.svg" alt="Icon" class="w-5 h-5" />
                            </div>
                            <Input 
                                id="avax-amount" 
                                name="avax-amount" 
                                bind:value={avaxAmount} 
                                type="text" 
                                class="pl-10 pr-14 w-full {amountError ? 'border-red-500' : ''}" 
                            />
                            <div class="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                                <span class="text-gray-400 text-sm">AVAX</span>
                            </div>
                        </div>
                        {#if amountError}
                            <p class="text-red-500 text-sm mt-1 text-center">{amountError}</p>
                        {/if}
                        {#if maxSlapNativeAmount}
                            <p class="text-gray-400 text-sm mt-1 text-center">
                                <span class="font-medium">Max amount:</span> {format.wei(maxSlapNativeAmount)} AVAX
                            </p>
                        {/if}
                    </div>
                </div>
            </Tabs.Content>

            <Tabs.Content value="token">
                <div class="mt-4">
                    <div class="flex w-full flex-col gap-1.5">
                        <Label for="token-who" class="text-left">Slap</Label>
                        <Input id="token-who" name="token-who" bind:value={toSlap} type="text" placeholder="Who to slap" />
                    </div>
                    
                    <div class="flex w-full flex-col gap-1.5 mt-4">
                        <div class="flex w-full items-center justify-between">
                            <Label for="token-amount" class="text-sm">Amount</Label>
                            <div class="text-right text-sm text-gray-700">
                                Balance: <span class="font-medium">
                                    {tokenBalance === null ? "~" : format.wei(tokenBalance)}
                                </span>
                            </div>
                        </div>
                        <div class="relative">
                            <div class="absolute inset-y-0 left-0 flex items-center pl-3">
                                <img src="/tokens/slap.png" alt="Icon" class="w-5 h-5" />
                            </div>
                            <Input 
                                id="token-amount" 
                                name="token-amount" 
                                bind:value={slapAmount} 
                                type="text" 
                                class="pl-10 pr-14 w-full {amountError ? 'border-red-500' : ''}" 
                            />
                            <div class="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                                <span class="text-gray-400 text-sm">SLAP</span>
                            </div>
                        </div>
                        {#if amountError}
                            <p class="text-red-500 text-sm mt-1 text-center">{amountError}</p>
                        {/if}
                        {#if maxSlap}
                            <p class="text-gray-400 text-sm mt-1 text-center">
                                <span class="font-medium">Max amount:</span> {format.wei(maxSlap)} SLAP
                            </p>
                        {/if}
                    </div>
                </div>
            </Tabs.Content>
        </Tabs.Root>
    </Card.Content>
    <Card.Footer>
        {#if $connected}
            {#if selectedTab === "token"}
                {#if allowance && BigInt(allowance) >= BigInt(slapAmount || 0)}
                    <Button on:click={handleSlap} class="w-full">Slap!</Button>
                {:else}
                    <Button on:click={handleApprove} class="w-full">Approve SLAP</Button>
                {/if}
            {:else}
                <Button on:click={handleSlap} class="w-full">Slap!</Button>
            {/if}
        {:else}
            <Button disabled class="w-full">Connect Wallet</Button>
        {/if}
    </Card.Footer>
</Card.Root>