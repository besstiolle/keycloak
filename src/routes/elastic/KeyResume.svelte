
<script lang="ts">
    import type { datasetTableurHit } from '$lib/elasticStruct';
    
	export let datasets:datasetTableurHit[]	
    export let borneMin:Date
    export let borneMax:Date

    let cpt30 = new Map<String, number>()
    let cpt60 = new Map<String, number>()
    let cptAll = new Map<String, number>()

    let sumcpt30 = 0
    let sumcpt60 = 0
    let sumcptAll = 0
   
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
                    if(!cpt30.has(clientId.instance)) {
                        cpt30.set(clientId.instance, 1)
                    } else {
                        cpt30.set(clientId.instance, cpt30.get(clientId.instance) as number + 1)
                    }
                    sumcpt30++
                }
                if(last !== null && last > j60){
                    if(!cpt60.has(clientId.instance)) {
                        cpt60.set(clientId.instance, 1)
                    } else {
                        cpt60.set(clientId.instance, cpt60.get(clientId.instance) as number + 1)
                    }
                    sumcpt60++
                }
                if(!cptAll.has(clientId.instance)) {
                    cptAll.set(clientId.instance, 1)
                } else {
                    cptAll.set(clientId.instance, cptAll.get(clientId.instance) as number + 1)
                }
                sumcptAll++
            }
        });

    }

    //cpt30.

    init()

    

</script>

<p>Ces 30 derniers jours il y a eu <b>{sumcpt30} client-Id</b> identifiés sur la plateforme. Dont : </p>
<ul>
    {#each [... cpt30.keys()] as key}
    <li><b>{cpt30.get(key)}</b> client-Id pour <b>{key}</b></li>
    {/each}
</ul>
<p>Ces 60 derniers jours il y a eu <b>{sumcpt60} client-Id</b> identifiés sur la plateforme</p>
<ul>
    {#each [... cpt60.keys()] as key}
    <li><b>{cpt60.get(key)}</b> client-Id pour <b>{key}</b></li>
    {/each}
</ul>
<p>Depuis le début il y a eu <b>{sumcptAll} client-Id</b> identifiés sur la plateforme</p>
<ul>
    {#each [... cptAll.keys()] as key}
    <li><b>{cptAll.get(key)}</b> client-Id pour <b>{key}</b></li>
    {/each}
</ul>


<style>
   
</style>
