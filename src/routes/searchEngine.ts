import type { instance } from "$lib/struct"

export module SearchEngine{
    

	export const ID_INSTANCES = 'instances'
	export const ID_ROYAUMES = 'subRoyaumes'
	export const ID_PROTOCOLES = 'protocoles'
	export const ID_ENVS = 'envs'

    export let HIDE_ALL = false
    
    export function render(instances:typeof instance[], currentSearchValue:string, rawData:string ){
		let start = new Date()
		HIDE_ALL = false
		//Raw search inside the json directly
		if(currentSearchValue !== undefined && !rawData.includes(currentSearchValue)){
			instances.forEach((instance) => {
				instance.show = false
			})
			HIDE_ALL = true
		} else {
			//Filtering with side applet
			let map = new Map<string,Map<string,boolean>>()
			map.set(ID_INSTANCES, getStateOfFilters(ID_INSTANCES))
			map.set(ID_ROYAUMES, getStateOfFilters(ID_ROYAUMES))
			map.set(ID_PROTOCOLES, getStateOfFilters(ID_PROTOCOLES))
			map.set(ID_ENVS, getStateOfFilters(ID_ENVS))
	
			
			instances.forEach((instance) => {
				
				instance.show = (map.get(ID_INSTANCES)?.get(instance.label) === true)
				instance.royaumes.forEach((royaume) => {
					
					royaume.show = (map.get(ID_ROYAUMES)?.get(royaume.label) === true)
					royaume.clientIds.forEach((clientId) => {
						
						
						clientId.show = (map.get(ID_PROTOCOLES)?.get(clientId.protocol) === true)
						clientId.envs.forEach((env) => {
							
							env.show = (map.get(ID_ENVS)?.get(env.label) === true)
							//console.info("env.env = " + env.env + " env.show = " + env.show)
							if(env.uris){
								env.uris.forEach((uri) => {
								})
							}
						})
					})
				});
			});

			let oneInstanceWasFound = false
			let oneSubWasFound = false
			let oneClientIdWasFound = false
			let oneEnvWasFound = false
			let oneUriWasFound = false

			if(currentSearchValue !== undefined && currentSearchValue !== ""){
				//Filtering with text content
				instances.forEach((instance) => {
					
					oneSubWasFound = false
					if(instance.show !== false){
						
						if(instance.label.indexOf(currentSearchValue) !== -1){
							instance.show = true
							oneInstanceWasFound = true
							console.debug(instance.label + ' was found matching (instance)')
						} else {
							instance.royaumes.forEach((royaume) => {
								oneClientIdWasFound = false
								if(royaume.show !== false){
									
									if(royaume.label.indexOf(currentSearchValue) !== -1){
										royaume.show = true
										oneSubWasFound = true
										console.debug(royaume.label + ' was found matching (sub)')
									} else {
										royaume.clientIds.forEach((clientId) => {
											oneEnvWasFound = false
											if(clientId.show !== false){
												
												if(clientId.label.indexOf(currentSearchValue) !== -1){
													clientId.show = true
													oneClientIdWasFound = true
													console.debug(clientId.label + ' was found matching (clientId)')
												} else {
													clientId.envs.forEach((env) => {
														oneUriWasFound = false
														if(env.show !== false){

															if(env.uris){
																env.uris.forEach((uri) => {
																	if(uri.indexOf(currentSearchValue) !== -1){
																		console.debug(uri + ' was found matching (uri)')
																		oneUriWasFound = true
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
										royaume.show = oneClientIdWasFound
										oneSubWasFound = oneSubWasFound || oneClientIdWasFound
									}
								}
							})
							instance.show = oneSubWasFound
							oneInstanceWasFound = oneInstanceWasFound || oneSubWasFound
						}
					}
				})
			}


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
							royaume.clientIds.forEach((clientId) => {
								
								if(clientId.show !== false){
									OneEnvisShow = false
									clientId.envs.forEach((env) => {

										
										if(env.show !== false){
											if(env.uris){
												env.uris.forEach((uri) => {
												})
											}
										}
										OneEnvisShow = OneEnvisShow || env.show
									})
									if(clientId.label.indexOf(currentSearchValue) !== -1){
										clientId.show = true
									} else if(!OneEnvisShow){
										clientId.show = false
									}
								}
								OneClientIdisShow = OneClientIdisShow || clientId.show
							})
							if(royaume.label.indexOf(currentSearchValue) !== -1){
								royaume.show = true
							} else if(!OneClientIdisShow){
								royaume.show = false
							}
						}
						OneSubRoyaumesisShow = OneSubRoyaumesisShow || royaume.show
					})

					if(instance.label.indexOf(currentSearchValue) !== -1){
						instance.show = true
					} else if(!OneSubRoyaumesisShow){
						instance.show = false
					}
				}
				
				OneInstanceisShow = OneInstanceisShow || instance.show
			})

			HIDE_ALL = !OneInstanceisShow

		}

		
		console.info("rendering ended in " + ((new Date()).getMilliseconds() - start.getMilliseconds()) + "ms")
		return instances
			
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
}