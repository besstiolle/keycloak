<script lang="ts">
    import { browser } from '$app/environment';
    import { jsonConfigDataStore } from '$lib/store';
    import { getConfigValue } from '../HydratationUtils';
    import UploadConfiguration from './UploadConfiguration.svelte';
	
	let addAnother = false

    let gitUrl1:string = ''
    let gitUrl2:string = ''

    function init(){
        if(!browser){return}

        let config = getConfigValue($jsonConfigDataStore)
        
        gitUrl1 = config.gitUrl1
        gitUrl2 = config.gitUrl2
    }


    function save(){
        jsonConfigDataStore.set(JSON.stringify({
            gitUrl1:gitUrl1,
            gitUrl2:gitUrl2
        }))
    }

    function download(){
        let master = {
            version:1,
            jsonData:localStorage.getItem("jsonData") || '',
            jsonHashNodeData:localStorage.getItem("jsonHashNodeData") || '',
            jsonConfigData:localStorage.getItem("jsonConfigData") || '',
            jsonElasticData:localStorage.getItem("jsonElasticData") || '',
        }
        let blob = new Blob([JSON.stringify(master)], {
            type: 'text/plain'
        });
        var url = URL.createObjectURL(blob)
        var downloadLink = document.createElement("a")
        downloadLink.href = url
        downloadLink.download = 'masterLocalStorage'
                                + '_' 
                                + toYYYYMMDD_hhmm(new Date()) 
                                + '.json'
        document.body.appendChild(downloadLink)
        downloadLink.click()
        document.body.removeChild(downloadLink) 
    }

    /**
     * Return the date to a string validating the format YYYYMMDD_HHmm
     * @param date the date to parse into a ISO date format YYYYMMDD_HHmm
     * @returns string the format YYYYMMDD_HHmm
     */
     export function toYYYYMMDD_hhmm(date:Date):string{
        return date.getFullYear().toString().padStart(4, '0')
            + (date.getMonth()+1).toString().padStart(2, '0')
            + date.getDate().toString().padStart(2, '0')
            + '_'
            + date.getHours().toString().padStart(2, '0')
            + date.getMinutes().toString().padStart(2, '0')
    }
    
    function initiateVoid(){
        addAnother = false
    }
    
    init()
</script>

<svelte:head>
	<title>Keycloak Config</title>
	<meta name="description" content="Keycloak demo app"/> 
</svelte:head>

<section><h1>Config</h1></section>
{#if addAnother}
<UploadConfiguration initiateBinder={initiateVoid} extensionAccepted='.json'/>
{:else}
<content>
    <label for='gitUrl1'>link to custom commit -using %hash%-</label>
    <input id='gitUrl1' type='text' class='form' bind:value={gitUrl1} placeholder="https://myUrl/foo/bar/-/commit/%hash%" on:change={save} on:keyup={save}/>
    <label for='gitUrl2'>link to custom path for a commit  -using %hash% & %path%-</label>
    <input id='gitUrl2' type='text' class='form' bind:value={gitUrl2} placeholder="https://myUrl/foo/bar/-/blob/%hash%/%path%" on:change={save} on:keyup={save}/>
    <button class='myButton' on:click="{download}">Download backup</button>
    <button class='myButton' on:click="{() => {addAnother = true}}">Upload a localStorage backup</button>
</content>
{/if}
<style>
    content{
	    width: 100%;
    }
    label{
        display: block;
    }
    .form{
        width: 98%;
        font-size: 1em;
        color: #555;
        background-color: #DDD;
        border: none;
        padding: 0.5rem;
        margin: 1%;
    }
.myButton{
	margin-top: 5vh;
}
.myButton {
	box-shadow:inset 0px 1px 0px 0px #f7c5c0;
	background:linear-gradient(to bottom, #fc8d83 5%, #e4685d 100%);
	background-color:#fc8d83;
	border-radius:6px;
	border:1px solid #d83526;
	display:inline-block;
	cursor:pointer;
	color:#ffffff;
	font-family:Arial;
	font-size:15px;
	font-weight:bold;
	padding:6px 24px;
	text-decoration:none;
	text-shadow:0px 1px 0px #b23e35;
}
.myButton:hover {
	background:linear-gradient(to bottom, #e4685d 5%, #fc8d83 100%);
	background-color:#e4685d;
}
.myButton:active {
	position:relative;
	top:1px;
}
</style>
