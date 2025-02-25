<script>
    import * as Card from "$lib/components/ui/card";
    import CircleDollarSign from "lucide-svelte/icons/circle-dollar-sign";
    import Tractor from "lucide-svelte/icons/tractor";
    import Percent from "lucide-svelte/icons/percent";
    import ChartPie from "lucide-svelte/icons/chart-pie";
</script>

<Card.Root class="text-white">
    <Card.Header class="flex flex-row items-center justify-between space-y-0 pb-2">
        <Card.Title class="font-medium text-sm">Price</Card.Title>
        <CircleDollarSign class="h-6 w-6" />
    </Card.Header>
    <Card.Content>
        <div class="text-2xl font-bold">$0.01</div>
    </Card.Content>
</Card.Root>

<Card.Root class="text-white">
    <Card.Header class="flex flex-row items-center justify-between space-y-0 pb-2">
        <Card.Title class="font-medium text-sm">Staked</Card.Title>
        <Tractor class="h-6 w-6" />
    </Card.Header>
    <Card.Content>
        <div class="text-2xl font-bold">10,553,211</div>
    </Card.Content>
</Card.Root>

<Card.Root class="text-white">
    <Card.Header class="flex flex-row items-center justify-between space-y-0 pb-2">
        <Card.Title class="font-medium text-sm">APR</Card.Title>
        <Percent class="h-6 w-6" />
    </Card.Header>
    <Card.Content>
        <div class="text-2xl font-bold">5%</div>
    </Card.Content>
</Card.Root>

<Card.Root class="text-white">
    <Card.Header class="flex flex-row items-center justify-between space-y-0 pb-2">
        <Card.Title class="font-medium text-sm">Tax</Card.Title>
        <ChartPie class="h-6 w-6" />
    </Card.Header>
    <Card.Content>
        <div class="text-2xl font-bold">5%</div>
    </Card.Content>
</Card.Root>