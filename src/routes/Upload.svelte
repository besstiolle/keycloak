<script lang="ts">
	import { jsonGitDataStore } from '$lib/store';
    import type { commit, instance } from '$lib/struct';
    import { parseLog } from './HydratationUtils';

    export let initiateBinder:Function
	let fileinput:HTMLInputElement
    

	const invite:string = 'Choose a KeyCloak config json file'
	
	const onFileSelected = (e:any)=>{
		let jsonFile = e.target.files[0];
		let reader = new FileReader();
        let instances:instance[] = []
		reader.readAsText(jsonFile);
		reader.onload = e => {
    
            instances = JSON.parse(e.target?.result as string)

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
		};
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


<div id="box" on:click={()=>{fileinput.click();}} on:keydown={()=>{fileinput.click();}}>
    <div><img src='./download.png' alt={invite} title={invite}/></div>
    <div>
        <input type="file" name="files[]" accept=".json" id="file" on:change={(e)=>onFileSelected(e)}  bind:this={fileinput} />
        <label for="file">{invite}</label>
    </div>
    <button type="submit">Upload</button>
</div>

<style>
    #box{
      min-height: 100%;
      font-size: 1.5rem;
      background-color: #c8dadf;
      position: relative;
      text-align:center;
      cursor: pointer;
      padding: 5%;
    }

    #box input,
    #box button{
        display: none;
    }
</style>
    