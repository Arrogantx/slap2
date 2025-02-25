<script>
    import * as Card from "$lib/components/ui/card";
    import { Button } from "$lib/components/ui/button";
    import { Input } from "$lib/components/ui/input";

    import * as config from '$lib/config';
</script>

<Card.Root>
    <Card.Header>
        <Card.Title>Stake</Card.Title>
    </Card.Header>
    <Card.Content>
        <div class="flex w-full flex-col gap-1.5">
            <div class="text-right text-sm text-grey-200">
                Balance: <span class="font-medium">0.001</span>
            </div>
            <div class="relative">
                <div class="absolute inset-y-0 left-0 flex items-center pl-3">
                    <img src="/tokens/token1.svg" alt="Icon" class="w-5 h-5" />
                </div>
                <Input type="text" id="to" class="pl-10 pr-14 w-full" />
                <div
                    class="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none"
                >
                    <span class="text-gray-400 text-sm">TOKEN1</span>
                </div>
            </div>

            <div class="flex flex-col py-6 px-3 space-y-4">
                <div class="text-gray-300">
                    <span class="font-medium mr-2">APR:</span> 10%
                </div>
                <div class="text-gray-300">
                    <span class="font-medium mr-2 uppercase">Staked:</span> 1 <span class="text-xs">{config.TOKEN_NAME}</span>
                </div>
                <div class="text-gray-300">
                    <span class="font-medium mr-2 uppercase">Reward:</span> 1 <span class="text-xs">{config.REWARD_TOKEN}</span>
                </div>
            </div>
        </div>
    </Card.Content>
    <Card.Footer class="w-full flex flex-col gap-1.5">
        <Button class="uppercase w-full">Stake</Button>
        <Button class="uppercase w-full">Withdraw</Button>
    </Card.Footer>
</Card.Root>
