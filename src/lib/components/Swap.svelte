<script>
    import {
        accountState,
        networkState,
        appKitState,
        themeState,
        events,
        walletInfo,
        wagmiConfig,
    } from "$lib/store";

    import { getAccount, getBalance } from "@wagmi/core";

    import * as Card from "$lib/components/ui/card";
    import { Label } from "$lib/components/ui/label";
    import { Input } from "$lib/components/ui/input";
    import { Button } from "$lib/components/ui/button";

    import AvaxIcon from "$lib/assets/avax.svg";
    import Rotate from "lucide-svelte/icons/refresh-cw";
    import { onMount } from "svelte";

    let slippage = $state(5);

    const rotate = () => {
        let tmp = from;
        from = to;
        to = tmp;
    };

    let from = $state({
        name: "AVAX",
        address: "0x01",
        icon: "avax.svg",
        balance: "",
        amount: "0.00",
    });

    let to = $state({
        name: "SATOSHI",
        address: "0x02",
        icon: "avax.svg",
        balance: "",
        amount: "0.00",
    });

    const update = async () => {
        let native = await getBalance($wagmiConfig, {
            address: $accountState.address
        });

        from.balance = native.formatted;
    };

    onMount(() => {
        setInterval(update, 5000);
    });
</script>

<Card.Root>
    <Card.Header>
        <Card.Title>Swap</Card.Title>
    </Card.Header>
    <Card.Content>
        <div class="flex w-full flex-col gap-1.5">
            <div class="flex w-full items-center justify-between">
                <Label for="from" class="text-sm">From</Label>
                <div class="text-right text-sm text-gray-200">
                    Balance: <span class="font-medium"
                        >{from.balance == "" ? "~" : from.balance}</span
                    >
                </div>
            </div>
            <div class="relative">
                <div class="absolute inset-y-0 left-0 flex items-center pl-3">
                    <img src="/tokens/{from.icon}" alt="Icon" class="w-5 h-5" />
                </div>
                <Input
                    type="text"
                    id="to"
                    class="pl-10 pr-14 w-full"
                    bind:value={from.amount}
                />
                <div
                    class="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none"
                >
                    <span class="text-gray-400 text-sm">{from.name}</span>
                </div>
            </div>
        </div>

        <div class="w-full pt-6">
            <Rotate
                onclick={rotate}
                class="w-5 h-5 mx-auto text-primary cursor-pointer hover:text-orange-700 active:text-orange-500"
            />
        </div>

        <div class="flex w-full flex-col gap-1.5">
            <div class="flex w-full items-center justify-between">
                <Label for="from" class="text-sm">To</Label>
                <div class="text-right text-sm text-gray-200">
                    Balance: <span class="font-medium"
                        >{to.balance == "" ? "~" : to.balance}</span
                    >
                </div>
            </div>
            <div class="relative">
                <div class="absolute inset-y-0 left-0 flex items-center pl-3">
                    <img src="/tokens/{to.icon}" alt="Icon" class="w-5 h-5" />
                </div>
                <Input
                    type="text"
                    id="to"
                    class="pl-10 pr-14 w-full"
                    bind:value={to.amount}
                />
                <div
                    class="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none"
                >
                    <span class="text-gray-400 text-sm">{to.name}</span>
                </div>
            </div>
        </div>

        <div class="mt-4">
            <span class="text-sm text-black/40">Set slippage:</span>
            <div class="flex flex-row space-x-1 mt-1">
                <Button class="text-xs" on:click={() => (slippage = 5)}
                    >5%</Button
                >
                <Button class="text-xs" on:click={() => (slippage = 10)}
                    >10%</Button
                >
                <Button class="text-xs" on:click={() => (slippage = 20)}
                    >20%</Button
                >
                <div class="relative w-24">
                    <Input
                        type="text"
                        class="w-full pr-8 text-sm"
                        bind:value={slippage}
                    />
                    <span
                        class="absolute inset-y-0 right-0 flex items-center pr-2 text-gray-500 pointer-events-none"
                    >
                        %
                    </span>
                </div>
            </div>
        </div>
    </Card.Content>
    <Card.Footer>
        <Button class="w-full uppercase text-md">swap</Button>
    </Card.Footer>
</Card.Root>
