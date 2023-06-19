<script lang="ts">
    import { browser } from '$app/environment';
	import { jsonDataStore, jsonHashNodeDataStore, jsonConfigDataStore } from '$lib/store';
	import FilterBlock from './FilterBlock.svelte'
    import History from './History.svelte';
    import { SearchEngine } from './searchEngine';
    import Upload from './Upload.svelte';
	import {StateOfFilters} from './StateOfFilters'

    import { getConfigValue, hydrate } from './HydratationUtils';
    import type { clientId, env, instance, royaume, commit } from '$lib/struct';

	//Filters
	let fInstances:string[] = []
	let fRoyaumes:string[] = []
	let fProtocols:string[] = []
	let fEnvs:string[] = []
	let fMappers:string[] = []
	let royaumeToInstance = new Map<String,String>()
	let hideAll:boolean = false //Set to true if nothing is to be shown
	let currentSearchValue:string
	export let allCommits: commit[] = []
	
	let historyPosition = 0

	//Counter of ClientIds
    const ID_ALL = 'id_all'
    let mapCounter = new Map<string, number>()
	mapCounter.set(ID_ALL, 0)


	let instances: instance[] = []

	
	function initiateJson(){
		if(!browser){
			return
		}
		
		let start = new Date()
		if($jsonDataStore.length > 100){
			allCommits = hydrate($jsonDataStore, $jsonHashNodeDataStore)

			instances = getInstancesByCurrentIndex()
			console.debug("JSON Parsing ended in " + ((new Date()).getMilliseconds() - start.getMilliseconds()) + "ms")
			if(allCommits.length > 0){
				updateFilters()
			}
		}
		console.debug("initiateJson ended in " + ((new Date()).getMilliseconds() - start.getMilliseconds()) + "ms")
	}

	function getInstancesByCurrentIndex(){
		return structuredClone(allCommits[historyPosition].instances)
	}
	
	function switchIndex(index:number){
		historyPosition = index
		_render()
	}

	function updateFilters(){
		fInstances = []
		instances.forEach((instance) => {
			fInstances.push(instance.label)
			instance.royaumes.forEach((royaume) => {
				fRoyaumes.push(royaume.label)
				royaumeToInstance.set(royaume.label, instance.label)
				royaume.clientIds?.forEach((clientId) => {
					fProtocols.push(clientId.protocol)
					clientId.envs.forEach((env) => {
						fEnvs.push(env.label)
						if(env.mapper !== ''){
							fMappers.push(env.mapper)
						}
						if(env.uris){
							env.uris.forEach((uri) => {

							})
						}
						
					})
				})
			});
		});

		//Remove dupplicat
		fInstances = fInstances.filter((value, index, array) => array.indexOf(value) === index).sort()
		fRoyaumes = fRoyaumes.filter((value, index, array) => array.indexOf(value) === index).sort()
		fProtocols = fProtocols.filter((value, index, array) => array.indexOf(value) === index).sort()
		fEnvs = fEnvs.filter((value, index, array) => array.indexOf(value) === index).sort()
		fMappers = [StateOfFilters.VALUE_DEFAULT_NO_MAPPER].concat(fMappers.filter((value, index, array) => array.indexOf(value) === index).sort())
		
		_render()
	}

	function disabelingFilter(){
		let bool = null
		let map:Map<string,boolean>|null = StateOfFilters.getStateOfFilters(StateOfFilters.ID_INSTANCES)
		if(map !== null){
			let inputsRoyaumes = document.getElementById('filterFor'+StateOfFilters.ID_ROYAUMES)?.getElementsByTagName("input") 
			if(inputsRoyaumes !== undefined){
				for(let item of inputsRoyaumes){
					if(royaumeToInstance.get(item.value) !== undefined && map.get(royaumeToInstance.get(item.value) as string) !== undefined){
						bool = map.get(royaumeToInstance.get(item.value) as string)
						if(bool){
							item.removeAttribute("disabled")
						} else {
							item.setAttribute("disabled","disabled")
						}
					}
				}
				return map
			} 
		}
	}

	function filterSearchAction(event?:Event){
		_render()
	}

	function textSearchAction(event?:Event){
		let start = new Date()

		currentSearchValue = (document.getElementById('search') as HTMLInputElement)?.value.trim()
		_render()

		console.debug("textSearchAction ended in " + ((new Date()).getMilliseconds() - start.getMilliseconds()) + "ms")
	}

	function _render(){
		//Quick reset of the visiblity value
		instances = getInstancesByCurrentIndex()
		//Refresh state of store
		instances = SearchEngine.render(instances, currentSearchValue, $jsonDataStore)
		hideAll = SearchEngine.HIDE_ALL

		let clientIdCounter = 0
		let allClientIdCounter = 0

		instances.forEach((instance) => {
			clientIdCounter=0
			if(instance.show !== false){
				instance.royaumes.forEach((royaume) => {

					if(royaume.show !== false){
						royaume.clientIds?.forEach((clientId) => {
							
							if(clientId.show !== false){
								clientIdCounter++
								allClientIdCounter++
							}
						})
					}
				})
			}
			mapCounter.set(instance.label, clientIdCounter)
		})
		mapCounter.set(ID_ALL, allClientIdCounter)
	}
	
	function markerHtml(source:string){
		return source.replace(currentSearchValue, '<span class="found">' + currentSearchValue + '</span>') 
	}

	function url(i:instance, r:royaume, c:clientId, e:env):string{
        let config = getConfigValue($jsonConfigDataStore)
		if(config.gitUrl2 === ''){
            return ''
        }
		
		let path = i.label + '/clients/' + r.label + '/' + c.label + '/' + e.label + '.json' 
		let url = config.gitUrl2.replace('%hash%',allCommits[historyPosition].hash as string) 
		url = url.replace('%path%', path)

        return url

	}

	// start scripting
	initiateJson()
</script>

<svelte:head>
	<title>Keycloak</title>
	<meta name="description" content="Keycloak demo app"/>
</svelte:head>

<section><h1>Keycloak</h1></section>

<content>
{#if browser}
{#if $jsonDataStore}
	<side>
		<h2>Filtres</h2>

		<FilterBlock filterCode={StateOfFilters.ID_INSTANCES} filterTitre='Instances' filterList={fInstances}  action={filterSearchAction} action2={disabelingFilter}/>
		<FilterBlock filterCode={StateOfFilters.ID_ROYAUMES} filterTitre='Royaumes' filterList={fRoyaumes}  action={filterSearchAction} action2={()=>{}}/>
		<FilterBlock filterCode={StateOfFilters.ID_PROTOCOLES} filterTitre='Protocoles' filterList={fProtocols}  action={filterSearchAction}  action2={()=>{}}/>
		<FilterBlock filterCode={StateOfFilters.ID_ENVS} filterTitre='Environnements' filterList={fEnvs}  action={filterSearchAction}  action2={()=>{}}/>
		<FilterBlock filterCode={StateOfFilters.ID_MAPPERS} filterTitre='Mapper' filterList={fMappers}  action={filterSearchAction}  action2={()=>{}}/>
		
		<button class='myButton' on:click="{() => {$jsonDataStore = ''; $jsonHashNodeDataStore = ''}}">clear localStorage</button>
	</side>

	<data>
		<History switchIndexBinder={switchIndex} allCommits={allCommits} />

		<h2>Data</h2>
		
		<input type='text' id='search' placeholder='Start typing to filtering...' on:keydown={textSearchAction} on:keyup={textSearchAction} on:change={textSearchAction}/>

		{#if instances.length > 0 && mapCounter.get(ID_ALL) !== 0}
			{#key instances}<h4>{mapCounter.get(ID_ALL)} clientId{#if mapCounter.get(ID_ALL) !== 1}s{/if} affiché{#if mapCounter.get(ID_ALL) !== 1}s{/if}</h4>{/key}			
		
			{#each instances as instance}
				<div class:hide={instance.show !== null && instance.show === false}><h3>{@html markerHtml(instance.label)} - {mapCounter.get(instance.label)}</h3><ul>
						{#each instance.royaumes as royaume}
						<li class:hide={royaume.show !== null && royaume.show === false}>{@html markerHtml(royaume.label)}<ul>
								{#if royaume && royaume.clientIds}
								{#each royaume.clientIds as clientId}
								<li class:hide={clientId.show !== null && clientId.show === false}><span>{@html markerHtml(clientId.label)}</span>
									<span class='tag {clientId.protocol}'>{clientId.protocol}</span><ul>
										{#each clientId.envs as env}
										<li class:hide={env.show !== null && env.show === false}>
											{env.label} 
											{#if url(instance, royaume, clientId, env) !== ''}<span class='link'>(<a href={url(instance, royaume, clientId, env)}>link</a>)</span>{/if}
											{#if env.mapper !== ''}<span class='tag mapper'>{env.mapper}</span>{/if}
											<ul>
												{#if env.uris}
													{#each env.uris as uri}
														<li>{@html markerHtml(uri)}</li>
													{/each}
												{/if}
										</ul></li>
										{/each}
								</ul></li>
								{/each}{/if}
						</ul></li>
						{/each}
				</ul></div>
			{/each}
		
		{/if}

		{#if hideAll || mapCounter.get(ID_ALL) == 0}
			<div>Aucun résultat ne correspond à votre recherche</div>
		{/if}
	</data>
	{:else}
		<Upload initiateBinder={initiateJson}/>
	{/if}
{/if}
</content>

<style>
content{
	width: 100%;
}
side{
	width: 20%;
	float: left;
}
data{
	width: 80%;
	float: left;
}
#search{
	width: 100%;
	font-size: 1.5em;
	color: #555;
	background-color: #DDD;
	border: none;
	padding: 1rem;
}
.hide{
	display: none;
}
:global(.found){
	background-color: yellow;
}
.tag{
	background-color: #5f3838;
	color:#FFF;
	padding: 3px 10px;
	margin: 0px 10px;
	display: inline-block;
	font-size: 0.9em;
	font-family: monospace;
}
.saml{
	background-color: #555;
}
.mapper{
	background-color: #ca5050;
	
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

.link{
	font-size: 0.8em;
}
        

        
</style>
