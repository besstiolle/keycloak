<script lang="ts">
    export let filterTitre:string
    export let filterCode:string
    export let filterList:string[]
	export let action:Function

	const setAllAction = function(event: Event, value:boolean=true){
		let start = new Date()
		const target = event.target as HTMLButtonElement;

		if(target && target.parentElement && target.parentElement?.getElementsByTagName("input")){
			let inputs:HTMLCollection = target.parentElement?.getElementsByTagName("input")
		
			for(let item of inputs){
				(item as HTMLInputElement).checked=value
			}
			action()
		}
		
		console.info("setAllAction ended in " + ((new Date()).getMilliseconds() - start.getMilliseconds()) + "ms")
	}

	const setNoneAction = function(event: Event){
		setAllAction(event,false)
	}

	const checkboxAction = function(event?:Event){
		let start = new Date()
		action(event)
		console.info("checkboxAction ended in " + ((new Date()).getMilliseconds() - start.getMilliseconds()) + "ms")
	}
	
</script>

<h3>{filterTitre}</h3>
<div class='filterBlock'>
	<span on:click={setAllAction} on:keydown={setAllAction}>select all</span> - <span on:click="{setNoneAction}" on:keydown="{setNoneAction}">deselect all</span>
	<div class='filter' id='filterFor{filterCode}'>{#each filterList as value}
		<label><input type="checkbox" checked value={value} on:change="{checkboxAction}"/>{value}</label>
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