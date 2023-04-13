
<script lang="ts">
	import Chart from 'chart.js/auto';
	import 'chartjs-adapter-luxon';
	import { onMount } from 'svelte';

    export let countersByTsMin:number
    export let countersByTsMax:number
    export let countersByTs:Map<number,number>
    const HTMLCanvasElementID = 'lineCountersAllCanevas'

    const DATA = {
        labels: Array.from(countersByTs.keys()).sort().map(row => row * 1000),
        datasets: [{
            label: 'Toutes instances confondues',
            data: Array.from(countersByTs.keys()).sort().map(row => countersByTs.get(row) )
        }]
    }

	
	function startChart(){
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
							min: Math.round(countersByTsMin / 1.1),
							max: Math.round(countersByTsMax * 1.1),
							title: {
								display: true,
								text: 'ClientIds'
							},
						}
					},
					
				},
				data:DATA
			}
		);
        (document.getElementById(HTMLCanvasElementID) as HTMLCanvasElement).classList.add('marginAuto')
	}

    //Starting graph as soon as the dom is rendered
	onMount(() => startChart())
	
</script>
<h2>Evolution des ClientsIds dans le temps</h2>
<canvas id={HTMLCanvasElementID}></canvas>

<style>
</style>
