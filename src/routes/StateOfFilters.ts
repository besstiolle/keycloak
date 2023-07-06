
export module StateOfFilters{

	export const ID_INSTANCES = 'Instances'
	export const ID_ROYAUMES = 'Royaumes'
	export const ID_PROTOCOLES = 'Protocoles'
	export const ID_ENVS = 'Envs'
	export const ID_MAPPERS = 'Mappers'

	export const VALUE_DEFAULT_NO_MAPPER = "Sans Mapper"
	export const VALUE_DEFAULT_NO_PROTOCOL = "Sans Protocol"

    export let HIDE_ALL = false
    
	export function getAllStatesOfFilteers(){
		let map = new Map<string,Map<string,boolean>|null>()

		map.set(ID_INSTANCES, getStateOfFilters(ID_INSTANCES))
		map.set(ID_ROYAUMES, getStateOfFilters(ID_ROYAUMES))
		map.set(ID_PROTOCOLES, getStateOfFilters(ID_PROTOCOLES))
		map.set(ID_ENVS, getStateOfFilters(ID_ENVS))
		map.set(ID_MAPPERS, getStateOfFilters(ID_MAPPERS))

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