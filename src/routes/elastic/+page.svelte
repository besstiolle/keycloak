<script lang="ts">
    import { browser } from '$app/environment';
    import { type minMax, REQUEST_TYPE, ERROR_BY_CLIENTID_TYPE, ERROR_SOC_TYPE } from '$lib/elasticStruct';
    import { jsonElasticDataStore, jsonGitDataStore,  jsonConfigDataStore, timelineStore, stateOfsideStore } from '$lib/store';
    import UploadElastic from './UploadElastic.svelte';
    import { initTableur, getMinMax, type DatasetAndLimitsForLine, type datasetTableurHit, type LabelAndDatasetString, type LabelAndDataset } from './datasetFactory';
    import KeyResume from './KeyResume.svelte';
    import TableClientIdBy from './TableClientIdBy.svelte';
    import LineHitsAll from './LineHitsAll.svelte';
    import Side from './side.svelte';
    import PieCountersByError from './PieCountersBySetOfElements.svelte';
    import LineHitsByDayOWeek from './LineHitsByDayOWeek.svelte';
    import { GroupByCollectionEngine, runGroupByCollectionEngine } from './groupByCollectionEngine';
    import { GroupByErrorsSocEngine, runGroupByErrorsSocEngine } from './groupByErrorsSocEngine';
    import { ACTION_VAL, SOURCE_CONTAINER, type DisplaybleItems, GRAPH_TYPE, DATA_TYPE } from './sideStateFactory';
    import { groupByCollectionAndAvgByUsersEngine, runGroupByCollectionAndAvgByUsersEngine } from './groupByCollectionAndAvgByUsersEngine';
    import { EnrichedDataWrapper, SUFFIX_FOR_REQUEST_USERS, getEnrichedData, refreshEnrichedData } from './enrichedDataFactory';
    import { FriendlyName } from './friendlyName';
/*
	import { page } from '$app/stores'
    import { goto } from '$app/navigation';
    import { ACTION_VAL, DATA_TYPE, GRAPH_TYPE, SOURCE_CONTAINER, type DisplaybleItems } from './sideStateFactory';
	if(browser){
    	const isBeta = $page.url.searchParams.has('beta')
		goto("?foo=bar&foo2=bar2",{keepFocus:true})
	}*/
	let addAnother = false
	let startAbsolute:Date = new Date()
	let datasetAndLimits:DatasetAndLimitsForLine = emptyDatasetAndLimitsForLine()
	let datasetsForPie:LabelAndDatasetString[]
	let datasetTableurByHits:datasetTableurHit[] = []
	let enrichedData:EnrichedDataWrapper
	
	//Initiate singleton
	FriendlyName.initiate($jsonConfigDataStore)


	//TODO MOVE inTO ITS OWN FACTORY
	function emptyDatasetAndLimitsForLine():DatasetAndLimitsForLine{
		let datasetAndLimits:DatasetAndLimitsForLine = {
			labelsAndDatasets:[],
			min:0,
			max:0
		}

		return datasetAndLimits
	}

	function initiatePage(){
		if(!browser){
			return
		}
		startAbsolute = new Date()
		addAnother = false
		try{
			enrichedData = getEnrichedData()
		} catch(e){
			forceRefreshCache()
		}

		console.debug("initiatePage ended in " + ((new Date()).valueOf() - startAbsolute.valueOf()) + "ms since start")
	}

	function selectedAndVisibleItemsFromMap(map:Map<string,DisplaybleItems>):string[]{
		let arr:string[] = []

		map.forEach(displaybleItem =>{
			if(displaybleItem.isChecked && displaybleItem.isVisible){arr.push(displaybleItem.value)}
		})

		return arr
	}

	function drawGraph(){
		let start = new Date()
		let minMax:minMax = {min:9000000,max:0}

		let engine = null
		let labelsAndDatasets:LabelAndDataset[] = []
		if($stateOfsideStore.sourceContainer == SOURCE_CONTAINER.HITS) {
			engine = new GroupByCollectionEngine($stateOfsideStore.isSumOrDistinctByInstance == ACTION_VAL.SUM_BY_INSTANCE, 
										$stateOfsideStore.isSumOrDistinctByClientId == ACTION_VAL.SUM_BY_CLIENTID, 
										$stateOfsideStore.isSumOrDistinctByRequestType == ACTION_VAL.SUM_BY_REQUESTTYPE, 
										selectedAndVisibleItemsFromMap($stateOfsideStore.instances),
										selectedAndVisibleItemsFromMap($stateOfsideStore.clientIds),
										selectedAndVisibleItemsFromMap($stateOfsideStore.requestsType),
										$stateOfsideStore.isAgregate,
										enrichedData.instanceToClientId)
			labelsAndDatasets = runGroupByCollectionEngine(engine, enrichedData.rawData)

		} else if($stateOfsideStore.sourceContainer == SOURCE_CONTAINER.REQUEST_USERS) {
			engine = new GroupByCollectionEngine($stateOfsideStore.isSumOrDistinctByInstance == ACTION_VAL.SUM_BY_INSTANCE, 
										$stateOfsideStore.isSumOrDistinctByClientId == ACTION_VAL.SUM_BY_CLIENTID, 
										$stateOfsideStore.isSumOrDistinctByRequestType == ACTION_VAL.SUM_BY_REQUESTTYPE, 
										selectedAndVisibleItemsFromMap($stateOfsideStore.instances),
										selectedAndVisibleItemsFromMap($stateOfsideStore.clientIds),
										selectedAndVisibleItemsFromMap($stateOfsideStore.requestsType),
										$stateOfsideStore.isAgregate,
										enrichedData.instanceToClientId,
										SUFFIX_FOR_REQUEST_USERS)
			labelsAndDatasets = runGroupByCollectionEngine(engine, enrichedData.rawData)

		} else if($stateOfsideStore.sourceContainer == SOURCE_CONTAINER.REQUEST_HITS_BY_USERS) {
			engine = new groupByCollectionAndAvgByUsersEngine($stateOfsideStore.isSumOrDistinctByInstance == ACTION_VAL.SUM_BY_INSTANCE, 
										$stateOfsideStore.isSumOrDistinctByClientId == ACTION_VAL.SUM_BY_CLIENTID, 
										$stateOfsideStore.isSumOrDistinctByRequestType == ACTION_VAL.SUM_BY_REQUESTTYPE, 
										selectedAndVisibleItemsFromMap($stateOfsideStore.instances),
										selectedAndVisibleItemsFromMap($stateOfsideStore.clientIds),
										selectedAndVisibleItemsFromMap($stateOfsideStore.requestsType),
										$stateOfsideStore.isAgregate,
										enrichedData.instanceToClientId,
										SUFFIX_FOR_REQUEST_USERS)
			labelsAndDatasets = runGroupByCollectionAndAvgByUsersEngine(engine, enrichedData.rawData)

		} else if($stateOfsideStore.sourceContainer == SOURCE_CONTAINER.ERRORS_BY_CLIENTID){
			engine = new GroupByCollectionEngine($stateOfsideStore.isSumOrDistinctByInstance == ACTION_VAL.SUM_BY_INSTANCE, 
											$stateOfsideStore.isSumOrDistinctByClientId == ACTION_VAL.SUM_BY_CLIENTID, 
											$stateOfsideStore.isSumOrDistinctByErrorsByClientId == ACTION_VAL.SUM_BY_ERRORSBYCLIENTID, 
											selectedAndVisibleItemsFromMap($stateOfsideStore.instances),
											selectedAndVisibleItemsFromMap($stateOfsideStore.clientIds),
											selectedAndVisibleItemsFromMap($stateOfsideStore.errorsByClientId),
											$stateOfsideStore.isAgregate,
											enrichedData.instanceToClientId)
			labelsAndDatasets = runGroupByCollectionEngine(engine, enrichedData.rawData)
		} else if($stateOfsideStore.sourceContainer == SOURCE_CONTAINER.ERRORS_SOC){
			engine = new GroupByErrorsSocEngine($stateOfsideStore.isSumOrDistinctByErrorsSoc == ACTION_VAL.SUM_BY_ERRORSSOC, 
												selectedAndVisibleItemsFromMap($stateOfsideStore.errorsSoc),
												$stateOfsideStore.isAgregate)
			labelsAndDatasets = runGroupByErrorsSocEngine(engine, enrichedData.rawData)
		} else if($stateOfsideStore.sourceContainer == SOURCE_CONTAINER.TABLEUR){
			//Nothing to do
		} else {
			console.error("case unexpected in DrawaGraph")
			return
		}

		if ($stateOfsideStore.sourceContainer == SOURCE_CONTAINER.TABLEUR) {
			datasetTableurByHits = initTableur($timelineStore, $jsonGitDataStore, $jsonConfigDataStore, enrichedData)
		} else if($stateOfsideStore.graphType == GRAPH_TYPE.LINE){
			//reset dataset wrapper
			datasetAndLimits = emptyDatasetAndLimitsForLine()
			labelsAndDatasets.forEach(labelAndDataset => {
				minMax = getMinMax([labelAndDataset.data], minMax)
			});

			datasetAndLimits.labelsAndDatasets = labelsAndDatasets
			datasetAndLimits.min = minMax.min
			datasetAndLimits.max = minMax.max
		} else if ($stateOfsideStore.graphType == GRAPH_TYPE.PIE) {
			
			datasetsForPie = []
			let mapData = new Map<string, number>()
			labelsAndDatasets.forEach(labelAndDataset => {
				mapData.set(labelAndDataset.label, labelAndDataset.weight)
			});
			datasetsForPie.push({
				label:'Ratio by selected field',
				data:mapData
			})

		} else {
			//cas non gérer
			console.error("Type of graph not available : ", $stateOfsideStore.graphType)	
		}
 
		console.debug(" > drawGraph ended in " + ((new Date()).getTime() - start.getTime()) + "ms")
		console.debug(" > drawGraph ended in " + ((new Date()).getTime() - startAbsolute.getTime()) + "ms since beginning")
	}


	function forceRefreshCache(){
		enrichedData = refreshEnrichedData($jsonElasticDataStore, $timelineStore)
	}

	// start scripting
	initiatePage()


</script>

<svelte:head>
	<title>Elastic Analyse</title>
	<meta name="description" content="Keycloak demo app"/>
</svelte:head>

<section><h1>Elastic</h1></section>

<content>

{#if browser && addAnother}
<UploadElastic initiateBinder={initiatePage}/>
{:else}
<side>
	{#if enrichedData}
	<Side fClientIds={enrichedData.allClientIds} fInstances={enrichedData.allInstances} fRequestTypes={Object.values(REQUEST_TYPE).sort()} 
		fErrorsByClientId={Object.values(ERROR_BY_CLIENTID_TYPE).sort()} fErrorsSoc={Object.values(ERROR_SOC_TYPE).sort()} 
		clientIdToInstance={enrichedData.clientIdToInstance} draw={drawGraph}/>
	{/if}
	<h2>Options</h2>
	<button class='myButton' on:click="{() => {addAnother = true}}">add Data</button>
	<!-- <button class='myButton' on:click="{() => {$jsonElasticDataStore = getEmptyElasticStore(); addAnother=true }}">clear localStorage</button> -->
	<button class='myButton' on:click={forceRefreshCache}>Forcer le refresh du cache applicatif</button>
</side>
<data>
	{#if $stateOfsideStore.sourceContainer == SOURCE_CONTAINER.TABLEUR}{#key datasetTableurByHits}
		<div >
			<h2>Key Resume</h2>
			<KeyResume datasets={datasetTableurByHits} borneMin={$jsonElasticDataStore.minDate} borneMax={$jsonElasticDataStore.maxDate}/>
		</div>
		<div >
			<h2>List of clientId</h2>
			<TableClientIdBy datasets={datasetTableurByHits}/>
		</div>
	{/key}
	{:else if $stateOfsideStore.graphType == GRAPH_TYPE.LINE} 
		<div class="chart-container">
			{#if $stateOfsideStore.sourceContainer == SOURCE_CONTAINER.HITS}
			<h2>Evolution des requetes dans le temps</h2>
			{:else if $stateOfsideStore.sourceContainer == SOURCE_CONTAINER.REQUEST_USERS}
			<h2>Evolution des utilisateurs dans le temps</h2>
			{:else if $stateOfsideStore.sourceContainer == SOURCE_CONTAINER.REQUEST_HITS_BY_USERS}
			<h2>Evolution du ratio hits par utilisateurs dans le temps</h2>
			{:else}
			<h2>Evolution des erreurs par ClientId dans le temps</h2>
			{/if}
			{#key datasetAndLimits}
				{#if $stateOfsideStore.isAgregate == DATA_TYPE.SUM_BY_DAY_OF_WEEK || $stateOfsideStore.isAgregate == DATA_TYPE.AVG_BY_DAY_OF_WEEK}
					<LineHitsByDayOWeek datasetAndLimits={datasetAndLimits} dataType={$stateOfsideStore.isAgregate}/>	
				{:else}
					<LineHitsAll datasetAndLimits={datasetAndLimits}/>	
				{/if}
			{/key}
			
		</div>
	{:else if $stateOfsideStore.graphType == GRAPH_TYPE.PIE && datasetsForPie}
		
		<div class="chart-container">
			<h2>Ratio des entrées sélectionnées</h2>
			{#key datasetsForPie}
			<PieCountersByError datasets={datasetsForPie} />
			{/key}
		</div>
	{/if}	

	
</data>
{/if}
</content>

<style>
content{
	width: 100%;
}
side{
	width: 20%;
	float: left;
}
data{
	width: 80%;
	float: left;
}
:global(.found){
	background-color: yellow;
}
.myButton{
	margin-top: 5vh;
}
.myButton {
	box-shadow:inset 0px 1px 0px 0px #f7c5c0;
	background:linear-gradient(to bottom, #fc8d83 5%, #e4685d 100%);
	background-color:#fc8d83;
	border-radius:6px;
	border:1px solid #d83526;
	display:inline-block;
	cursor:pointer;
	color:#ffffff;
	font-family:Arial;
	font-size:15px;
	font-weight:bold;
	padding:6px 24px;
	text-decoration:none;
	text-shadow:0px 1px 0px #b23e35;
}
.myButton:hover {
	background:linear-gradient(to bottom, #e4685d 5%, #fc8d83 100%);
	background-color:#e4685d;
}
.myButton:active {
	position:relative;
	top:1px;
}
.chart-container{
	height: 80vh;
	width: 100%;
	margin-bottom: 20vh;
}
:global(.marginAuto){
	margin:auto;
}
        


</style>
