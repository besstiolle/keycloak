
<script lang="ts">
    import type { datasetTableurHit } from '$lib/elasticStruct';
    
	export let datasets:datasetTableurHit[]	

   
	function dateToInternalDate (d:Date){
		return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
	}

    function numberWithSpaces(x:number) {
        return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, " ");
    }

    function basicComparator(o1:string|number|Date,o2:string|number|Date,c1:string,c2:string){
        if (o1 > o2){
            return 1 * (isOrderASC?1:-1)
        } else if (o1 < o2){
            return -1 * (isOrderASC?1:-1)
        } else {
            if (c1 > c2){
                return 1
            } else if (c1 < c2){
                return -1
            } else {
                return 0
            }
        }
    }
    function comparatorInstance(a:datasetTableurHit, b:datasetTableurHit):number{
        return basicComparator(a.instance, b.instance, a.clientId, b.clientId)
    }
    function comparatorFirstSeen(a:datasetTableurHit, b:datasetTableurHit):number{
        return basicComparator(a.firstSeen, b.firstSeen, a.clientId, b.clientId)
    }
    function comparatorLastSeen(a:datasetTableurHit, b:datasetTableurHit):number{
        return basicComparator(a.lastSeen, b.lastSeen, a.clientId, b.clientId)
    }
    function comparatorDuration(a:datasetTableurHit, b:datasetTableurHit):number{
        return basicComparator(a.duration, b.duration, a.clientId, b.clientId)
    }
    function comparatorAvgAll(a:datasetTableurHit, b:datasetTableurHit):number{
        return basicComparator(a.avgAll, b.avgAll, a.clientId, b.clientId)
    }
    function comparatorAvg30(a:datasetTableurHit, b:datasetTableurHit):number{
        return basicComparator(a.avgHit30d, b.avgHit30d, a.clientId, b.clientId)
    }
    function comparatorMaxAll(a:datasetTableurHit, b:datasetTableurHit):number{
        return basicComparator(a.maxhit, b.maxhit, a.clientId, b.clientId)
    }
    function comparatorDateMaxAll(a:datasetTableurHit, b:datasetTableurHit):number{
        return basicComparator(a.maxDate, b.maxDate, a.clientId, b.clientId)
    }
    function comparatorSumAll(a:datasetTableurHit, b:datasetTableurHit):number{
        return basicComparator(a.sumHits, b.sumHits, a.clientId, b.clientId)
    }


    function compareClientId(a:datasetTableurHit, b:datasetTableurHit):number{
        if (a.clientId > b.clientId){
            return 1 * (isOrderASC?1:-1)
        } else if (a.clientId < b.clientId){
            return -1 * (isOrderASC?1:-1)
        } else {
            return 0
        }
    }

    let isOrderASC = true
    let currentSort:fields
    function sortBy(field:fields){
        if(currentSort != field){
            currentSort = field
            isOrderASC = true
        } else {
            //Reverte order
            isOrderASC = !isOrderASC
        }

        switch(currentSort){
            case fields.instance:datasets = datasets.sort(comparatorInstance);break;
            case fields.firstSeen:datasets = datasets.sort(comparatorFirstSeen);break;
            case fields.lastSeen:datasets = datasets.sort(comparatorLastSeen);break;
            case fields.duration:datasets = datasets.sort(comparatorDuration);break;
            case fields.avgAll:datasets = datasets.sort(comparatorAvgAll);break;
            case fields.avg30:datasets = datasets.sort(comparatorAvg30);break;
            case fields.maxAll:datasets = datasets.sort(comparatorMaxAll);break;
            case fields.dateMaxAll:datasets = datasets.sort(comparatorDateMaxAll);break;
            case fields.sumAll:datasets = datasets.sort(comparatorSumAll);break;
            default : datasets = datasets.sort(compareClientId) //clientId
        }

        initArrOrder()
    }


    let arrOrder:string[] = []
    function initArrOrder(){
        arrOrder=[]
        Object.values(fields).forEach(field => {
            if(field == currentSort){
                arrOrder[field] = (isOrderASC?' ↗':' ↘')
            } else {
                arrOrder[field as number] = ''
            }
            
        });
    }

    enum fields{
        clientId,
        instance,
        firstSeen,
        lastSeen,
        duration,
        avgAll,
        avg30,
        maxAll,
        dateMaxAll,
        sumAll
    }

    /**
     * 0 = all
     * 1 = no smell
     * 2 = only smell
     */
    let rotate = 0
    function rotateSmell(){
        rotate++
        rotate = rotate % 3
    }

    initArrOrder()

</script>

<h3 on:click={rotateSmell} on:keydown={rotateSmell}>Click me to show/hide ☣️ lines</h3>

<table>
    <thead>
        <tr>{#key arrOrder}
            <td on:click={() => sortBy(fields.clientId)} on:keydown={() => sortBy(fields.clientId)}>ClientId{arrOrder[0]}</td>
            <td on:click={() => sortBy(fields.instance)} on:keydown={() => sortBy(fields.instance)}>Instance{arrOrder[1]}</td>
            <td class='w2' on:click={() => sortBy(fields.firstSeen)} on:keydown={() => sortBy(fields.firstSeen)}>First Seen{arrOrder[2]}</td>
            <td class='w2' on:click={() => sortBy(fields.lastSeen)} on:keydown={() => sortBy(fields.lastSeen)}>Last Seen{arrOrder[3]}</td>
            <td class='w2' on:click={() => sortBy(fields.duration)} on:keydown={() => sortBy(fields.duration)}>period of activity{arrOrder[4]}</td>
            <td class='w2' on:click={() => sortBy(fields.avgAll)} on:keydown={() => sortBy(fields.avgAll)}>Avg hits all period{arrOrder[5]}</td>
            <td class='w2' on:click={() => sortBy(fields.avg30)} on:keydown={() => sortBy(fields.avg30)}>Avg hits on last 30 days{arrOrder[6]}</td>
            <td class='w2' on:click={() => sortBy(fields.maxAll)} on:keydown={() => sortBy(fields.maxAll)}>Max Hits all period{arrOrder[7]}</td>
            <td class='w2' on:click={() => sortBy(fields.dateMaxAll)} on:keydown={() => sortBy(fields.dateMaxAll)}>Date of this max hit{arrOrder[8]}</td>
            <td class='w2' on:click={() => sortBy(fields.sumAll)} on:keydown={() => sortBy(fields.sumAll)}>Sum Hits all period{arrOrder[9]}</td>
            {/key}
        </tr>
    </thead>
    <tbody>
        {#each  datasets as data}
        <tr class:hide="{(!data.isKnown && rotate==1) || (data.isKnown && rotate==2)}">
            <td class='tl w'>{data.clientId}{data.isKnown?'':' ☣️'}</td>
            <td class='tl'>{data.instance}</td>
            <td>{dateToInternalDate(data.firstSeen)}</td>
            <td>{dateToInternalDate(data.lastSeen)}</td>
            <td>{data.duration} j.</td>
            <td>{numberWithSpaces(data.avgAll)}</td>
            <td>{numberWithSpaces(data.avgHit30d)}</td>
            <td>{numberWithSpaces(data.maxhit)}</td>
            <td>{dateToInternalDate(data.maxDate)}</td>
            <td>{numberWithSpaces(data.sumHits)}</td>
        </tr>
            
        {/each}
    </tbody>
</table>

<style>
    h3{
        cursor: pointer;
    }
    table{
        margin: 0 -20rem;
        border: 0px none;
    }
    thead{
        font-weight:600;
        text-align: center;
    }
    tbody{
        font-size: 0.9em;
        text-align: right;
    }
    .tl{
        text-align: left;
    }
    .w{
        width: 250px;
        display: block;
        word-wrap: break-word;
    }
    .w2{
        width: 90px;
        word-wrap: break-word;
    }
    tr:nth-child(even) {
        background-color: #ccc;
    }
    .hide{
        display: none;
    }
</style>
