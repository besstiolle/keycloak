<script lang="ts">

    import { onMount } from 'svelte';

	let fileinput:HTMLInputElement
    export let initiateBinder:Function
    export let endingBinder:Function = function(){}
	export let invite:string = ''
    export let type:string = ''
	
    function readFile(filePassed:File):Promise<boolean>{
        return new Promise((resolve, reject) => {
            let reader = new FileReader()
            reader.readAsText(filePassed)
            reader.onload = eRead => {
                initiateBinder(filePassed.name, eRead.target?.result as string)
                resolve(true)
            }
            reader.onerror = function(e: any) {
                reject(e);
            }
        })
    }

    function readFiles(filesPassed:FileList, i:number=0){
        if(i >= filesPassed.length){
            endingBinder()
            return
        }
        readFile(filesPassed[i]).then(()=>{
            i++
            readFiles(filesPassed, i)
        })
        
    }

    onMount(async () => {
        let isAdvancedUpload = function() {
            let div = document.createElement('div');
            return (('draggable' in div) || ('ondragstart' in div && 'ondrop' in div)) && 'FormData' in window && 'FileReader' in window;
        }();

        let formElement = document.getElementById('box') as HTMLElement
        if (isAdvancedUpload) {
            formElement.classList.add('has-advanced-upload');

            let funcDrag = function(e:Event) {
                e.preventDefault();
                e.stopPropagation();
            }
            let funcDragOver = function(e:Event) {
                formElement.classList.add('is-dragover');
            }
            let funcDragLeave = function(e:Event) {
                formElement.classList.remove('is-dragover');
            }

            formElement.addEventListener('drag', funcDrag)
            formElement.addEventListener('dragstart', funcDrag)
            formElement.addEventListener('dragend', funcDrag)
            formElement.addEventListener('dragover', funcDrag)
            formElement.addEventListener('dragenter', funcDrag)
            formElement.addEventListener('dragleave', funcDrag)
            formElement.addEventListener('drop', funcDrag)

            formElement.addEventListener('dragover', funcDragOver)
            formElement.addEventListener('dragenter', funcDragOver)

            formElement.addEventListener('dragleave', funcDragLeave)
            formElement.addEventListener('dragend', funcDragLeave)
            formElement.addEventListener('drop', funcDragLeave)

            
            function onChange(event:Event) {
                let htmlElement = event.target as HTMLInputElement
                if(htmlElement.files){
                    readFiles(htmlElement.files)
                }
            }

            function onDrop(event:DragEvent ) {
                if(event.dataTransfer){
                    readFiles(event.dataTransfer.files)
                }
            }        
            (document.getElementById('file') as HTMLElement).addEventListener('change', onChange);
            formElement.addEventListener('drop', onDrop);
        }
    })
</script>

<div id="box" on:click={()=>{fileinput.click();}} on:keydown={()=>{fileinput.click();}}>
    <div><img src='./download.png' alt={invite} title={invite}/></div>
    <div>
        <input type="file" name="files[]" accept="{type}" id="file" multiple bind:this={fileinput} />
        <label for="file">{invite}</label>
    </div>
    <button type="submit">Upload</button>
</div>

<style>
  
    :global(#box.has-advanced-upload) {
        -webkit-transition: outline-offset .15s ease-in-out, background-color .15s linear !important;
        transition: outline-offset .15s ease-in-out, background-color .15s linear !important;
    }

    :global(#box.is-dragover) {
        background-color: grey !important;
    }

    #box{
      min-height: 100%;
      font-size: 1.5rem;
      background-color: #c8dadf;
      position: relative;
      text-align:center;
      cursor: pointer;
      padding: 5%;
      border: 3px dotted #c8dadf;
    }

    #box input,
    #box button{
        display: none;
    }
</style>
    