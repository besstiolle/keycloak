<script lang="ts">
    import { browser } from '$app/environment';
	import { jsonDataStore } from '$lib/store';
	import FilterBlock from './FilterBlock.svelte'
    import Upload from './Upload.svelte';

	const ID_ROYAUMES = 'royaumes'
	const ID_SUBROYAUMES = 'subRoyaumes'
	const ID_PROTOCOLES = 'protocoles'
	const ID_ENVS = 'envs'

	//Filters
	let fRoyaumes:string[] = []
	let fSubs:string[] = []
	let fProtocols:string[] = []
	let fEnvs:string[] = []
	let hideAll:boolean = false //Set to true if nothing is to be shown

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

	let start = new Date()
	let end:Date;
	
	if($jsonDataStore.length > 100){
		royaumes = JSON.parse($jsonDataStore) 
	} 

	function updateFilters(){
		start = new Date()
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

		console.info("updating Filter ended in " + ((new Date()).getMilliseconds() - start.getMilliseconds()) + "ms")
	}

	let previousSearchValue:string
	function renderSearch(event:Event){

		let searchValue = (document.getElementById('search') as HTMLInputElement)?.value
		searchValue = searchValue.trim()
		if(previousSearchValue == searchValue){
			return
		}
		previousSearchValue = searchValue
		render(event)
	}

	function render(event:Event){
		start = new Date()
		hideAll = false
		//Raw search inside the json directly
		if(previousSearchValue !== undefined && !$jsonDataStore.includes(previousSearchValue)){
			royaumes.forEach((royaume) => {
				royaume.show = false
			})
			hideAll = true
		} else {
			//Filtering with side applet
			let map = new Map<string,Map<string,boolean>>()
			map.set(ID_ROYAUMES, getStateOfFilters(ID_ROYAUMES))
			map.set(ID_SUBROYAUMES, getStateOfFilters(ID_SUBROYAUMES))
			map.set(ID_PROTOCOLES, getStateOfFilters(ID_PROTOCOLES))
			map.set(ID_ENVS, getStateOfFilters(ID_ENVS))
	
			
			royaumes.forEach((royaume) => {
				
				royaume.show = (map.get(ID_ROYAUMES)?.get(royaume.royaume) === true)
				royaume.subs.forEach((sub) => {
					
					sub.show = (map.get(ID_SUBROYAUMES)?.get(sub.sub) === true)
					sub.clientIds.forEach((clientId) => {
						
						
						clientId.show = (map.get(ID_PROTOCOLES)?.get(clientId.protocol) === true)
						clientId.envs.forEach((env) => {
							
							env.show = (map.get(ID_ENVS)?.get(env.env) === true)
							if(env.redirectUris){
								env.redirectUris.forEach((uri) => {
								})
							}
						})
					})
				});
			});

			let oneRoyaumeWasFound = false
			let oneSubWasFound = false
			let oneClientIdWasFound = false
			let oneEnvWasFound = false
			let oneUriWasFound = false

			if(previousSearchValue !== undefined && previousSearchValue !== ""){
				//Filtering with text content
				royaumes.forEach((royaume) => {
					
					oneSubWasFound = false
					if(royaume.show !== false){
						
						if(royaume.royaume.indexOf(previousSearchValue) !== -1){
							royaume.show = true
							oneRoyaumeWasFound = true
							console.debug(royaume.royaume + ' was found matching (royaume)')
						} else {
							royaume.subs.forEach((sub) => {
								oneClientIdWasFound=false
								if(sub.show !== false){
									
									if(sub.sub.indexOf(previousSearchValue) !== -1){
										sub.show = true
										oneSubWasFound = true
										console.debug(sub.sub + ' was found matching (sub)')
									} else {
										sub.clientIds.forEach((clientId) => {
											oneEnvWasFound = false
											if(clientId.show !== false){
												
												if(clientId.clientId.indexOf(previousSearchValue) !== -1){
													clientId.show = true
													oneClientIdWasFound = true
													console.debug(clientId.clientId + ' was found matching (clientId)')
												} else {
													clientId.envs.forEach((env) => {
														oneUriWasFound = false
														if(env.show !== false){

															if(env.redirectUris){
																env.redirectUris.forEach((uri) => {
																	if(uri.indexOf(previousSearchValue) !== -1){
																		console.debug(uri + ' was found matching (uri)')
																		oneUriWasFound=true
																	}
																})
																env.show = oneUriWasFound
																oneEnvWasFound = oneUriWasFound
															}
														}
													})
													clientId.show = oneEnvWasFound
													oneClientIdWasFound = oneClientIdWasFound || oneEnvWasFound
												}
											}
										})
										sub.show = oneClientIdWasFound
										oneSubWasFound = oneSubWasFound || oneClientIdWasFound
									}
								}
							})
							royaume.show = oneSubWasFound
							oneRoyaumeWasFound = oneRoyaumeWasFound || oneSubWasFound
						}
					}
				})
			}

			//Propagation to Parents if all children's nodes are hidden
			let OneRoyaumesisShow = false
			let OneSubRoyaumesisShow = false
			let OneClientIdisShow = false
			let OneEnvisShow = false
			royaumes.forEach((royaume) => {
				if(royaume.show !== false){
					royaume.subs.forEach((sub) => {

						if(sub.show !== false){
							sub.clientIds.forEach((clientId) => {
								
								if(clientId.show !== false){
									clientId.envs.forEach((env) => {

										/*if(env.show !== false){
											if(env.redirectUris){
												env.redirectUris.forEach((uri) => {
												})
											}
										}*/
										OneEnvisShow = OneEnvisShow || env.show
									})
									if(clientId.clientId.indexOf(previousSearchValue) !== -1){
										clientId.show = true
									} else if(!OneEnvisShow){
										clientId.show = false
									}
								}
								OneClientIdisShow = OneClientIdisShow || clientId.show
							})
							if(sub.sub.indexOf(previousSearchValue) !== -1){
								sub.show = true
							} else if(!OneClientIdisShow){
								sub.show = false
							}
						}
						OneSubRoyaumesisShow = OneSubRoyaumesisShow || sub.show
					})

					if(royaume.royaume.indexOf(previousSearchValue) !== -1){
						royaume.show = true
					} else if(!OneSubRoyaumesisShow){
						royaume.show = false
					}
				}
				
				OneRoyaumesisShow = OneRoyaumesisShow || royaume.show
			})

			hideAll = !OneRoyaumesisShow

		}

		//Refresh state of store
		royaumes = royaumes
		console.info("rendering ended in " + ((new Date()).getMilliseconds() - start.getMilliseconds()) + "ms")
		return
			
	}


	function getStateOfFilters(id:string):Map<string,boolean>{
		let map = new Map<string, boolean>()
		let inputs = document.getElementById('filterFor'+id)?.getElementsByTagName("input") 
		if(inputs !== undefined){
			for(let item of inputs){
				map.set(item.value, item.checked)
			}
		}
		return map
	}
	
	updateFilters()

	function markerHtml(source:string){
		return source.replace(previousSearchValue, '<span class="found">' + previousSearchValue + '</span>') 
	}
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

		<FilterBlock filterCode={ID_ROYAUMES} filterTitre='Royaumes' filterList={fRoyaumes}  render={render} />
		<FilterBlock filterCode={ID_SUBROYAUMES} filterTitre='Sous-Royaumes' filterList={fSubs}  render={render} />
		<FilterBlock filterCode={ID_PROTOCOLES} filterTitre='Protocoles' filterList={fProtocols}  render={render} />
		<FilterBlock filterCode={ID_ENVS} filterTitre='Environnements' filterList={fEnvs}  render={render} />
		<button on:click="{() => $jsonDataStore = ''}">clear localStorage</button>
	</side>

	<data>
		<h2>Data</h2>

		<input type='text' id='search' placeholder='Start typing to filtering...' on:keydown={renderSearch} on:keyup={renderSearch} on:change={renderSearch}/>
		
		{#if royaumes.length > 0 }
		<ul>
			{#each royaumes as royaume}
				<li class:hide={royaume.show !== null && royaume.show === false}>{@html markerHtml(royaume.royaume)}<ul>
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
				</ul></li>
			{/each}
		</ul>
		{/if}

		{#if hideAll }
			Aucun résultat ne correspond à votre recherche
		{/if}
	</data>
	{:else}
		<Upload />
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
