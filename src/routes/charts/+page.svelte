<script lang="ts">
    import { browser } from '$app/environment';
	import Chart from 'chart.js/auto';
	import 'chartjs-adapter-luxon';
	import { jsonDataStore } from '$lib/store';
    import type { commit } from '$lib/struct';
	import { onMount } from 'svelte';

	let allCommits:typeof commit[] = []

	
	function initiateJson(){
		
		let start = new Date()
		if($jsonDataStore.length > 100){
			allCommits = JSON.parse($jsonDataStore)
			
		}
		console.debug("initiateJson ended in " + ((new Date()).getMilliseconds() - start.getMilliseconds()) + "ms")
		prepareData()
	}
	

	let countersByTs = new Map<number,number>()
	let countersByTsMin = 100000000
	let countersByTsMax = 0
	const padL = (nr:number, len = 2, chr = `0`) => `${nr}`.padStart(2, chr);

	initiateJson();


	function formatDate(ts:number){
		const dt = new Date(ts*1000)
		return `${
			//dt.getFullYear()}/${
			padL(dt.getDate())}/${
			padL(dt.getMonth()+1)}  ${
			padL(dt.getHours())}:${
			padL(dt.getMinutes())}:${
			padL(dt.getSeconds())}`
	}

	function prepareData(){

		let countersByInstanceByTs = new Map<number,Map<string, number>>()
		let countersByInstance = new Map<string,number>()
		let counterByInstance:number

		countersByTs = new Map<number,number>()
		let counter:number

		allCommits.forEach(commit => {
			counter = 0
			countersByInstance = new Map<string,number>()
			commit.instances.forEach((instance) => {
				counterByInstance=0
				instance.royaumes.forEach((royaume) => {
					royaume.clientIds.forEach((clientId) => {
						counterByInstance++
						counter++
					})
				})
				countersByInstance.set(instance.label, counterByInstance)
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
	
	function startChart(st?:string){
		new Chart(
			document.getElementById('acquisitions') as HTMLCanvasElement,
			{
				type: 'line',
				
				options: {
					animation: {
						duration: 0
					},
					plugins: {
						title: {
							display: true,
							text: 'Evolution des clientsIds'
						}
					},
					scales: {
						x: {
							type: 'time',
							time: {
								// Luxon format string
								tooltipFormat: 'DD T'
							},
							title: {
								display: true,
								text: 'Date'
							},
							ticks : {
								maxTicksLimit:10
							}
						},
						y: {
							min: Math.round(countersByTsMin / 1.1),
							max: Math.round(countersByTsMax * 1.1),
						}
					},
					
				},
				data: {
					labels: Array.from(countersByTs.keys()).sort().map(row => row * 1000),
					datasets: [
					{
						label: 'ClientIds',
						//data: Array.from(countersByTs.keys()).sort().map(row => {x:formatDate(row);y:countersByTs.get(row)} )
						data: Array.from(countersByTs.keys()).sort().map(row => countersByTs.get(row) )
					}
					]
				}
			}
		);
		
	}

	onMount(() => startChart())
	
</script>

<svelte:head>
	<title>Keycloak Charts</title>
	<meta name="description" content="Keycloak demo app"/> 
</svelte:head>


<section><h1>Charts (in progress)</h1></section>

<div class="chart-container">
	<canvas id="acquisitions"></canvas>
</div>

<style>
.chart-container{
	height: 60vh;
	width: 60vw;
	position: relative
}
</style>
