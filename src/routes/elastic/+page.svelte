<script lang="ts">
    import { browser } from '$app/environment';
    import { getKeysOfClientIdElastic, type DatasetAndLimitsForLine, type datasetTableurHit, DATA_TYPE, type rawData, type minMax, ACTION_VAL, type GlobalState, GRAPH_TYPE, type LabelAndDatasetString, REQUEST_TYPE } from '$lib/elasticStruct';
    import { jsonElasticDataStore, jsonGitDataStore,  jsonConfigDataStore, timelineStore } from '$lib/store';
    import UploadElastic from './UploadElastic.svelte';
    import { getRawData, initTableur, processRawDataIntoMap as processRawDataIntoMap, getMinMax } from './datasetFactory';
    import { getEmptyElasticStore, getWhitelist } from './elasticStoreFactory';
    import KeyResume from './KeyResume.svelte';
    import TableClientIdBy from './TableClientIdBy.svelte';
    import LineHitsByAll from './LineHitsByAll.svelte';
    import LineHitsAll from './LineHitsAll.svelte';
    import SideHits from './sideHits.svelte';
    import { GroupByEngine, runEngine } from './groupByFactory';
    import PieCountersByError from './PieCountersByError.svelte';
    import { getConfigValue } from '../HydratationUtils';

	const WHITELIST = browser?getWhitelist(getConfigValue($jsonConfigDataStore).mapClientId):[]

	let addAnother = false
	
	let datasetAndLimits:DatasetAndLimitsForLine = emptyDatasetAndLimitsForLine()
	let datasetsForPie:LabelAndDatasetString[]
	let datasetTableurByHits:datasetTableurHit[] = []

	//Filters on left
	let fInstances:string[] = []
	let fClientIds:string[] = []
	let fRequestTypes:string[] = getKeysOfClientIdElastic().sort()
	let instanceToClientId:Map<string,string[]> = new Map<string,string[]>()

	let globalMap = new Map<string, Map<number, number>>()

	let globalState:GlobalState = {
		isSumOrDistinctByInstance : ACTION_VAL.SUM_BY_INSTANCE,
		isSumOrDistinctByClientId : ACTION_VAL.SUM_BY_CLIENTID,
		isSumOrDistinctByRequestType : ACTION_VAL.SUM_BY_REQUESTTYPE,
		graphType : GRAPH_TYPE.LINE,
		isAgregate : DATA_TYPE.SUM_BY_WEEK,
		selectedInstances: fInstances,
		selectedClientsId: fClientIds,
		selectedRequestsType: fRequestTypes
	}

	
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
		globalState.selectedInstances = fInstances

		drawGraph()
		console.debug("initiatePage ended in " + ((new Date()).valueOf() - start.valueOf()) + "ms since start")
	}

	function drawGraph(){
		let start = new Date()
		let minMax:minMax = {min:9000000,max:0}

		let engine = new GroupByEngine(globalState.isSumOrDistinctByInstance == ACTION_VAL.SUM_BY_INSTANCE, 
										globalState.isSumOrDistinctByClientId == ACTION_VAL.SUM_BY_CLIENTID, 
										globalState.isSumOrDistinctByRequestType == ACTION_VAL.SUM_BY_REQUESTTYPE, 
										globalState.selectedInstances,
										globalState.selectedClientsId,
										globalState.selectedRequestsType,
										globalState.isAgregate,
										instanceToClientId)
		let labelsAndDatasets = runEngine(engine, globalMap)

		if(globalState.graphType == GRAPH_TYPE.LINE){
			//reset dataset wrapper
			datasetAndLimits = emptyDatasetAndLimitsForLine()
			labelsAndDatasets.forEach(labelAndDataset => {
				minMax = getMinMax([labelAndDataset.data], minMax)
			});

			datasetAndLimits.labelsAndDatasets = labelsAndDatasets
			datasetAndLimits.min = minMax.min
			datasetAndLimits.max = minMax.max
		} else if (globalState.graphType == GRAPH_TYPE.PIE) {
			
			datasetsForPie = []
			let mapData = new Map<string, number>()
			labelsAndDatasets.forEach(labelAndDataset => {
				mapData.set(labelAndDataset.label, labelAndDataset.weight)
			});
			datasetsForPie.push({
				label:'Ratio by selected field',
				data:mapData
			})

		} else if (globalState.graphType == GRAPH_TYPE.TABLEUR) {
			datasetTableurByHits = initTableur($jsonElasticDataStore, $timelineStore, $jsonGitDataStore, WHITELIST, globalMap)
		} else {
			//cas non gérer
			console.error("Type of graph not available : ", globalState.graphType)	
		}

		console.debug(" > drawGraph ended in " + ((new Date()).getTime() - start.getTime()) + "ms since start")
	}

	function getAllRawData():Map<string, Map<number,number>>{
		let allRequestTypes = getKeysOfClientIdElastic()  
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
	<SideHits fClientIds={fClientIds} fInstances={fInstances} fRequestTypes={fRequestTypes} instanceToClientId={instanceToClientId}
			drawGraph={drawGraph} bind:sideState={globalState}/>
	
	<h2>Options</h2>
	<button class='myButton' on:click="{() => {addAnother = true}}">add Data</button>
	<button class='myButton' on:click="{() => {$jsonElasticDataStore = getEmptyElasticStore(); addAnother=true }}">clear localStorage</button>
</side>
<data>
	{#if globalState.graphType == GRAPH_TYPE.LINE} 
		<div class="chart-container">
			<h2>Evolution des requetes dans le temps</h2>
			{#key datasetAndLimits}
				{#if globalState.isAgregate == DATA_TYPE.SUM_BY_DAY_OF_WEEK || globalState.isAgregate == DATA_TYPE.AVG_BY_DAY_OF_WEEK}
					<LineHitsByAll datasetAndLimits={datasetAndLimits} dataType={globalState.isAgregate}/>	
				{:else}
					<LineHitsAll datasetAndLimits={datasetAndLimits}/>	
				{/if}
			{/key}
			
		</div>
	{:else if globalState.graphType == GRAPH_TYPE.PIE}
		
		<div class="chart-container">
			<h2>Ratio des entrées sélectionnées</h2>
			<PieCountersByError datasets={datasetsForPie} />
		</div>
	{:else if globalState.graphType == GRAPH_TYPE.TABLEUR}
		<div >
			<h2>Key Resume</h2>
			<KeyResume datasets={datasetTableurByHits} borneMin={$jsonElasticDataStore.minDate} borneMax={$jsonElasticDataStore.maxDate}/>
		</div>
		<div >
			<h2>List of clientId</h2>
			<TableClientIdBy datasets={datasetTableurByHits}/>
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
