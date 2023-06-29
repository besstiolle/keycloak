<script lang="ts">
    import { browser } from '$app/environment';
    import { REQUEST_TYPE, getKeysOfClientIdElastic, type datasetAndLimitsForLine, type datasetAndLimitsForPie, type datasetTableurHit, DATA_TYPE, type rawData, type minMax, ACTION_VAL, type GlobalState, type dataset } from '$lib/elasticStruct';
    import { jsonElasticDataStore, jsonDataStore, jsonHashNodeDataStore, jsonConfigDataStore } from '$lib/store';

    import UploadElastic from './UploadElastic.svelte';
    import { getRawData, initTableur, initiateDatasetFromStoreForLine, initiateDatasetFromStoreForPie, getHashKey, processRawDataIntoMap as processRawDataIntoMap, fusionMap, getMinMax } from './datasetFactory';
    import { getEmptyElasticStore } from './elasticStoreFactory';
    import KeyResume from './KeyResume.svelte';
    import TableClientIdBy from './TableClientIdBy.svelte';
    import type { commit } from '$lib/struct';
    import { getConfigValue, hydrate } from '../HydratationUtils';
    import LineHitsByAll from './LineHitsByAll.svelte';
    import LineHitsAll from './LineHitsAll.svelte';
    import Side from './side.svelte';

	let addAnother = false
	
	let datasetAndLimits:datasetAndLimitsForLine = emptyDatasetAndLimitsForLine()
	let datasetAndLimits5:datasetAndLimitsForPie = emptyDatasetAndLimitsForPie()
	let datasetTableurByHits:datasetTableurHit[] = []
	let lastCommit:commit

	//Filters on left
	let fInstances:string[] = []
	let fClientIds:string[] = []
	let fRequestTypes:string[] = getKeysOfClientIdElastic()
	let instanceToClientId:Map<string,string[]> = new Map<string,string[]>()

	let globalMap = new Map<string, Map<number, number>>()

	let globalState:GlobalState = {
		isSumOrDistinctByInstance : ACTION_VAL.SUM_BY_INSTANCE,
		isSumOrDistinctByClientId : ACTION_VAL.SUM_BY_CLIENTID,
		isSumOrDistinctByRequestType : ACTION_VAL.SUM_BY_REQUESTTYPE,
		isGraphType : ACTION_VAL.GRAPH_LINE,
		isAgregate : ACTION_VAL.BY_DAY,
		selectedInstances: fInstances,
		selectedClientsId: fClientIds,
		selectedRequestsType: fRequestTypes
	}

	
	function emptyDatasetAndLimitsForLine():datasetAndLimitsForLine{
		let datasetAndLimits:datasetAndLimitsForLine = {
			datasets:[],
			min:0,
			max:0
		}

		return datasetAndLimits
	}
	function emptyDatasetAndLimitsForPie():datasetAndLimitsForPie{
		let datasetAndLimits:datasetAndLimitsForPie = {
			datasets:[{label:"", data: new Map<string, number>()}]
		}

		return datasetAndLimits
	}

	function initiatePage(){
		if(!browser){
			return
		}
		let start = new Date()		
		addAnother = false
		lastCommit = hydrate($jsonDataStore, $jsonHashNodeDataStore)[0]

		initiateLineHitsAll()
		globalMap = getAllRawData()
		initiateFilters()
		globalState.selectedInstances = fInstances

		drawGraph()

		console.debug("initiatePage ended in " + ((new Date()).getMilliseconds() - start.getMilliseconds()) + "ms")
	}

	function drawGraph(){

		let dataTypeSelected:DATA_TYPE=DATA_TYPE.SUM_BY_DAY
		switch(globalState.isAgregate){
			case ACTION_VAL.BY_DAY:dataTypeSelected=DATA_TYPE.SUM_BY_DAY;break;
			case ACTION_VAL.BY_WEEK:dataTypeSelected=DATA_TYPE.SUM_BY_WEEK;break;
			case ACTION_VAL.BY_MONTH:dataTypeSelected=DATA_TYPE.SUM_BY_MONTH;break;
			case ACTION_VAL.BY_DAY_OF_WEEK:dataTypeSelected=DATA_TYPE.SUM_BY_DAY_OF_WEEK;break;
			case ACTION_VAL.BY_DAY_OF_YEAR:dataTypeSelected=DATA_TYPE.SUM_BY_DAY_OF_YEAR;break;
			default:console.info(globalState.isAgregate, "is not found")
		}

		let allPartials:Map<number, number>[] = []
		let allLabels:string[]=[]
		let minMax:minMax = {min:9000000,max:0}
		//reset dataset wrapper
		datasetAndLimits = emptyDatasetAndLimitsForLine()


		if(globalState.isSumOrDistinctByInstance == ACTION_VAL.SUM_BY_INSTANCE){
			for(let instance of globalState.selectedInstances){
				
				for(let requestType of globalState.selectedRequestsType){
					allPartials.push(globalMap.get(getHashKey(instance,null,requestType,dataTypeSelected)) as Map<number,number>)
				}
			}
			let partialMap = fusionMap(allPartials)
			minMax = getMinMax([partialMap])
			datasetAndLimits.datasets.push({label:"all Instances selected", data:partialMap})

		} else if (globalState.isSumOrDistinctByInstance == ACTION_VAL.DISTINCT_BY_INSTANCE && globalState.isSumOrDistinctByClientId == ACTION_VAL.SUM_BY_CLIENTID) {
			let potentialClientsId:string[] = []
			let partialOfInstance:Map<number, number>[]
			for(let instance of globalState.selectedInstances){
				potentialClientsId = instanceToClientId.get(instance) as string[]
				partialOfInstance = []
				for(let clientId of globalState.selectedClientsId){
					if(potentialClientsId.includes(clientId)){
						partialOfInstance.push(globalMap.get(getHashKey(null,clientId,null,dataTypeSelected)) as Map<number,number>)
					}
				}
				let partialMap = fusionMap(partialOfInstance)
				minMax = getMinMax([partialMap], minMax)
				datasetAndLimits.datasets.push({label:instance, data:partialMap})
			}
		} else if (globalState.isSumOrDistinctByClientId == ACTION_VAL.DISTINCT_BY_CLIENTID) {
			let partialOfClientId:Map<number, number>
			for(let clientId of globalState.selectedClientsId){
				//console.info(clientId)
				partialOfClientId = globalMap.get(getHashKey(null,clientId,null,dataTypeSelected)) as Map<number,number>
				minMax = getMinMax([partialOfClientId], minMax)
				datasetAndLimits.datasets.push({label:clientId, data:partialOfClientId})
			}
			
		} else {
			
			//TODO

		}



		//minMax + [label + dataset.data]


		datasetAndLimits.min = minMax.min
		datasetAndLimits.max = minMax.max

	}

	function test(instances:string[], clientIds:string[], requestsType:string[], dataTypeSelected:string, globalState:GlobalState):dataset[]{
		let maps:Map<number,number>[] = []
		let doFusion = (globalState.isSumOrDistinctByInstance == ACTION_VAL.SUM_BY_INSTANCE)
		let label = ""
		let labels:string[] = []

		if(instances.length == 0) {
			maps.concat(test2(null, clientIds, requestsType, dataTypeSelected))
			label = "All Instances"
		}
		for(let instance of instances){
			if(doFusion){

			}
			maps.concat(test2(instance, clientIds, requestsType, dataTypeSelected))
		}
		
	}

	function test2(instance:string|null, clientIds:string[], requestsType:string[], dataTypeSelected:string):Map<number,number>[]{
		let maps:Map<number,number>[] = []
		let labelAndMaps:LabelAndMaps
		let doFusion = (globalState.isSumOrDistinctByInstance == ACTION_VAL.SUM_BY_CLIENTID)
		let label = ""
		let labels:string[] = []
		if(clientIds.length == 0) {
			labelAndMaps = test3(instance, null, requestsType, dataTypeSelected)
			
			maps = maps.concat(labelAndMaps.maps)
			labels = labelAndMaps.labels // No modifications
		}
		for(let clientId of clientIds){
			labelAndMaps = test3(instance, clientId, requestsType, dataTypeSelected)
			maps = maps.concat(labelAndMaps.maps)
		}
		
		return maps
	}

	function test3(instance:string|null, clientId:string|null, requestsType:string[], dataTypeSelected:string):LabelAndMaps{
		let map = new Map<number,number>()
		let maps:Map<number,number>[] = []
		let doFusion = (globalState.isSumOrDistinctByInstance == ACTION_VAL.SUM_BY_REQUESTTYPE)
		let label = ""
		let labels:string[] = []
		if(requestsType.length == 0) {
			maps.push(globalMap.get(getHashKey(instance,clientId,null,dataTypeSelected)) as Map<number,number>)
			label = '' // Pas de filtre souhaité, on n'affiche pas le détail
		}
		for(let requestType of requestsType){
			maps.push(globalMap.get(getHashKey(instance,clientId,requestType,dataTypeSelected)) as Map<number,number>)
			labels.push(requestType)
		}
		if(doFusion){
			labels = [''] //Si on fusionne toutes les requestsType, on ne détaille pas le contenu dans les données
			maps = [fusionMap(maps)]
		} 
		return {labels:labels,maps:maps}
	}

	interface LabelAndMaps{
		labels:string[]
		maps:Map<number,number>[]
	}

	function debugMe(map:Map<string, Map<number,number>>, key:string){
		if(!map.has(key)){
			console.info("key inconnue : " + key)
			return
		}
		let sum = 0;

		(map.get(key) as Map<number,number>).forEach((value,key) => {
			sum += value
		})

		console.info("key : "+key+" somme : " + sum)
	}

	function getAllRawData():Map<string, Map<number,number>>{
		let allRequestTypes = getKeysOfClientIdElastic()  
		let rawData:rawData
		let map = new Map<string, Map<number,number>>()

		$jsonElasticDataStore.container.forEach(clientId => {
			for(const requestType of allRequestTypes){
				rawData = getRawData(clientId[requestType] as number[][][][], new Date($jsonElasticDataStore.minDate), new Date($jsonElasticDataStore.maxDate))
				map = processRawDataIntoMap(map, rawData, clientId.instance, clientId.clientId, requestType)
			}
			
		})

		return map
		
		
	}

	function initiateLineHitsAll(){
		//console.info("initiateLineHitsAll >", $jsonElasticDataStore)
		//datasetAndLimits1 = initiateDatasetFromStoreForLine($jsonElasticDataStore, REQUEST_TYPE.STRONGBOX)
		//datasetAndLimits2 = initiateDatasetFromStoreForLine($jsonElasticDataStore, REQUEST_TYPE.HABILITATIONS)
		//datasetAndLimits3 = initiateDatasetFromStoreForLine($jsonElasticDataStore, REQUEST_TYPE.CLIENT_LOGIN)
		//datasetAndLimits4 = initiateDatasetFromStoreForLine($jsonElasticDataStore, REQUEST_TYPE.LOGIN_ERROR)
		//datasetAndLimits5 = initiateDatasetFromStoreForPie($jsonElasticDataStore)
		datasetTableurByHits = initTableur($jsonElasticDataStore, lastCommit, getWhitelist(getConfigValue($jsonConfigDataStore).mapClientId))
	}

	function getWhitelist(map:string):string[]{
		if(map == undefined || map.trim() === ''){
			return []
		}
		let lines = map.split('\n')
		let vals:string[]
		let keys:string[] = []
		lines.forEach(line => {
			vals = line.split('=')
			keys.push(vals[0])
		});
		//console.info(keys)
		return keys
	}

	function initiateFilters(){
		let listOfClientIdForInstance:string[] = []
		$jsonElasticDataStore.container.forEach(clientId => {
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
	<Side fClientIds={fClientIds} fInstances={fInstances} fRequestTypes={fRequestTypes} instanceToClientId={instanceToClientId}
			drawGraph={drawGraph} bind:sideState={globalState}/>
	
	<h2>Options</h2>
	<button class='myButton' on:click="{() => {addAnother = true}}">add Data</button>
	<button class='myButton' on:click="{() => {$jsonElasticDataStore = getEmptyElasticStore(); addAnother=true }}">clear localStorage</button>
</side>
<data>
	<div class="chart-container">
		<h2>Evolution des requetes dans le temps</h2>
		{#key datasetAndLimits}
			{#if globalState.isAgregate == ACTION_VAL.BY_DAY_OF_WEEK}
				<LineHitsByAll datasets={datasetAndLimits.datasets} borneMin={datasetAndLimits.min} borneMax={datasetAndLimits.max} dataType={DATA_TYPE.SUM_BY_DAY_OF_WEEK}/>	
			{:else}
				<LineHitsAll datasets={datasetAndLimits.datasets} borneMin={datasetAndLimits.min} borneMax={datasetAndLimits.max} dataType={DATA_TYPE.SUM_BY_DAY}/>	
			{/if}
		{/key}
		
	</div>
	<!--<div >
		<h2>Key Resume</h2>
		<KeyResume datasets={datasetTableurByHits} borneMin={$jsonElasticDataStore.minDate} borneMax={$jsonElasticDataStore.maxDate}/>
	</div>
	<div >
		<h2>List of clientId</h2>
		<TableClientIdBy datasets={datasetTableurByHits}/>
	</div>-->

	
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
