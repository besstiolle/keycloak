<script lang="ts">
    import { Timeline } from "$lib/Timeline.class";
    import type { MasterExport } from "$lib/configStruct";
    import { JSON_CONFIG_DATA, JSON_ELASTIC_DATA, JSON_GIT_DATA } from "$lib/localStorageUtils";
    import { jsonConfigDataStore, jsonElasticDataStore, jsonGitDataStore, timelineStore } from "$lib/store";
    import UploadGeneric from "../UploadGeneric.svelte";
    import { refreshEnrichedData } from "../elastic/enrichedDataFactory";
    import { fromJsonToElasticStore } from "../elastic/jsonParser";


    export let initiateBinder:Function
    //Type of file supported separated by a COMMA like .json,.jpeg,....
    const extensionAccepted = '.json'
	const invite:string = 'Choose a global Json exported file'
    
	function customInitiator(fileName:string, contentFile:string){
        let json = contentFile
        let master:MasterExport = JSON.parse(json)
        //Controle
        if(master.version !== 2){
            console.error("not a supported backup")
        } else {
            localStorage.setItem(JSON_GIT_DATA, master.gitData)
            localStorage.setItem(JSON_CONFIG_DATA, master.configData)
            localStorage.setItem(JSON_ELASTIC_DATA, master.elasticData)

            //Refresh store
            $jsonElasticDataStore = fromJsonToElasticStore(JSON.parse(master.elasticData))
            $timelineStore = new Timeline($jsonElasticDataStore.minDate, $jsonElasticDataStore.maxDate)
            $jsonGitDataStore = JSON.parse(master.gitData)
            $jsonConfigDataStore = master.configData

            refreshEnrichedData($jsonElasticDataStore, $timelineStore)
        }

        initiateBinder()
	}
</script>

<UploadGeneric initiateBinder={customInitiator} invite={invite} type={extensionAccepted} />