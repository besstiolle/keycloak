<script lang="ts">
    import { browser } from '$app/environment';
    import { jsonConfigDataStore } from '$lib/store';
	

    let gitUrl1:string = ''
    let gitUrl2:string = ''

    function init(){
        if(!browser){return}

        let config = getConfigValue()
        
        gitUrl1 = config['gitUrl1']
        gitUrl2 = config['gitUrl2']
    }

    export function getConfigValue(){
        let json = $jsonConfigDataStore
        if(json != null && json != ''){
            return JSON.parse(json)
        }
        return {gitUrl1:'',gitUrl2:''}
    }

    function save(){
        jsonConfigDataStore.set(JSON.stringify({
            gitUrl1:gitUrl1,
            gitUrl2:gitUrl2
        }))
    }

    init()
</script>

<svelte:head>
	<title>Keycloak Config</title>
	<meta name="description" content="Keycloak demo app"/> 
</svelte:head>


<section><h1>Config</h1></section>
<content>
    <label for='gitUrl1'>link to custom commit -using %hash%-</label>
    <input id='gitUrl1' type='text' class='form' bind:value={gitUrl1} placeholder="https://myUrl/foo/bar/-/commit/%hash%" on:change={save} on:keyup={save}/>
    <label for='gitUrl2'>link to custom path for a commit  -using %hash% & %path%-</label>
    <input id='gitUrl2' type='text' class='form' bind:value={gitUrl2} placeholder="https://myUrl/foo/bar/-/blob/%hash%/%path%" on:change={save} on:keyup={save}/>
</content>
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
</style>
