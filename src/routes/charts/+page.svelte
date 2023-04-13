<script lang="ts">
	import { jsonDataStore } from '$lib/store';
    import type { commit } from '$lib/struct';
    import LineCountersAll from './LineCountersAll.svelte';
    import PieCountersByInstance from './PieCountersByInstance.svelte';

	let allCommits:typeof commit[] = []

	
	function initiateJson(){
		
		let start = new Date()
		if($jsonDataStore.length > 100){
			allCommits = JSON.parse($jsonDataStore)
			
		}
		console.debug("initiateJson ended in " + ((new Date()).getMilliseconds() - start.getMilliseconds()) + "ms")
		prepareData()
	}
	
	let countersByInstance = new Map<string,number>()
	let countersByInstanceAndRoyaume = new Map<string,Map<string, number>>()
	let countersByTs = new Map<number,number>()
	let countersByTsMin = 100000000
	let countersByTsMax = 0

	initiateJson();

	function prepareData(){
		
		let countersByInstanceByTs = new Map<number,Map<string, number>>()
		let countersByRoyaumeForInstance = new Map<string, number>()
		let counterByInstance:number
		let counterByRoyaumeForInstance:number

		countersByTs = new Map<number,number>()
		let counter:number

		allCommits.forEach(commit => {
			counter = 0
			countersByInstance = new Map<string,number>()
			commit.instances.forEach((instance) => {
				counterByInstance=0
				countersByRoyaumeForInstance = new Map<string, number>()
				instance.royaumes.forEach((royaume) => {
					counterByRoyaumeForInstance = 0
					royaume.clientIds.forEach((clientId) => {
						counterByInstance++
						counterByRoyaumeForInstance++
						counter++
					})
					countersByRoyaumeForInstance.set(royaume.label,counterByRoyaumeForInstance)
				})
				countersByInstance.set(instance.label, counterByInstance)
				countersByInstanceAndRoyaume.set(instance.label, countersByRoyaumeForInstance)
			})
			countersByInstanceByTs.set(commit.ts, countersByInstance)
			countersByTs.set(commit.ts, counter)
			if(counter < countersByTsMin){
				countersByTsMin = counter
			}
			if(counter > countersByTsMax){
				countersByTsMax = counter
			}
		});
		
	}
	
</script>

<svelte:head>
	<title>Keycloak Charts</title>
	<meta name="description" content="Keycloak demo app"/> 
</svelte:head>


<section><h1>Charts</h1></section>

<div class="chart-container">
	<LineCountersAll countersByTs={countersByTs} countersByTsMin={countersByTsMin} countersByTsMax={countersByTsMax}/>
</div>
<div class="chart-container">
	<PieCountersByInstance countersByInstance={countersByInstance} countersByInstanceAndRoyaume={countersByInstanceAndRoyaume}/>
</div>

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
