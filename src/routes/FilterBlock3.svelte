<script lang="ts">
    import type { DisplaybleItems } from "./elastic/sideStateFactory";
	
	export let title:string
	export let callback:Function
	export let items:Map<string, DisplaybleItems>
	export let rewrite:Function


	const _doAllAction = function(event: Event, bool:boolean){
		const target = event.target as HTMLButtonElement;
		let inputs = target.parentElement?.getElementsByTagName("input") as HTMLCollection

		for(let item of inputs){
			(item as HTMLInputElement).checked=bool
		}

		items.forEach((item, key) => {
			item.isChecked=bool
        	items.set(key, item)
     	});
	}

	const checkAllAction = function(event: Event){
		let start = new Date()
		_doAllAction(event,true)
		callback(items)
		console.debug("setAllAction ended in " + ((new Date()).getMilliseconds() - start.getMilliseconds()) + "ms")
	}

	const UncheckAllAction = function(event: Event){
		let start = new Date()
		_doAllAction(event,false)
		callback(items)
		console.debug("setNoneAction ended in " + ((new Date()).getMilliseconds() - start.getMilliseconds()) + "ms")
	}

	const checkboxAction = function(event:Event){
		let start = new Date()
		let checkbox = (event.target) as HTMLInputElement

		let displaybleItem = items.get(checkbox.value) as DisplaybleItems
		displaybleItem.isChecked = checkbox.checked
		items.set(checkbox.value, displaybleItem)	
		callback(items)
		console.debug("checkboxAction ended in " + ((new Date()).getMilliseconds() - start.getMilliseconds()) + "ms")
	}

	let displaybleItemsArray: DisplaybleItems[] = Array.from(items.values())
	
</script>

<h3>{title}</h3>
<div class='filterBlock'>
	<span on:click={checkAllAction} on:keydown={checkAllAction}>select all</span> - <span on:click="{UncheckAllAction}" on:keydown="{UncheckAllAction}">deselect all</span>
	<div class='filter'>{#each displaybleItemsArray as displaybleItem}
		{#if displaybleItem.isVisible}
			{#if displaybleItem.isChecked}
				<label title={displaybleItem.value}><input type="checkbox" checked value={displaybleItem.value} on:change="{checkboxAction}"/>{rewrite(displaybleItem.value)}</label>
			{:else}
				<label title={displaybleItem.value}><input type="checkbox"  value={displaybleItem.value} on:change="{checkboxAction}"/>{rewrite(displaybleItem.value)}</label>
			{/if}
		{/if}
	{/each}</div>
</div>



<style>
.filterBlock{
	max-height: 300px;
	overflow-x: hidden;
	overflow-y: unset;
	word-break: break-all;
}
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

label{
  display: flex;
  flex-direction: row;
  font-size: 0.8em;
}

</style>