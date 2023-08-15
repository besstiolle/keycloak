<script lang="ts">
    import { browser } from '$app/environment';
    import { type DatasetAndLimitsForLine, type datasetTableurHit, DATA_TYPE, type rawData, type minMax, ACTION_VAL, GRAPH_TYPE, type LabelAndDatasetString, SOURCE_CONTAINER, type DisplaybleItems, REQUEST_TYPE, ERROR_BY_CLIENTID_TYPE } from '$lib/elasticStruct';
    import { jsonElasticDataStore, jsonGitDataStore,  jsonConfigDataStore, timelineStore, stateOfsideStore } from '$lib/store';
    import UploadElastic from './UploadElastic.svelte';
    import { getRawData, initTableur, processRawDataIntoMap, getMinMax } from './datasetFactory';
    import { getEmptyElasticStore } from './elasticStoreFactory';
    import KeyResume from './KeyResume.svelte';
    import TableClientIdBy from './TableClientIdBy.svelte';
    import LineHitsAll from './LineHitsAll.svelte';
    import Side from './side.svelte';
    import PieCountersByError from './PieCountersBySetOfElements.svelte';
    import LineHitsByDayOWeek from './LineHitsByDayOWeek.svelte';
    import { GroupByCollectionEngine, runGroupByCollectionEngine } from './groupByCollectionFactory';

	let addAnother = false
	
	let datasetAndLimits:DatasetAndLimitsForLine = emptyDatasetAndLimitsForLine()
	let datasetsForPie:LabelAndDatasetString[]
	let datasetTableurByHits:datasetTableurHit[] = []

	//Filters on left
	let fInstances:string[] = []
	let fClientIds:string[] = []
	let fRequestTypes:string[] = Object.values(REQUEST_TYPE).sort()
	let fErrorsByClientId:string[] = Object.values(ERROR_BY_CLIENTID_TYPE).sort()
	let instanceToClientId = new Map<string,string[]>()
	let clientIdToInstance = new Map<string,string>()

	let globalMap = new Map<string, Map<number, number>>()


	let idTimeout:NodeJS.Timeout|number = 0
    stateOfsideStore.subscribe(value => {idTimeout = prepareForDrawing(idTimeout)})

	
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
		let start = new Date()

		addAnother = false

		globalMap = getAllRawData()
		console.debug("getAllRawData ended in " + ((new Date()).valueOf() - start.valueOf()) + "ms since start")

		initiateFilters()
		console.debug("initiateFilters ended in " + ((new Date()).valueOf() - start.valueOf()) + "ms since start")

		console.debug("initiatePage ended in " + ((new Date()).valueOf() - start.valueOf()) + "ms since start")
	}
	
	function prepareForDrawing(id:NodeJS.Timeout|number){
		if(id){clearTimeout(id)}
		id = setTimeout(() => {drawGraph()}, 100)
		return id
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
		if($stateOfsideStore.sourceContainer == SOURCE_CONTAINER.HITS){
			engine = new GroupByCollectionEngine($stateOfsideStore.isSumOrDistinctByInstance == ACTION_VAL.SUM_BY_INSTANCE, 
										$stateOfsideStore.isSumOrDistinctByClientId == ACTION_VAL.SUM_BY_CLIENTID, 
										$stateOfsideStore.isSumOrDistinctByRequestType == ACTION_VAL.SUM_BY_REQUESTTYPE, 
										selectedAndVisibleItemsFromMap($stateOfsideStore.instances),
										selectedAndVisibleItemsFromMap($stateOfsideStore.clientIds),
										selectedAndVisibleItemsFromMap($stateOfsideStore.requestsType),
										$stateOfsideStore.isAgregate,
										instanceToClientId)

		} else {
			engine = new GroupByCollectionEngine($stateOfsideStore.isSumOrDistinctByInstance == ACTION_VAL.SUM_BY_INSTANCE, 
											$stateOfsideStore.isSumOrDistinctByClientId == ACTION_VAL.SUM_BY_CLIENTID, 
											$stateOfsideStore.isSumOrDistinctByErrorsByClientId == ACTION_VAL.SUM_BY_ERRORSBYCLIENTID, 
											selectedAndVisibleItemsFromMap($stateOfsideStore.instances),
											selectedAndVisibleItemsFromMap($stateOfsideStore.clientIds),
											selectedAndVisibleItemsFromMap($stateOfsideStore.errorsByClientId),
											$stateOfsideStore.isAgregate,
											instanceToClientId)
		}

		let labelsAndDatasets = runGroupByCollectionEngine(engine, globalMap)

		if ($stateOfsideStore.sourceContainer == SOURCE_CONTAINER.TABLEUR) {
			datasetTableurByHits = initTableur($jsonElasticDataStore, $timelineStore, $jsonGitDataStore, $jsonConfigDataStore, globalMap)
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
 
		console.debug(" > drawGraph ended in " + ((new Date()).getTime() - start.getTime()) + "ms since start")
	}

	function getAllRawData():Map<string, Map<number,number>>{
		let allRequestTypes = Object.values(REQUEST_TYPE).sort()
		let allErrorsByClientid = Object.values(ERROR_BY_CLIENTID_TYPE).sort()
		//let allErrors = getK
		let rawData:rawData
		let map = new Map<string, Map<number,number>>()
		let start = new Date($jsonElasticDataStore.minDate)
		let end = new Date($jsonElasticDataStore.maxDate)

		start.setHours(0)
		end.setHours(0)

		$jsonElasticDataStore.containerClientId.forEach(clientId => {
			for(const requestType of allRequestTypes){
				rawData = getRawData(clientId[requestType] as number[], $timelineStore)
				map = processRawDataIntoMap(map, rawData, clientId.instance, clientId.clientId, requestType)
			}
		})
		$jsonElasticDataStore.containerErrorsByClientId.forEach(clientId => {
			for(const errorByClientId of allErrorsByClientid){
				rawData = getRawData(clientId[errorByClientId] as number[], $timelineStore)
				map = processRawDataIntoMap(map, rawData, clientId.instance, clientId.clientId, errorByClientId)
			}
		})
		return map
		
	}


	function initiateFilters(){
		let listOfClientIdForInstance:string[] = []
		$jsonElasticDataStore.containerClientId.forEach(clientId => {
			if(!fClientIds.includes(clientId.clientId)){
				fClientIds.push(clientId.clientId)
			}
			if(!fInstances.includes(clientId.instance)){
				fInstances.push(clientId.instance)
			}

			if(!instanceToClientId.has(clientId.instance)){
				instanceToClientId.set(clientId.instance, [])
			}

			listOfClientIdForInstance = instanceToClientId.get(clientId.instance) as string[]
			if(!listOfClientIdForInstance.includes(clientId.clientId)){
				listOfClientIdForInstance.push(clientId.clientId)
			}
			instanceToClientId.set(clientId.instance, listOfClientIdForInstance)
			clientIdToInstance.set(clientId.clientId, clientId.instance)
		});

		fInstances.sort()
		fClientIds.sort()
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
	<Side fClientIds={fClientIds} fInstances={fInstances} fRequestTypes={fRequestTypes} clientIdToInstance={clientIdToInstance} fErrorsByClientId={fErrorsByClientId} />
	
	<h2>Options</h2>
	<button class='myButton' on:click="{() => {addAnother = true}}">add Data</button>
	<button class='myButton' on:click="{() => {$jsonElasticDataStore = getEmptyElasticStore(); addAnother=true }}">clear localStorage</button>
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
