<script lang="ts">
    import { browser } from '$app/environment';
	import { jsonDataStore } from '$lib/store';
    import { invalid_attribute_name_character } from 'svelte/internal';
	import FilterBlock from './FilterBlock.svelte'
    import { SearchEngine } from './searchEngine';
    import Upload from './Upload.svelte';

	//Filters
	let fRoyaumes:string[] = []
	let fSubs:string[] = []
	let fProtocols:string[] = []
	let fEnvs:string[] = []
	let hideAll:boolean = false //Set to true if nothing is to be shown

	//Counter of ClientIds
    const ID_ALL = 'id_all'
    let mapCounter = new Map<string, number>()

	//Representation of the JSON data structure
	let royaumes:{ 
				royaume: string;
				show: boolean; 
				subs: { 
					sub: string; 
					show: boolean;
					clientIds: { 
						protocol: string; 
						show: boolean;
						clientId: string;
						envs: { 
							env: string; 
							show: boolean;
							redirectUris: string[]; 
						}[]; 
					}[]; 
				}[]; 
			}[] = []
	
	
	function initiate(){
		if($jsonDataStore.length > 100){
			royaumes = JSON.parse($jsonDataStore) 
			updateFilters()
			updateCounters()
		}
	}

	function updateFilters(){
		fRoyaumes = []
		royaumes.forEach((royaume) => {
			fRoyaumes.push(royaume.royaume)
			royaume.subs.forEach((sub) => {
				fSubs.push(sub.sub)
				sub.clientIds.forEach((clientId) => {
					fProtocols.push(clientId.protocol)
					clientId.envs.forEach((env) => {
						fEnvs.push(env.env)
						/*if(env.redirectUris){
							env.redirectUris.forEach((uri) => {

							})
						}*/
						
					})
				})
			});
		});

		//Remove dupplicat
		fRoyaumes = fRoyaumes.filter((value, index, array) => array.indexOf(value) === index).sort()
		fSubs = fSubs.filter((value, index, array) => array.indexOf(value) === index).sort()
		fProtocols = fProtocols.filter((value, index, array) => array.indexOf(value) === index).sort()
		fEnvs = fEnvs.filter((value, index, array) => array.indexOf(value) === index).sort()
	}

	let currentSearchValue:string
	function renderSearch(event:Event){

		let searchValue = (document.getElementById('search') as HTMLInputElement)?.value
		searchValue = searchValue.trim()
		if(currentSearchValue == searchValue){
			return
		}
		currentSearchValue = searchValue
		render()
	}

	function render(){
		//Refresh state of store
		royaumes = SearchEngine.render(royaumes, currentSearchValue, $jsonDataStore)
		hideAll = SearchEngine.HIDE_ALL
		updateCounters()
	}


	function markerHtml(source:string){
		return source.replace(currentSearchValue, '<span class="found">' + currentSearchValue + '</span>') 
	}


	function updateCounters(){

		let clientIdCounter = 0
		let allClientIdCounter = 0

		royaumes.forEach((royaume) => {
			clientIdCounter=0
			if(royaume.show !== false){
				royaume.subs.forEach((sub) => {

					if(sub.show !== false){
						sub.clientIds.forEach((clientId) => {
							
							if(clientId.show !== false){
								clientIdCounter++
								allClientIdCounter++
							}
						})
					}
				})
			}
			mapCounter.set(royaume.royaume, clientIdCounter)
		})
		mapCounter.set(ID_ALL, allClientIdCounter)	

		console.info(mapCounter)
	}

	// Initiate var.
	initiate()

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

		<FilterBlock filterCode={SearchEngine.ID_ROYAUMES} filterTitre='Royaumes' filterList={fRoyaumes}  render={render} />
		<FilterBlock filterCode={SearchEngine.ID_SUBROYAUMES} filterTitre='Sous-Royaumes' filterList={fSubs}  render={render} />
		<FilterBlock filterCode={SearchEngine.ID_PROTOCOLES} filterTitre='Protocoles' filterList={fProtocols}  render={render} />
		<FilterBlock filterCode={SearchEngine.ID_ENVS} filterTitre='Environnements' filterList={fEnvs}  render={render} />
		<button on:click="{() => $jsonDataStore = ''}">clear localStorage</button>
	</side>

	<data>
		<h2>Data</h2>

		<input type='text' id='search' placeholder='Start typing to filtering...' on:keydown={renderSearch} on:keyup={renderSearch} on:change={renderSearch}/>
		{#if royaumes.length > 0 }
		{#key royaumes}{mapCounter.get(ID_ALL)} IdClients affichés{/key}
		
			{#each royaumes as royaume}
				<div class:hide={royaume.show !== null && royaume.show === false}><h3>{@html markerHtml(royaume.royaume)} - {mapCounter.get(royaume.royaume)}</h3><ul>
						{#each royaume.subs as sub}
						<li class:hide={sub.show !== null && sub.show === false}>{@html markerHtml(sub.sub)}<ul>
								{#each sub.clientIds as clientId}
								<li class:hide={clientId.show !== null && clientId.show === false}>{@html markerHtml(clientId.clientId)}<span class='protocole {clientId.protocol}'>{clientId.protocol}</span><ul>
										{#each clientId.envs as env}
										<li class:hide={env.show !== null && env.show === false}>{env.env}<ul>
												{#if env.redirectUris}
													{#each env.redirectUris as uri}
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
			Aucun résultat ne correspond à votre recherche
		{/if}
	</data>
	{:else}
		<Upload initiateBinder={initiate}/>
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
