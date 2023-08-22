<script lang="ts">
    import type { commit } from "$lib/gitStruct";
    import { jsonConfigDataStore } from "$lib/store";
    
    export let instance:string
    export let commit:commit

    function url():string{
        if(instance == 'interne'){
            return $jsonConfigDataStore.gitUrl_interne.replace('%hash%',commit?.hash as string)
        }
        if(instance == 'admin'){
            return $jsonConfigDataStore.gitUrl_admin.replace('%hash%',commit?.hash as string)
        }
        if(instance == 'societaire'){
            return $jsonConfigDataStore.gitUrl_societaire.replace('%hash%',commit?.hash as string)
        }
        
        return ''
    }


</script>

{#if commit}
<div class='bulle'>
    {#if url() !== ''}
        <a href={url()}>#{commit.hash.substring(0,6)}</a><br/>
    {:else}
        #{commit.hash.substring(0,6)}<br/>
    {/if}
    {commit.ts}<br/>
    {commit.author}<br/>
    {commit.message}<br/>
</div>
{/if}