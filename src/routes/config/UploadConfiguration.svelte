<script lang="ts">
    import type { MasterExport } from "$lib/configStruct";
    import { JSON_CONFIG_DATA, JSON_ELASTIC_DATA, JSON_GIT_DATA } from "$lib/localStorageUtils";
    import UploadGeneric from "../UploadGeneric.svelte";


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
        }

        initiateBinder()
	}
</script>

<UploadGeneric initiateBinder={customInitiator} invite={invite} type={extensionAccepted} />