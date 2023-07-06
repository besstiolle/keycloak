<script lang="ts">
	import { jsonGitDataStore } from '$lib/store';
    import type { commit } from '$lib/struct';

    export let initiateBinder:Function
	let fileinput:HTMLInputElement
    

	const invite:string = 'Choose a KeyCloak config json file'
	
	const onFileSelected = (e:any)=>{
		let jsonFile = e.target.files[0];
		let reader = new FileReader();
		reader.readAsText(jsonFile);
		reader.onload = e => {
            
            $jsonGitDataStore = JSON.parse(e.target?.result as string)
            
            initiateBinder()
		};
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
    