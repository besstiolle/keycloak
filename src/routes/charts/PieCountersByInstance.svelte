
<script lang="ts">
	import Chart from 'chart.js/auto';
	import { onMount } from 'svelte';
    export let countersByInstance:Map<string,number>
    export let countersByInstanceAndRoyaume:Map<string,Map<string, number>>

    const HTMLCanvasElementID = 'pieCountersByInstanceCanevas'
    const COLORS = [
                'rgba(71, 96, 136, %o)', 
                'rgba(255, 197, 98, %o)', 
                'rgba(255, 109, 116, %o)',
                'rgba(79, 221, 195, %o)',
                'rgba(97, 168, 232, %o)',
            ]
    const DATA = {
        labels: toFlatArray().labels,
        datasets: [{
                label: "ClientId de l'instance",
                data: Array.from(countersByInstance.keys()).map(row => countersByInstance.get(row)),
                backgroundColor: COLORS.map(color => color.replace('%o', '1')),
            },{
                label: "ClientId du royaume",
                data: toFlatArray().values,
                backgroundColor: toFlatArray().colors,
            }
        ]};

    function toFlatArray(){
        let values:number[] = []
        let labels:string[] = []
        let colors:string[] = []
        let currentColor:string
        let sizeOfRoyaume:number
        let opacity:number
        

        let j=0
        let k=1

        //Padding to fix multi series of pie Charts
        Array.from(countersByInstance.keys()).map(row => {
            labels.push(row + ' (' + (countersByInstance.get(row) as number) + ')')
        })
        Array.from(countersByInstance.keys()).map(() => values.push(0))
        Array.from(countersByInstance.keys()).map(() => colors.push("#000"))

        Array.from(countersByInstanceAndRoyaume.keys()).map(labelInstance => {
            
            currentColor = COLORS[j%COLORS.length]
            let counterByRoyaumeForInstance = countersByInstanceAndRoyaume.get(labelInstance)
            if(counterByRoyaumeForInstance){
                sizeOfRoyaume = counterByRoyaumeForInstance.size+1
                k=1
                Array.from(counterByRoyaumeForInstance.keys()).map(labelRoyaume => {
                    let value = counterByRoyaumeForInstance?.get(labelRoyaume)
                    if(value){
                        values.push(value)
                        labels.push(labelRoyaume + ' (' + value + ')')
                        opacity = Math.round(100/sizeOfRoyaume * k)/100
                        colors.push(currentColor.replace('%o', opacity+''))
                    }
                    k++
                })
            }
            j++
        })
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

<h2>Ratio des ClientsIds par instance et par royaume</h2>
<canvas id={HTMLCanvasElementID}></canvas>

<style>
</style>
