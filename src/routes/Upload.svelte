<script lang="ts">
    import type { commit, instance } from '$lib/gitStruct';
	import { jsonGitDataStore } from '$lib/store';
    import { parseLog } from './HydratationUtils';
    import UploadGeneric from './UploadGeneric.svelte';

    export let initiateBinder:Function
    //Type of file supported separated by a COMMA like .json,.jpeg,....
    const extensionAccepted = '.json'
	const invite:string = 'Choose a KeyCloak config json file'
	
	function customInitiator(fileName:string, contentFile:string){

        let instances:instance[] = []
    
        instances = JSON.parse(contentFile)

        instances.forEach(instance => {
            const parsedValues = parseLog(instance.log as string[])
            instance.commit = {
                author : parsedValues.author,
                message : parsedValues.message,
                hash : parsedValues.hash,
                ts : instance.ts as number
            }
            delete instance.ts
            delete instance.log
        });

        $jsonGitDataStore = instances

        initiateBinder()

	}

    function fixGit(instances:instance[]){
		
		//Fix pour les commits
		let commit:commit = {
			hash: 'x000',
			ts: 0,
			message: '',
			author: []
		}

		instances.forEach(instance => {
			instance.commit = commit
		});

		$jsonGitDataStore = instances
	}

</script>

<UploadGeneric initiateBinder={customInitiator} invite={invite} type={extensionAccepted} />