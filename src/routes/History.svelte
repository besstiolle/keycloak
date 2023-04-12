
<script lang="ts">
    import type { commit, visualCommit } from "$lib/struct";

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
            date: new Date(aCommit.ts * 1000).toLocaleDateString('FR-fr', { weekday:"short", year:"numeric", month:"short", day:"numeric"})
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
    <div class='commit left' on:click={previousHistory} on:keydown={nextHistory}>Précédent<div class='bulle'>#{previousCommit.hash.substring(0,6)}<br/>{previousCommit.date}</div></div>
    {/if}
{/key}
{#key currentCommit}
    <div class='commit middle'>#{currentCommit?.hash.substring(0,6)} - {currentCommit?.date}<div class='bulle'>:)</div></div>
{/key}
{#key nextCommit}
    {#if nextCommit}
        <div class='commit right' on:click={nextHistory} on:keydown={nextHistory}>Suivant<div class='bulle'>#{nextCommit.hash.substring(0,6)}<br/>{nextCommit.date}</div></div>
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

    .commit{
        background-image: url('./git.png');
        background-repeat: no-repeat;
        display: inline-block;
        padding:10px;
        cursor: pointer;
    }
    .commit:hover{
        color: var(--color-theme-1);
    }

    :global(.commit:hover .bulle){
        display: block !important;
    }

    .left{
        padding-left: 32px;
        background-position: 0 50%;
    }
    .middle{
        background-image: none;
        width: 250px;
        position: absolute;
        left:calc((100% - 250px) / 2);
        text-align: center;
    }
    .right{
        padding-right: 32px;
        background-position: 100% 50%;
        position:absolute;
        right: 0;
    }

    .bulle{
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

    .middle .bulle{
        left:calc((100% - 150px) / 2);
    }
    .right .bulle{
        right: 32px;
    }


</style>