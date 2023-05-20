<script lang="ts">
    import { browser } from '$app/environment';
    import { CSV_TYPE, REQUEST_TYPE, type datasetAndLimits } from '$lib/elasticStruct';
    import { jsonElasticDataStore } from '$lib/store';
    import LineHitsAll from './LineHitsAll.svelte';
    import UploadElastic from './UploadElastic.svelte';
    import { initiateDatasetFromStore } from './datasetFactory';
    import { getEmptyElasticStore } from './elasticStoreFactory';

	let addAnother = false
	
	let datasetAndLimits1:datasetAndLimits = emptyDatasetAndLimits()
	let datasetAndLimits2:datasetAndLimits = emptyDatasetAndLimits()
	let datasetAndLimits3:datasetAndLimits = emptyDatasetAndLimits()
	let datasetAndLimits4:datasetAndLimits = emptyDatasetAndLimits()
	
	function emptyDatasetAndLimits():datasetAndLimits{
		let datasetAndLimits:datasetAndLimits = {
			datasets:[{label:"", data: new Map<number, number>()}],
			min:0,
			max:0
		}

		return datasetAndLimits
	}

	function initiateJson(){
		if(!browser){
			return
		}
		
		addAnother = false
		let start = new Date()

		initiateLineHitsAll()

		console.debug("initiateJson ended in " + ((new Date()).getMilliseconds() - start.getMilliseconds()) + "ms")
	}

	function initiateLineHitsAll(){
		//console.info("initiateLineHitsAll >", $jsonElasticDataStore)
		datasetAndLimits1 = initiateDatasetFromStore($jsonElasticDataStore, REQUEST_TYPE.STRONGBOX)
		datasetAndLimits2 = initiateDatasetFromStore($jsonElasticDataStore, REQUEST_TYPE.HABILITATIONS)
		datasetAndLimits3 = initiateDatasetFromStore($jsonElasticDataStore, REQUEST_TYPE.CLIENT_LOGIN)
		datasetAndLimits4 = initiateDatasetFromStore($jsonElasticDataStore, REQUEST_TYPE.LOGIN_ERROR)
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
