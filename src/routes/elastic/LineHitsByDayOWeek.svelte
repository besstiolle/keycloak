
<script lang="ts">
    import { DATA_TYPE, type DatasetAndLimitsForLine, type LabelAndDataset} from '$lib/elasticStruct';
	import Chart from 'chart.js/auto';
	import 'chartjs-adapter-luxon';
	import { onMount } from 'svelte';
	const DAY_OF_WEEK = ["Dimanche","Lundi","Mardi","Mercredi", "Jeudi", "Vendredi", "Samedi"]

	export let datasetAndLimits:DatasetAndLimitsForLine
	export let dataType:DATA_TYPE

    const HTMLCanvasElementID = 'lineCountersAllCanevas'+Math.round(Math.random()*1000)

	let labelsSource:LabelAndDataset = {label:"", data: new Map<number, number>(),weight:0}
		if(datasetAndLimits.labelsAndDatasets.length >= 1){
		labelsSource = datasetAndLimits.labelsAndDatasets[0]
	} 

    const DATA = {
        labels: Array.from(labelsSource.data.keys()).sort().map(row => getLabelValue(row)),
        datasets: datasetAndLimits.labelsAndDatasets.map(dataset => {
			return {
				label: dataset.label,
				data: Array.from(labelsSource.data.keys()).sort().map(
						row => 
							dataset.data.get(row)?dataset.data.get(row):0 ),
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
