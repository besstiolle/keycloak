
<script lang="ts">
    import { DATA_TYPE, type dataset } from '$lib/elasticStruct';
	import Chart from 'chart.js/auto';
	import 'chartjs-adapter-luxon';
	import { onMount } from 'svelte';
	const DAY_OF_WEEK = ["Dimanche","Lundi","Mardi","Mercredi", "Jeudi", "Vendredi", "Samedi"]


	export let dataType:DATA_TYPE
    export let borneMin:number
    export let borneMax:number
	export let datasets:dataset[]	

    const HTMLCanvasElementID = 'lineCountersAllCanevas'+Math.round(Math.random()*1000)

	let labelsSource:dataset = {label:"", data: new Map<number, number>()}
	if(datasets.length >= 1){
		labelsSource = datasets[0]
	} 

    const DATA = {
        labels: Array.from(labelsSource.data.keys()).sort().map(row => getLabelValue(row)),
        datasets: datasets.map(dataset => {
			return {
				label: dataset.label,
				data: Array.from(dataset.data.keys()).sort().map(row => dataset.data.get(row) ),
				cubicInterpolationMode: 'monotone',
			}
		})
    }

	function getLabelValue(row:number){
		if(dataType == DATA_TYPE.SUM_BY_DAY_OF_WEEK){
			return DAY_OF_WEEK[row]
		}
	}
	
	function startChart(){
	//console.info("datasets > ", datasets)
		new Chart(
			document.getElementById(HTMLCanvasElementID) as HTMLCanvasElement,
			{
				type: 'line',
				options: {
					animation: {
						duration: 1000
					},
					scales: {
						x: {
							title: {
								display: true,
								text: 'Date'
							},
							ticks : {
								maxTicksLimit:10
							}
						},
						y: {
							//min: Math.round(borneMin / 1.1),
							min: 0,
							max: Math.round(borneMax * 1.1),
							title: {
								display: true,
								text: 'ClientIds'
							},
						}
					},
					
				},
				//@ts-ignore
				data:DATA
			}
		);
        (document.getElementById(HTMLCanvasElementID) as HTMLCanvasElement).classList.add('marginAuto')
	}

    //Starting graph as soon as the dom is rendered
	onMount(() => startChart())
	
</script>

<canvas id={HTMLCanvasElementID}></canvas>

<style>
</style>
