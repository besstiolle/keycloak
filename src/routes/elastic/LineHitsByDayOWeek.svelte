
<script lang="ts">
	import Chart from 'chart.js/auto';
	import 'chartjs-adapter-luxon';
	import { onMount } from 'svelte';
    import { DATA_TYPE } from './sideStateFactory';
    import type { DatasetAndLimitsForLine } from '$lib/elasticStruct';
	const DAY_OF_WEEK = ["Dimanche","Lundi","Mardi","Mercredi", "Jeudi", "Vendredi", "Samedi"]

	export let datasetAndLimits:DatasetAndLimitsForLine
	export let dataType:DATA_TYPE

    const HTMLCanvasElementID = 'lineCountersAllCanevas'+Math.round(Math.random()*1000)

	let labels:number[] = []
	let allInOn:number[] = []
	if(datasetAndLimits.labelsAndDatasets.length >= 1){
		datasetAndLimits.labelsAndDatasets.forEach(array => {
			allInOn = allInOn.concat(Array.from(array.data.keys()))
		});
		labels = [...new Set<number>(allInOn)].sort()
	} 

    const DATA = {
		labels: labels.map(row => getLabelValue(row)),
        datasets: datasetAndLimits.labelsAndDatasets.map(dataset => {
			return {
				label: dataset.label,
				data: labels.map(
						row => dataset.data.get(row)?dataset.data.get(row):0 ),
				cubicInterpolationMode: 'monotone',
			}
		})
    }

	function getLabelValue(row:number){
		if(dataType == DATA_TYPE.SUM_BY_DAY_OF_WEEK || dataType == DATA_TYPE.AVG_BY_DAY_OF_WEEK){
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
							max: Math.round(datasetAndLimits.max * 1.1),
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
