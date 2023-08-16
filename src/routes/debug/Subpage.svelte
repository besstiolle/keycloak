<script lang="ts">
    import type { Timeline } from "$lib/Timeline.class";
    import type { clientIdElastic } from "$lib/elasticStruct";

    export let arr:Record<string, any>
    export let keys:string[]
    export let timeline:Timeline
    export let toDate:Function

</script>


<table>
    <thead>
        <td>Date</td>
        {#each keys as key}
        <td>{key}</td>
        {/each}
    </thead>
    <tbody>
        {#each timeline.getTimestamps() as timestamp, i}
        <tr>
            <td>{toDate(timestamp)}</td>
        
            {#each keys as key}
            <td>{arr[key][i]}</td>
            {/each}
        <tr>
        {/each}
    </tbody>
</table>


<style>
	table, td{
		border:1px #000
	}
</style>