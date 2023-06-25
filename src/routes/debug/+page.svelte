<script lang="ts">
    import { browser } from '$app/environment';
    import { jsonElasticDataStore } from '$lib/store';



	let start = new Date(2023,3,1)
	let end = new Date(2023,4,1)
	let data = $jsonElasticDataStore.container.get("foagan")?.LOGIN[2023][4]
	let titles:Date[] = []

	while(start < end){
		titles.push(new Date(start))
		start.setHours(start.getHours() + 3)
	}

	console.info(data)

	const padL = (nr:number, len = 2, chr = `0`) => `${nr}`.padStart(2, chr);
	function toString(dt:Date){
		return `${
			dt.getDate()}/${
			dt.getMonth()+1} ${
			dt.getHours()}h`
	}


</script>

<svelte:head>
	<title>Debug</title>
	<meta name="description" content="Keycloak demo app"/>
</svelte:head>

<section><h1>Elastic</h1></section>

<content>

{#if browser}
<table>
<thead>
	<tr>
		<td></td><td></td><td></td><td></td>
		<td></td><td></td><td></td><td></td>
		{#each titles as title}
		<td>{toString(title)}</td>
		{/each}
	</tr>
</thead>
<tbody>
	<tr>
		{#each data as entry}
			{#if entry != undefined}
				{#each entry as hours}
					{#if hours != undefined}
						<td>{hours}</td>
					{:else}
						<td>X</td>
					{/if}
				{/each}
				{#if entry.length == 7}<td>0</td>{/if}
				{#if entry.length == 6}<td>0</td><td>0</td>{/if}
				{#if entry.length == 5}<td>0</td><td>0</td><td>0</td>{/if}
				{#if entry.length == 4}<td>0</td><td>0</td><td>0</td><td>0</td>{/if}
				{#if entry.length == 3}<td>0</td><td>0</td><td>0</td><td>0</td><td>0</td>{/if}
			{:else}
			<td>-</td><td>-</td><td>-</td><td>-</td>
			<td>0</td><td>0</td><td>0</td><td>0</td>
			{/if}
		{/each}
	</tr>
</tbody>
</table>

{/if}
</content>

<style>

</style>
