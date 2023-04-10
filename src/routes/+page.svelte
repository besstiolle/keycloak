<script lang="ts">
    import { browser } from '$app/environment';
	import { jsonDataStore } from '$lib/store';
    import type { commit, instance } from '$lib/struct';
	import FilterBlock from './FilterBlock.svelte'
    import History from './History.svelte';
    import { SearchEngine } from './searchEngine';
    import Upload from './Upload.svelte';
    import DebugVisibility from './DebugVisibility.svelte';
	import { onMount } from 'svelte';

	//Filters
	let fInstances:string[] = []
	let fRoyaumes:string[] = []
	let fProtocols:string[] = []
	let fEnvs:string[] = []
	let hideAll:boolean = false //Set to true if nothing is to be shown
	export let allCommits:typeof commit[] = []

	//Counter of ClientIds
    const ID_ALL = 'id_all'
    let mapCounter = new Map<string, number>()


	let instances:typeof instance[] = []

	function initiateJson(){
		if($jsonDataStore.length > 100){
			allCommits = JSON.parse($jsonDataStore)
			instances = (JSON.parse($jsonDataStore))[0].instances
			initiateRendering()
		}
	}
	
	
	function initiateRendering(){
		if(allCommits.length > 0){
			instances = instances
			updateFilters()
		}
	}

	function updateFilters(){
		fInstances = []
		instances.forEach((instance) => {
			fInstances.push(instance.label)
			instance.royaumes.forEach((royaume) => {
				fRoyaumes.push(royaume.label)
				royaume.clientIds.forEach((clientId) => {
					fProtocols.push(clientId.protocol)
					clientId.envs.forEach((env) => {
						fEnvs.push(env.label)
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
		
		render()
	}

	let currentSearchValue:string
	function renderSearch(event?:Event){
		
		let searchValue = (document.getElementById('search') as HTMLInputElement)?.value
		searchValue = searchValue.trim()
		if(currentSearchValue == searchValue){
			return
		}
		currentSearchValue = searchValue
		render()
	}

	function render(){

		//console.info("titre1 : " + instances[0].label + " vs " + allCommits[0].instances[0].label)
		//Quick reset of the visiblity value
		instances = (JSON.parse($jsonDataStore))[0].instances
		//console.info("titre2 : " + instances[0].label + " vs " + allCommits[0].instances[0].label)

		//Test
		//instances[0].label="toto"
		//console.info("titre3 : " + instances[0].label + " vs " + allCommits[0].instances[0].label)

		//Refresh state of store
		console.info("SHOW1 : " + instances[0].show)
		instances = SearchEngine.render(instances, currentSearchValue, $jsonDataStore)

		console.info("SHOW9 : " + instances[0].show)
		hideAll = SearchEngine.HIDE_ALL
		updateCounters()
	}


	function markerHtml(source:string){
		return source.replace(currentSearchValue, '<span class="found">' + currentSearchValue + '</span>') 
	}


	function updateCounters(){

		let clientIdCounter = 0
		let allClientIdCounter = 0

		instances.forEach((instance) => {
			clientIdCounter=0
			if(instance.show !== false){
				instance.royaumes.forEach((royaume) => {

					if(royaume.show !== false){
						royaume.clientIds.forEach((clientId) => {
							
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

	// Initiate var.
	initiateJson()
</script>

<svelte:head>
	<title>KeyCloak</title>
	<meta name="description" content="Keycloak demo app"/>
</svelte:head>

<section><h1>KeyCloak</h1></section>

<content>
{#if browser}
{#if $jsonDataStore}
	<side>
		<h2>Filtres</h2>

		<FilterBlock filterCode={SearchEngine.ID_INSTANCES} filterTitre='Instances' filterList={fInstances}  render={render} />
		<FilterBlock filterCode={SearchEngine.ID_ROYAUMES} filterTitre='Royaumes' filterList={fRoyaumes}  render={render} />
		<FilterBlock filterCode={SearchEngine.ID_PROTOCOLES} filterTitre='Protocoles' filterList={fProtocols}  render={render} />
		<FilterBlock filterCode={SearchEngine.ID_ENVS} filterTitre='Environnements' filterList={fEnvs}  render={render} />
		<button on:click="{() => $jsonDataStore = ''}">clear localStorage</button>
	</side>

	<data>
		<!--History initiateBinder={initiateRendering} allCommits={allCommits} bind:instances={instances}/-->

		<h2>Data</h2>
		
		<input type='text' id='search' placeholder='Start typing to filtering...' on:keydown={renderSearch} on:keyup={renderSearch} on:change={renderSearch}/>
	
		<!--{#key SearchEngine.mapVisibility}<DebugVisibility instances={SearchEngine.mapVisibility} />{/key}-->

		{#if instances.length > 0 }
			{#key instances}<div>{mapCounter.get(ID_ALL)} IdClients affichés</div>{/key}			
		
			{#each instances as instance}
				<div class:hide={instance.show !== null && instance.show === false}><h3>{@html markerHtml(instance.label)} - {mapCounter.get(instance.label)}</h3><ul>
						{#each instance.royaumes as royaume}
						<li class:hide={royaume.show !== null && royaume.show === false}>{@html markerHtml(royaume.label)}<ul>
								{#each royaume.clientIds as clientId}
								<li class:hide={clientId.show !== null && clientId.show === false}>{@html markerHtml(clientId.label)}<span class='protocole {clientId.protocol}'>{clientId.protocol}</span><ul>
										{#each clientId.envs as env}
										<li class:hide={env.show !== null && env.show === false}>{env.label}<ul>
												{#if env.uris}
													{#each env.uris as uri}
														<li>{@html markerHtml(uri)}</li>
													{/each}
												{/if}
										</ul></li>
										{/each}
								</ul></li>
								{/each}
						</ul></li>
						{/each}
				</ul></div>
			{/each}
		
		{/if}

		{#if hideAll }
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
.protocole{
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
</style>
