<script lang="ts">
    import { browser } from '$app/environment';
    import { getKeysOfClientIdElastic, type clientIdElastic } from '$lib/elasticStruct';
    import { jsonElasticDataStore, timelineStore } from '$lib/store';
    
	let clientId = $jsonElasticDataStore.containerClientId.get('foagan') as clientIdElastic
	let keys = getKeysOfClientIdElastic()
	let timeline = $timelineStore

	function toDate(ts:number):string{
		let date = new Date(ts)
		return date.getDay()+'/'+(date.getMonth()+1)+'/'+date.getFullYear()+" "+date.getHours()+"h"
	}

</script>

<svelte:head>
	<title>Debug</title>
	<meta name="description" content="Keycloak demo app"/>
</svelte:head>

<section><h1>Debug</h1></section>

<content>

{#if browser}
	<table>
		<thead>
			<td>Date</td>
			{#each keys as key}
			<td>{key}</td>
			{/each}
		</thead>
		<tbody>
			{#each timeline.getTimestampsOfDay() as timestamp, i}
			<tr>
				<td>{toDate(timestamp)}</td>
			
				{#each keys as key}
				<td>{clientId[key][i]}</td>
				{/each}
			<tr>
			{/each}
		</tbody>
	</table>
{/if}
</content>

<style>
	table, td{
		border:1px #000
	}

</style>
