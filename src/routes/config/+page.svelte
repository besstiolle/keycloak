<script lang="ts">
    import { browser } from '$app/environment';
    import { JSON_CONFIG_DATA, JSON_ELASTIC_DATA, JSON_GIT_DATA } from '$lib/localStorageUtils';
    import { jsonConfigDataStore } from '$lib/store';
    import { getConfigValue } from '../HydratationUtils';
    import UploadConfiguration from './UploadConfiguration.svelte';
    import type { MasterExport } from '$lib/configStruct';
	
	let addAnother = false

    let gitUrl1:string = ''
    let gitUrl2:string = ''
    let mapClientId:string = ''
    let mapClientId_tmp:string = ''
    let isSafe:boolean = true
    const REGEX = /^([\w\-\_\:\/\-\.]+=[\w\-\_:\/\-\.]+\n)*[\w\-\_:\/\-\.]+=[\w\-\_:\/\-\.]+$/ 

    function init(){
        if(!browser){return}

        let config = getConfigValue($jsonConfigDataStore)
        
        gitUrl1 = config.gitUrl1
        gitUrl2 = config.gitUrl2
        mapClientId = config.mapClientId
        mapClientId_tmp = config.mapClientId
    }

    /**
     * return true if we have something like 
     *   key1:value1
     *   key2:value2
     *   ...
     * @param str
     */
    function testIsSafe(str:string):boolean{
        return str == '' || REGEX.test(str)
    }

    function save(){

        isSafe = testIsSafe(mapClientId_tmp.trim())

        if(isSafe){
            mapClientId = mapClientId_tmp.trim()
        }

        jsonConfigDataStore.set(JSON.stringify({
            gitUrl1:gitUrl1,
            gitUrl2:gitUrl2,
            mapClientId:mapClientId
        }))
    }

    function download(){
        let master:MasterExport = {
            version:2,
            gitData:localStorage.getItem(JSON_GIT_DATA) || '',
            configData:localStorage.getItem(JSON_CONFIG_DATA) || '',
            elasticData:localStorage.getItem(JSON_ELASTIC_DATA) || '',
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
        //console.info(master) 
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
    <label for='mapClientId'>Mapping clientId (referentialKey=logValue per line){#key isSafe}{#if !isSafe}&nbsp;-&nbsp;<span class='err'>Not saved</span>{/if}{/key}</label>
    <textarea id='mapClientId' class='form' bind:value={mapClientId_tmp} on:change={save} on:keyup={save}></textarea>
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
textarea{
    min-height: 120px;
    min-width: 98%;
    max-width: 98%;
}
.err{
    color:#b23e35;
}
</style>
