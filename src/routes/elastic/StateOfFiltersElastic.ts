
export module StateOfFiltersElastic{

	export const ID_INSTANCES = 'Instances'
	export const ID_CLIENTIDS = 'ClientIds'
	export const ID_REQUESTTYPE = 'RequestTypes'

	export const VALUE_DEFAULT_NO_MAPPER = "Sans Mapper"

    export let HIDE_ALL = false
    
	export function getAllStatesOfFilteers(){
		let map = new Map<string,Map<string,boolean>|null>()

		map.set(ID_INSTANCES, getStateOfFilters(ID_INSTANCES))
		map.set(ID_CLIENTIDS, getStateOfFilters(ID_CLIENTIDS))
		map.set(ID_REQUESTTYPE, getStateOfFilters(ID_REQUESTTYPE))

		return map
	}

	export function getStateOfFilters(id:string):Map<string,boolean>|null{
		let map = new Map<string, boolean>()
		let inputs = document.getElementById('filterFor'+id)?.getElementsByTagName("input") 
		
		if(inputs !== undefined){
			for(let item of inputs){
				map.set(item.value, item.checked)
			}
			return map
		} 

		console.debug("input with id " +"filterFor"+id+ " not found in body")
		return null
	}
}