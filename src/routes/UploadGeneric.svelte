<script lang="ts">

	let fileinput:HTMLInputElement
    export let initiateBinder:Function
	export let invite:string = ''
    export let type:string = ''
	
	const onFileSelected = (e:any)=>{
		let filePassed = e.target.files[0];
		let reader = new FileReader();
		reader.readAsText(filePassed);
		reader.onload = eRead => {
            initiateBinder(filePassed.name, eRead.target?.result as string)
		};
	}
</script>


<div id="box" on:click={()=>{fileinput.click();}} on:keydown={()=>{fileinput.click();}}>
    <div><img src='./download.png' alt={invite} title={invite}/></div>
    <div>
        <input type="file" name="files[]" accept="{type}" id="file" on:change={(e)=>onFileSelected(e)}  bind:this={fileinput} />
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
    