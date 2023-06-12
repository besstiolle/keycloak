<script lang="ts">
    import { browser } from '$app/environment';
    import { REQUEST_TYPE, type datasetAndLimitsForLine, type datasetAndLimitsForPie, type datasetTableurHit } from '$lib/elasticStruct';
    import { jsonElasticDataStore, jsonDataStore, jsonHashNodeDataStore, jsonConfigDataStore } from '$lib/store';
    import LineHitsAll from './LineHitsAll.svelte';
    import PieCountersByError from './PieCountersByError.svelte';
    import UploadElastic from './UploadElastic.svelte';
    import { initTableur, initiateDatasetFromStoreForLine, initiateDatasetFromStoreForPie } from './datasetFactory';
    import { getEmptyElasticStore } from './elasticStoreFactory';
    import KeyResume from './KeyResume.svelte';
    import TableClientIdBy from './TableClientIdBy.svelte';
    import type { commit } from '$lib/struct';
    import { getConfigValue, hydrate } from '../HydratationUtils';

	let addAnother = false
	
	let datasetAndLimits1:datasetAndLimitsForLine = emptyDatasetAndLimitsForLine()
	let datasetAndLimits2:datasetAndLimitsForLine = emptyDatasetAndLimitsForLine()
	let datasetAndLimits3:datasetAndLimitsForLine = emptyDatasetAndLimitsForLine()
	let datasetAndLimits4:datasetAndLimitsForLine = emptyDatasetAndLimitsForLine()
	let datasetAndLimits5:datasetAndLimitsForPie = emptyDatasetAndLimitsForPie()
	let datasetTableurByHits:datasetTableurHit[] = []
	let lastCommit:commit
	
	function emptyDatasetAndLimitsForLine():datasetAndLimitsForLine{
		let datasetAndLimits:datasetAndLimitsForLine = {
			datasets:[{label:"", data: new Map<number, number>()}],
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

	function initiateJson(){
		if(!browser){
			return
		}
		
		addAnother = false
		let start = new Date()

		lastCommit = hydrate($jsonDataStore, $jsonHashNodeDataStore)[0]

		initiateLineHitsAll()


		console.debug("initiateJson ended in " + ((new Date()).getMilliseconds() - start.getMilliseconds()) + "ms")
	}

	function initiateLineHitsAll(){
		//console.info("initiateLineHitsAll >", $jsonElasticDataStore)
		datasetAndLimits1 = initiateDatasetFromStoreForLine($jsonElasticDataStore, REQUEST_TYPE.STRONGBOX)
		datasetAndLimits2 = initiateDatasetFromStoreForLine($jsonElasticDataStore, REQUEST_TYPE.HABILITATIONS)
		datasetAndLimits3 = initiateDatasetFromStoreForLine($jsonElasticDataStore, REQUEST_TYPE.CLIENT_LOGIN)
		datasetAndLimits4 = initiateDatasetFromStoreForLine($jsonElasticDataStore, REQUEST_TYPE.LOGIN_ERROR)
		datasetAndLimits5 = initiateDatasetFromStoreForPie($jsonElasticDataStore)
		datasetTableurByHits = initTableur($jsonElasticDataStore, lastCommit, getWhitelist(getConfigValue($jsonConfigDataStore).mapClientId))
	}

	function getWhitelist(map:string):string[]{
		let lines = map.split('\n')
		let vals:string[]
		let keys:string[] = []
		lines.forEach(line => {
			vals = line.split('=')
			keys.push(vals[0])
		});
		console.info(keys)
		return keys
	}

	// start scripting
	initiateJson()


</script>

<svelte:head>
	<title>Elastic Analyse</title>
	<meta name="description" content="Keycloak demo app"/>
</svelte:head>

<section><h1>Elastic</h1></section>

<content>

{#if browser && addAnother}
<UploadElastic initiateBinder={initiateJson}/>
{:else}
<side>
	<h2>Options</h2>
	<button class='myButton' on:click="{() => {addAnother = true}}">add Data</button>
	<button class='myButton' on:click="{() => {$jsonElasticDataStore = getEmptyElasticStore(); addAnother=true }}">clear localStorage</button>
</side>
<data>
	<div class="chart-container">
		<h2>Evolution des requetes Strongbox dans le temps</h2>
		<LineHitsAll datasets={datasetAndLimits1.datasets} borneMin={datasetAndLimits1.min} borneMax={datasetAndLimits1.max} />
	</div>
	<div class="chart-container">
		<h2>Evolution des requetes Habilitation dans le temps</h2>
		<LineHitsAll datasets={datasetAndLimits2.datasets} borneMin={datasetAndLimits2.min} borneMax={datasetAndLimits2.max} />
	</div>
	<div class="chart-container">
		<h2>Evolution des requetes CLIENT_LOGIN dans le temps</h2>
		<LineHitsAll datasets={datasetAndLimits3.datasets} borneMin={datasetAndLimits3.min} borneMax={datasetAndLimits3.max} />
	</div>
	<div class="chart-container">
		<h2>Evolution des requetes LOGIN_ERROR dans le temps</h2>
		<LineHitsAll datasets={datasetAndLimits4.datasets} borneMin={datasetAndLimits4.min} borneMax={datasetAndLimits4.max} />
	</div>
	<div class="chart-container">
		<h2>Top 10 des Erreurs rencontrées sur la période</h2>
		<PieCountersByError datasets={datasetAndLimits5.datasets} />
	</div>
	<div >
		<h2>Key Resume</h2>
		<KeyResume datasets={datasetTableurByHits} borneMin={$jsonElasticDataStore.minDate} borneMax={$jsonElasticDataStore.maxDate}/>
	</div>
	<div >
		<h2>List of clientId</h2>
		<TableClientIdBy datasets={datasetTableurByHits}/>
	</div>

	
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
