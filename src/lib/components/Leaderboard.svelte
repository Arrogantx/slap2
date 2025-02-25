<script>
    import * as Card from "$lib/components/ui/card";
    import * as Table from "$lib/components/ui/table";
</script>

<Card.Root class="w-full">
    <Card.Header>
        <Card.Title>Leaderboard</Card.Title>
        <Card.Description>Get your slaps up</Card.Description>
    </Card.Header>
    <Card.Content>
        <Table.Root>
            <Table.Header>
                <Table.Row class="bg-primary hover:bg-primary">
                    <Table.Head class="text-white font-semibold">Slappee</Table.Head>
                    <Table.Head class="text-white font-semibold">Slaps</Table.Head>
                </Table.Row>
            </Table.Header>
            <Table.Body>
                <Table.Row>
                    <Table.Cell>Player Address</Table.Cell>
                    <Table.Cell>8,400 SLAPS</Table.Cell>
                </Table.Row>
                <Table.Row class="bg-muted">
                    <Table.Cell>Player Address</Table.Cell>
                    <Table.Cell>8,400 SLAPS</Table.Cell>
                </Table.Row>
            </Table.Body>
        </Table.Root>
    </Card.Content>
</Card.Root>