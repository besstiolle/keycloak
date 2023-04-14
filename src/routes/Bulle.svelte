<script lang="ts">
    import type { visualCommit } from "$lib/struct";

    export let commit:typeof visualCommit
</script>

{#if commit}
<div class='bulle'>
    #{commit.hash.substring(0,6)}<br/>
    {commit.date}<br/>
    {commit.author}<br/>
    {commit.message}<br/>
</div>
{/if}