<script lang="ts">
    import type { MasterExport } from "$lib/configStruct";
    import { JSON_CONFIG_DATA, JSON_ELASTIC_DATA, JSON_GIT_DATA } from "$lib/localStorageUtils";


    export let initiateBinder:Function
    //Type of file supported separated by a COMMA like .json,.jpeg,....
    export let extensionAccepted:string 

	let fileinput:HTMLInputElement
	const invite:string = 'Choose a localStorage json file'
	
	const onFileSelected = (e:any)=>{


		let jsonFile = e.target.files[0];
		let reader = new FileReader();
		reader.readAsText(jsonFile);
		reader.onload = e => {
            
            let json = e.target?.result as string
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
		};
	}
</script>


<div id="box" on:click={()=>{fileinput.click();}} on:keydown={()=>{fileinput.click();}}>
    <div><img src='./download.png' alt={invite} title={invite}/></div>
    <div>
        <input type="file" name="files[]" accept={extensionAccepted} id="file" on:change={(e)=>onFileSelected(e)}  bind:this={fileinput} />
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
    