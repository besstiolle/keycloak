<script lang="ts">
    import { browser } from '$app/environment';
	import { jsonGitDataStore } from '$lib/store';
    import type { commit, instance } from '$lib/struct';
    import Upload from '../Upload.svelte';
    import PieCountersByInstance from './PieCountersByInstance.svelte';

	let instances:instance[] = []

	
	function initiateJson(){
		if(!browser){
			return
		}

		let start = new Date()
		if($jsonGitDataStore.length > 0){
			//Proper cloning
			instances = structuredClone($jsonGitDataStore)
			
			prepareDataForPie()
		}
		console.debug("initiateJson ended in " + ((new Date()).getMilliseconds() - start.getMilliseconds()) + "ms")
	}
	
	let countersByInstance = new Map<string,number>()
	let countersByInstanceAndRoyaume = new Map<string,Map<string, number>>()

	
	function prepareDataForPie(){
		
		let countersByRoyaumeForInstance = new Map<string, number>()
		let counterByInstance:number
		let counterByRoyaumeForInstance:number

		let counter:number
		counter = 0
		countersByInstance = new Map<string,number>()
		instances.forEach((instance) => {
			counterByInstance=0
			countersByRoyaumeForInstance = new Map<string, number>()
			instance.royaumes.forEach((royaume) => {
				counterByRoyaumeForInstance = 0
				if(royaume.clientIds){
					royaume.clientIds.forEach(() => {
						counterByInstance++
						counterByRoyaumeForInstance++
						counter++
					})
				}
				countersByRoyaumeForInstance.set(royaume.label,counterByRoyaumeForInstance)
			})
			countersByInstance.set(instance.label, counterByInstance)
			countersByInstanceAndRoyaume.set(instance.label, countersByRoyaumeForInstance)
		
		});
		
	}
	
	// start scripting
	initiateJson();
</script>

<svelte:head>
	<title>Keycloak Charts</title>
	<meta name="description" content="Keycloak demo app"/> 
</svelte:head>


<section><h1>Charts</h1></section>

{#if browser}
	{#if $jsonGitDataStore}
		<div class="chart-container">
			<PieCountersByInstance countersByInstance={countersByInstance} countersByInstanceAndRoyaume={countersByInstanceAndRoyaume}/>
		</div>
	{:else}
		<Upload initiateBinder={initiateJson}/>
	{/if}
{/if}

<style>
.chart-container{
	height: 80vh;
	width: 100%;
	margin-bottom: 20vh;
}
:global(.marginAuto){
	margin:auto;
}
</style>
