
<script lang="ts">
    import type { LabelAndDatasetString } from '$lib/elasticStruct';
	import Chart from 'chart.js/auto';
	import { onMount } from 'svelte';
    
	export let datasets:LabelAndDatasetString[]	
    let countersByError:Map<string, number> = datasets[0].data
   // export let countersByInstanceAndRoyaume:Map<string,Map<string, number>>

    const HTMLCanvasElementID = 'pieCountersByErrors'+Math.round(Math.random()*1000)
    const COLORS = [
                'rgba(71, 96, 136, %o)', 
                'rgba(255, 197, 98, %o)', 
                'rgba(255, 109, 116, %o)',
                'rgba(79, 221, 195, %o)',
                'rgba(97, 168, 232, %o)',
                'rgb(106, 100, 90, %o)',
                'rgba(227, 205, 139, %o)',
                'rgb(93, 112, 82, %o)',
                'rgb(193, 136, 69, %o)',
                'rgba(240, 190, 134, %o)',
                'rgba(249, 150, 139, 1)',
                'rgba(242, 116, 56, 1)',
                'rgba(38, 71, 78, 1)',
                'rgba(118, 205, 205, 1)',
                'rgba(44, 206, 210, 1)',
            ]
    const FLAT_DATA = toFlatArray()
    const DATA = {
        labels: FLAT_DATA.labels,
        datasets: [{
                label: datasets[0].label,
                data: FLAT_DATA.values,
                backgroundColor: FLAT_DATA.colors,
            }
        ]};

    function toFlatArray(){
        let values:number[] = []
        let labels:string[] = []
        let colors:string[] = []
    
        let j=0
        Array.from(countersByError.keys()).map(typeError => {
            labels.push(typeError + ' (' + countersByError.get(typeError) + ')')
            colors.push(COLORS[j%COLORS.length].replace('%o', '1'))
            values.push(countersByError.get(typeError) as number)
            j++
        })

        //reduce to top 10
        let minValue = 0
        let minValuePosition = -1
        let i = 0
        while(values.length > 10){
            minValue = 999999
            minValuePosition = -1
            for(i=0; i<values.length; i++){
                if(values[i] < minValue) {
                    minValue = values[i]
                    minValuePosition = i
                }
            }

            //remove minimal value
            values.splice(minValuePosition,1)
            labels.splice(minValuePosition,1)
            colors.splice(10,100)
        }

        return {values:values, labels:labels, colors:colors}
    }

	function startChart(){
		new Chart(
			document.getElementById(HTMLCanvasElementID) as HTMLCanvasElement,
			{
				type: 'doughnut',
				options: {
					animation: {
						duration: 1000
					},
					plugins: {
						legend: {
                            position: 'right',
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

<canvas id={HTMLCanvasElementID}></canvas>

<style>
</style>
