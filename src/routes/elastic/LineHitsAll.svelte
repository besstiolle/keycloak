
<script lang="ts">
    import type { DatasetAndLimitsForLine, LabelAndDataset } from '$lib/elasticStruct';
	import Chart from 'chart.js/auto';
	import 'chartjs-adapter-luxon';
	import { onMount } from 'svelte';
	
	export let datasetAndLimits:DatasetAndLimitsForLine

    const HTMLCanvasElementID = 'lineCountersAllCanevas'+Math.round(Math.random()*1000)

	let labelsSource:LabelAndDataset = {label:"", data: new Map<number, number>()}
	if(datasetAndLimits.labelsAndDatasets.length >= 1){
		labelsSource = datasetAndLimits.labelsAndDatasets[0]
	} 

    const DATA = {
        labels: Array.from(labelsSource.data.keys()).sort().map(row => row),
        datasets: datasetAndLimits.labelsAndDatasets.map(dataset => {
			return {
				label: dataset.label,
				data: Array.from(dataset.data.keys()).sort().map(row => dataset.data.get(row) ),
				cubicInterpolationMode: 'monotone',
			}
		})
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
