export module SearchEngine{
    

	export const ID_ROYAUMES = 'royaumes'
	export const ID_SUBROYAUMES = 'subRoyaumes'
	export const ID_PROTOCOLES = 'protocoles'
	export const ID_ENVS = 'envs'

    export let HIDE_ALL = false
    
    export function render(royaumes:{ 
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
    }[], currentSearchValue:string, rawData:string ){
		let start = new Date()
		HIDE_ALL = false
		//Raw search inside the json directly
		if(currentSearchValue !== undefined && !rawData.includes(currentSearchValue)){
			royaumes.forEach((royaume) => {
				royaume.show = false
			})
			HIDE_ALL = true
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
							//console.info("env.env = " + env.env + " env.show = " + env.show)
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

			if(currentSearchValue !== undefined && currentSearchValue !== ""){
				//Filtering with text content
				royaumes.forEach((royaume) => {
					
					oneSubWasFound = false
					if(royaume.show !== false){
						
						if(royaume.royaume.indexOf(currentSearchValue) !== -1){
							royaume.show = true
							oneRoyaumeWasFound = true
							console.debug(royaume.royaume + ' was found matching (royaume)')
						} else {
							royaume.subs.forEach((sub) => {
								oneClientIdWasFound = false
								if(sub.show !== false){
									
									if(sub.sub.indexOf(currentSearchValue) !== -1){
										sub.show = true
										oneSubWasFound = true
										console.debug(sub.sub + ' was found matching (sub)')
									} else {
										sub.clientIds.forEach((clientId) => {
											oneEnvWasFound = false
											if(clientId.show !== false){
												
												if(clientId.clientId.indexOf(currentSearchValue) !== -1){
													clientId.show = true
													oneClientIdWasFound = true
													console.debug(clientId.clientId + ' was found matching (clientId)')
												} else {
													clientId.envs.forEach((env) => {
														oneUriWasFound = false
														if(env.show !== false){

															if(env.redirectUris){
																env.redirectUris.forEach((uri) => {
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
					OneSubRoyaumesisShow = false
					royaume.subs.forEach((sub) => {
						
						if(sub.show !== false){
							OneClientIdisShow = false
							sub.clientIds.forEach((clientId) => {
								
								if(clientId.show !== false){
									OneEnvisShow = false
									clientId.envs.forEach((env) => {

										
										if(env.show !== false){
											if(env.redirectUris){
												env.redirectUris.forEach((uri) => {
												})
											}
										}
										OneEnvisShow = OneEnvisShow || env.show
									})
									if(clientId.clientId.indexOf(currentSearchValue) !== -1){
										clientId.show = true
									} else if(!OneEnvisShow){
										clientId.show = false
									}
								}
								OneClientIdisShow = OneClientIdisShow || clientId.show
							})
							if(sub.sub.indexOf(currentSearchValue) !== -1){
								sub.show = true
							} else if(!OneClientIdisShow){
								sub.show = false
							}
						}
						OneSubRoyaumesisShow = OneSubRoyaumesisShow || sub.show
					})

					if(royaume.royaume.indexOf(currentSearchValue) !== -1){
						royaume.show = true
					} else if(!OneSubRoyaumesisShow){
						royaume.show = false
					}
				}
				
				OneRoyaumesisShow = OneRoyaumesisShow || royaume.show
			})

			HIDE_ALL = !OneRoyaumesisShow

		}

		
		console.info("rendering ended in " + ((new Date()).getMilliseconds() - start.getMilliseconds()) + "ms")
		return royaumes
			
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