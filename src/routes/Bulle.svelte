<script lang="ts">
    import { jsonConfigDataStore } from "$lib/store";
    import type { visualCommit } from "$lib/struct";
    import { getConfigValue } from "./HydratationUtils";

    export let commit:visualCommit

    function url():string{
        let config = getConfigValue($jsonConfigDataStore)
        if(config.gitUrl1 === ''){
            return ''
        }
        return config.gitUrl1.replace('%hash%',commit?.hash as string)
    }
</script>

{#if commit}
<div class='bulle'>
    {#if url() !== ''}
        <a href={url()}>#{commit.hash.substring(0,6)}</a><br/>
    {:else}
        #{commit.hash.substring(0,6)}<br/>
    {/if}
    {commit.date}<br/>
    {commit.author}<br/>
    {commit.message}<br/>
</div>
{/if}