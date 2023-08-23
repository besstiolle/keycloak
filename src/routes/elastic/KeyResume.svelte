
<script lang="ts">
    import type { datasetTableurHit } from "./datasetFactory";

    
	export let datasets:datasetTableurHit[]	
    export let borneMin:Date
    export let borneMax:Date

    let cpt30 = new Map<String, number>()
    let cpt60 = new Map<String, number>()
    let cptAll = new Map<String, number>()
    let cpt30_smell = new Map<String, number>()
    let cpt60_smell = new Map<String, number>()
    let cptAll_smell = new Map<String, number>()

    let sumcpt30 = 0
    let sumcpt60 = 0
    let sumcptAll = 0

    let sumcpt30_smell = 0
    let sumcpt60_smell = 0
    let sumcptAll_smell = 0
   
    function init(){
        borneMax.setHours(0)
        let j30 = new Date(borneMax)
        let j60 = new Date(borneMax)
        j30.setDate(j30.getDate() - 30)
        j60.setDate(j60.getDate() - 60)
        if(j30 < borneMin){
            j30 = borneMin
        }
        if(j60 < borneMin){
            j60 = borneMin
        }

        let last:Date
        datasets.forEach(clientId => {
            if(clientId.lastSeen !== null){
                last = new Date(clientId.lastSeen)
                last.setHours(0)

                if(last !== null && last > j30){
                    addToMap(cpt30, clientId.instance)
                    sumcpt30++
                    if(!clientId.isKnown){
                        addToMap(cpt30_smell, clientId.instance)
                        sumcpt30_smell++
                    }
                }
                if(last !== null && last > j60){
                    addToMap(cpt60, clientId.instance)
                    sumcpt60++
                    if(!clientId.isKnown){
                        addToMap(cpt60_smell, clientId.instance)
                        sumcpt60_smell++
                    }
                }
                addToMap(cptAll, clientId.instance)
                sumcptAll++
                if(!clientId.isKnown){
                    addToMap(cptAll_smell, clientId.instance)
                    sumcptAll_smell++
                }
            }
        });

    }

    function addToMap(map:Map<String, number>, key:string, value:number = 1):Map<String, number>{
        if(!map.has(key)) {
            map.set(key, value)
        } else {
            map.set(key, map.get(key) as number + value)
        }
        return map
    }

    //cpt30.

    init()

    

</script>

<p>Ces 30 derniers jours il y a eu <b>{sumcpt30} client-Id</b> identifiés sur la plateforme ({sumcpt30_smell} ☣️). Dont : </p>
<ul>
    {#each [... cpt30.keys()] as key}
    <li><b>{cpt30.get(key)}</b> client-Id pour <b>{key}</b> ({cpt30_smell.get(key)} ☣️).</li>
    {/each}
</ul>
<p>Ces 60 derniers jours il y a eu <b>{sumcpt60} client-Id</b> identifiés sur la plateforme ({sumcpt60_smell} ☣️).</p>
<ul>
    {#each [... cpt60.keys()] as key}
    <li><b>{cpt60.get(key)}</b> client-Id pour <b>{key}</b> ({cpt60_smell.get(key)} ☣️).</li>
    {/each}
</ul>
<p>Depuis le début il y a eu <b>{sumcptAll} client-Id</b> identifiés sur la plateforme ({sumcptAll_smell} ☣️).</p>
<ul>
    {#each [... cptAll.keys()] as key}
    <li><b>{cptAll.get(key)}</b> client-Id pour <b>{key}</b> ({cptAll_smell.get(key)} ☣️).</li>
    {/each}
</ul>


<style>
   
</style>
