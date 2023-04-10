
<script lang="ts">
    import type { commit, instance, visualCommit } from "$lib/struct";

    export let initiateBinder:Function
    export let allCommits:typeof commit[]
    export let instances:typeof instance[]

    let historyPosition:number=0
	let MaxHistoryPosition:number=0

    let previousCommit: typeof visualCommit
    let currentCommit: typeof visualCommit
    let nextCommit: typeof visualCommit
    initiateHistory()

    function initiateHistory(){
        MaxHistoryPosition = allCommits.length-1
        renderHistory()
    }

    function renderHistory(){
        previousCommit = toVisualCommit(allCommits[historyPosition+1])
        currentCommit = toVisualCommit(allCommits[historyPosition])
        nextCommit = toVisualCommit(allCommits[historyPosition-1])

        instances = Array.from(allCommits[historyPosition].instances)
    }


    function toVisualCommit(aCommit: typeof commit){
        if(aCommit == undefined){
            return undefined
        }
        let aVisualCommit:typeof visualCommit = {
            hash: aCommit.hash,
            date: new Date(aCommit.ts * 1000).toLocaleDateString('FR-fr', { weekday:"long", year:"numeric", month:"short", day:"numeric"})
        }
        return aVisualCommit
    }

	function previousHistory(){
		historyPosition++
		if(historyPosition > MaxHistoryPosition){
			historyPosition = MaxHistoryPosition
		}
        renderHistory()
        initiateBinder()

	}
	function nextHistory(){
		historyPosition--
		if(historyPosition<0){
			historyPosition=0
		}
        renderHistory()
        initiateBinder()
	}
</script>


<h2>History</h2>
{#key previousCommit}
    {#if previousCommit}
    <div class='commit left' on:click={previousHistory} on:keydown={nextHistory}>#{previousCommit.hash.substring(0,6)} - {previousCommit.date}</div>
    {/if}
{/key}
{#key currentCommit}
    <div class='commit middle'><a href='#'>#{currentCommit?.hash.substring(0,6)}</a> - {currentCommit?.date}</div>
{/key}
{#key nextCommit}
    {#if nextCommit}
        <div class='commit right' on:click={nextHistory} on:keydown={nextHistory}>#{nextCommit.hash.substring(0,6)} - {nextCommit.date}</div>
    {/if}
{/key}