
<script lang="ts">
    import type { commit, visualCommit } from "$lib/struct";
    import Bulle from "./Bulle.svelte";

    export let switchIndexBinder:Function
    export let allCommits:typeof commit[]

    let historyPosition:number=0
	let MaxHistoryPosition:number=0

    let previousCommit: typeof visualCommit
    let currentCommit: typeof visualCommit
    let nextCommit: typeof visualCommit
    MaxHistoryPosition = allCommits.length-1
    renderVisualCommit()

    function renderVisualCommit(){
        previousCommit = toVisualCommit(allCommits[historyPosition+1])
        currentCommit = toVisualCommit(allCommits[historyPosition])
        nextCommit = toVisualCommit(allCommits[historyPosition-1])
    }
    function toVisualCommit(aCommit: typeof commit){
        if(aCommit == undefined){
            return undefined
        }
        let aVisualCommit:typeof visualCommit = {
            hash: aCommit.hash,
            date: new Date(aCommit.ts * 1000).toLocaleDateString('FR-fr', { weekday:"short", year:"numeric", month:"short", day:"numeric"}),
            message:aCommit.message,
            author:aCommit.author[0]
        }
        return aVisualCommit
    }
	function previousHistory(){
		historyPosition++
		if(historyPosition > MaxHistoryPosition){
			historyPosition = MaxHistoryPosition
		}
        renderVisualCommit()
        switchIndexBinder(historyPosition)

	}
	function nextHistory(){
		historyPosition--
		if(historyPosition<0){
			historyPosition=0
		}
        renderVisualCommit()
        switchIndexBinder(historyPosition)
	}
</script>


<h2>History</h2>
<div class='gits'>
{#key previousCommit}
    {#if previousCommit}
    <div class='commitWrapper left'>
        <div class='commit' on:click={previousHistory} on:keydown={nextHistory}>Précédent</div>
        <Bulle commit={previousCommit}/>
    </div>
    {/if}
{/key}
{#key currentCommit}
    <div class='commitWrapper middle'>
        <div class='commit'>#{currentCommit?.hash.substring(0,6)} - {currentCommit?.date}</div>
        <Bulle commit={currentCommit}/>
    </div>
{/key}
{#key nextCommit}
    {#if nextCommit}
        <div class='commitWrapper right'>
            <div class='commit' on:click={nextHistory} on:keydown={nextHistory}>Suivant</div>
            <Bulle commit={nextCommit}/>
            </div>
    {/if}
{/key}
</div>

<style>
    .gits{
	    width: 100%;
        position: relative;
        height: 37px;
        user-select: none; 
    }

    .commitWrapper{
        display: inline-block;

    }
    .commitWrapper:hover{
        color: var(--color-theme-1);
    }

    :global(.commitWrapper:hover .bulle){
        display: block !important;
    }

    .commit{
        background-image: url('/git.png');
        background-repeat: no-repeat;
        cursor: pointer;
        padding:10px;
    }
    
    .left .commit{
        padding-left: 32px;
        background-position: 0 50%;
    }

    .middle{
        width: 250px;
        position: absolute;
        left:calc((100% - 250px) / 2);
    }

    .middle .commit{
        background-image: none;
        text-align: center;
    }
    .right{
        position:absolute;
        right: 0;
    }
    .right .commit{
        background-position: 100% 50%;
        padding-right: 32px;
    }

    :global(.bulle){
        display: none;
        position: absolute;
        background-color: var(--color-bg-1);
        padding: 10px;
        font-size: 0.8em;
        font-family: mono;
        border-radius: 5px;
        color:var(--color-text);
        width: 150px;
    }

    :global(.middle .bulle){
        left:calc((100% - 150px) / 2);
        text-align: left;
    }
    :global(.right .bulle){
        right: 32px;
    }


</style>