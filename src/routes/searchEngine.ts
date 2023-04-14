import type { instance } from "$lib/struct"
import { StateOfFilters } from "./StateOfFilters"

export module SearchEngine{
    
    export let HIDE_ALL = false

	let isSearchwithFullText:boolean
    
    export function render(instances:typeof instance[], currentSearchValue:string, rawData:string ){
		HIDE_ALL = false
		isSearchwithFullText = currentSearchValue !== undefined && currentSearchValue !== ""

		//Raw search inside the json directly
		if(isSearchwithFullText && !JSON.stringify(instances).includes(currentSearchValue)){
			instances.forEach((instance) => {
				instance.show = false
			})
			HIDE_ALL = true
		} else {
			
			filteringBySideApplet(instances)

			if(isSearchwithFullText){
				filteringByFullText(instances, currentSearchValue)
			}
			
			HIDE_ALL = !propagationToParents(instances)

		}
		return instances
			
	}

	export function filteringBySideApplet(instances:typeof instance[]){

		//Filtering with side applet
		let map = getAllStatesOfFilteersProxy()

		instances.forEach((instance) => {
			if(map.get(StateOfFilters.ID_INSTANCES)?.get(instance.label) === false){
				//It can still be null (default) or true
				instance.show=false 	
			}
			instance.royaumes.forEach((royaume) => {
				if(map.get(StateOfFilters.ID_ROYAUMES)?.get(royaume.label) === false){
					//It can still be null (default) or true
					royaume.show=false 	
				}
				royaume.clientIds?.forEach((clientId) => {
					if(map.get(StateOfFilters.ID_PROTOCOLES)?.get(clientId.protocol) === false){
						
						//It can still be null (default) or true
						clientId.show=false 	
					}
					clientId.envs.forEach((env) => {
						if(map.get(StateOfFilters.ID_ENVS)?.get(env.label) === false){
							//It can still be null (default) or true
							env.show=false 	
						}
						if(env.mapper === ''){
							if(map.get(StateOfFilters.ID_MAPPERS)?.get(StateOfFilters.VALUE_DEFAULT_NO_MAPPER) === false){
								//It can still be null (default) or true
								env.show=false
							}
						} else {
							if(map.get(StateOfFilters.ID_MAPPERS)?.get(env.mapper) === false){
								//It can still be null (default) or true
								env.show=false 	
							}
						}
						
						if(env.uris){
							env.uris.forEach((uri) => {
							})
						}
					})
				})
			});
		});
	}

	export function getAllStatesOfFilteersProxy(){
		return StateOfFilters.getAllStatesOfFilteers()
	}
	
	export function filteringByFullText(instances:typeof instance[], currentSearchValue:string){
		
		//Flag foundings to "show-true", everything else must be set to "show=false"
		instances.forEach((instance) => {			
			if(instance.show !== false){
				if(instance.label.indexOf(currentSearchValue) !== -1){
					instance.show = true
				} else {
					instance.show = false
					instance.royaumes.forEach((royaume) => {
						if(royaume.show !== false){
							if(royaume.label.indexOf(currentSearchValue) !== -1){
								royaume.show = true
							} else {
								royaume.show = false
								royaume.clientIds?.forEach((clientId) => {
									if(clientId.show !== false){
										if(clientId.label.indexOf(currentSearchValue) !== -1){
											clientId.show = true
										} else {
											clientId.show = false
											clientId.envs.forEach((env) => {
												if(env.show !== false){
													env.show = false //By default
													if(env.uris){
														env.uris.forEach((uri) => {
															if(uri.indexOf(currentSearchValue) !== -1){
																env.show = true
															}
														})
													}
												}
											})
										}
									}
								})
							}
						}
					})
				}
			}
		})

		//In this case we need to propagate the "true" value to children 
		instances.forEach((instance) => {
			instance.royaumes.forEach((royaume) => {
				if(instance.show === true){
					royaume.show = true
				}
				royaume.clientIds?.forEach((clientId) => {
					if(royaume.show === true){
						clientId.show = true
					}
					clientId.envs.forEach((env) => {
						if(clientId.show === true){
							env.show = true
						}
					})
				})
			})
		})

		let oneSubWasFound = false
		let oneClientIdWasFound = false
		let oneEnvWasFound = false

		//In the last part we can put the "true" value to the parent
		instances.forEach((instance) => {			
			oneSubWasFound = false
			instance.royaumes.forEach((royaume) => {
				oneClientIdWasFound = false							
				royaume.clientIds?.forEach((clientId) => {
					oneEnvWasFound = false
					clientId.envs.forEach((env) => {
						oneEnvWasFound = oneEnvWasFound || env.show
					})
					clientId.show = clientId.show || oneEnvWasFound
					oneClientIdWasFound = oneClientIdWasFound || oneEnvWasFound || clientId.show
				})
				royaume.show = royaume.show || oneClientIdWasFound
				oneSubWasFound = oneSubWasFound || oneClientIdWasFound || royaume.show
			})
			instance.show = instance.show || oneSubWasFound
		})
	}

	function propagationToParents(instances:typeof instance[]){
		//Propagation to Parents if all children's nodes are hidden
		let OneInstanceisShow = false
		let OneSubRoyaumesisShow = false
		let OneClientIdisShow = false
		let OneEnvisShow = false
		
		instances.forEach((instance) => {
			if(instance.show !== false){
				OneSubRoyaumesisShow = false
				instance.royaumes.forEach((royaume) => {

					if(royaume.show !== false){

						OneClientIdisShow = false
						royaume.clientIds?.forEach((clientId) => {
							
							if(clientId.show !== false){
								OneEnvisShow = false


								clientId.envs.forEach((env) => {

									
									if(env.show !== false){
										if(env.uris){
											env.uris.forEach((uri) => {
											})
										}
									}
									OneEnvisShow = OneEnvisShow || testCondition(env.show, isSearchwithFullText)
									clientId.show=OneEnvisShow
								})
							}
							OneClientIdisShow = OneClientIdisShow || testCondition(clientId.show, isSearchwithFullText)
							royaume.show = OneClientIdisShow
						})
					}
					OneSubRoyaumesisShow = OneSubRoyaumesisShow || testCondition(royaume.show, isSearchwithFullText)
					instance.show = OneSubRoyaumesisShow
				})
			}
			
			OneInstanceisShow = OneInstanceisShow || testCondition(instance.show, isSearchwithFullText)
		})

		return OneInstanceisShow

	}

	function testCondition(show:boolean, withSearchFullText:boolean){
		if(withSearchFullText){
			return show === true
		}else{
			return show !== false
		}
	}
}