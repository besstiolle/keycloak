<script lang="ts">
    export let filterTitre:string
    export let filterCode:string
    export let filterList:string[]
	export let render:Function

	const setAll = function(event: Event, value:boolean=true){
		const target = event.target as HTMLButtonElement;

		if(target && target.parentElement && target.parentElement?.getElementsByTagName("input")){
			let inputs:HTMLCollection = target.parentElement?.getElementsByTagName("input")
		
			for(let item of inputs){
				(item as HTMLInputElement).checked=value
			}
			_render()
		}
	}

	const setNone = function(event: Event){
		setAll(event,false)
	}

	const _render = function(event?:Event){
		render(event)
	}
	
</script>

<h3>{filterTitre}</h3>
<div class='filterBlock'>
	<span on:click={setAll} on:keydown={setAll}>select all</span> - <span on:click="{setNone}" on:keydown="{setNone}">deselect all</span>
	<div class='filter' id='filterFor{filterCode}'>{#each filterList as value}
		<label><input type="checkbox" checked value={value} on:change="{_render}"/>{value}</label>
	{/each}</div>
</div>



<style>
.filterBlock > span{
	cursor: pointer;
	font-size: 0.8rem;
	margin-bottom: 1rem;
}
.filter{
	flex-direction:column;
	display: flex;
	cursor: pointer;
	margin-top: 1rem;
}

</style>