<script lang="ts">
    import { browser } from '$app/environment';
    import { ERROR_BY_CLIENTID_TYPE, ERROR_SOC_TYPE, REQUEST_TYPE, type clientIdElastic, type clientIdError } from '$lib/elasticStruct';
    import { jsonElasticDataStore, timelineStore } from '$lib/store';
    import Subpage from './Subpage.svelte';
    const clientIdLabel = 'isi'
	const clientIdWithRequestType = $jsonElasticDataStore.containerClientId.get(clientIdLabel) as clientIdElastic
	const clientIdWithErrorsByClientId = $jsonElasticDataStore.containerErrorsByClientId.get(clientIdLabel) as clientIdError
	const errorsBySoc:Record<string, any> = {}
	
	$jsonElasticDataStore.containerErrorsSoc.forEach((value, key) => {
		errorsBySoc[key] = value
	})

	function toDate(ts:number):string{
		let date = new Date(ts)
		return date.getDate()+'/'+(date.getMonth()+1)+'/'+date.getFullYear()+" "+date.getHours()+"h"
	}

	let state:number=0 //0 = RequestType, 1 = ErrorByClientId, 2 = ErrorSoc

</script>

<svelte:head>
	<title>Debug</title>
	<meta name="description" content="Keycloak demo app"/>
</svelte:head>

<section><h1>Debug {#if state == 0 || state == 1}for {clientIdLabel}{/if}</h1></section>

<content>

{#if browser}
	<button class:button-on={state === 0} on:click={() => state = 0}>Request Type</button>
	<button class:button-on={state === 1} on:click={() => state = 1}>Errors By ClientID</button>
	<button class:button-on={state === 2} on:click={() => state = 2}>Errors Societaire</button>
	{#if state == 0}
		<Subpage arr={clientIdWithRequestType} keys={Object.values(REQUEST_TYPE)} timeline={$timelineStore} toDate={toDate}/>
	{/if}
	{#if state == 1}
		<Subpage arr={clientIdWithErrorsByClientId} keys={Object.values(ERROR_BY_CLIENTID_TYPE)} timeline={$timelineStore} toDate={toDate}/>
	{/if}
	{#if state == 2}
		<Subpage arr={errorsBySoc} keys={Object.values(ERROR_SOC_TYPE)} timeline={$timelineStore} toDate={toDate}/>
	{/if}
{/if}
</content>

<style>

/* CSS https://getcssscan.com/css-buttons-examples */
button {
  appearance: none;
  background-color: #FAFBFC;
  border: 1px solid rgba(27, 31, 35, 0.15);
  border-radius: 6px;
  box-shadow: rgba(27, 31, 35, 0.04) 0 1px 0, rgba(255, 255, 255, 0.25) 0 1px 0 inset;
  box-sizing: border-box;
  color: #24292E;
  cursor: pointer;
  display: inline-block;
  font-family: -apple-system, system-ui, "Segoe UI", Helvetica, Arial, sans-serif, "Apple Color Emoji", "Segoe UI Emoji";
  font-size: 14px;
  font-weight: 500;
  line-height: 20px;
  list-style: none;
  padding: 6px 16px;
  position: relative;
  text-align: center;
  text-decoration: none;
  transition: background-color 0.2s cubic-bezier(0.3, 0, 0.5, 1);
  user-select: none;
  -webkit-user-select: none;
  touch-action: manipulation;
  vertical-align: middle;
  white-space: nowrap;
  word-wrap: break-word;
}

button:hover {
  background-color: #F3F4F6;
  text-decoration: none;
  transition-duration: 0.1s;
}

button:disabled {
  background-color: #FAFBFC;
  border-color: rgba(27, 31, 35, 0.15);
  color: #959DA5;
  cursor: default;
}

button:active {
  background-color: #EDEFF2;
  box-shadow: rgba(225, 228, 232, 0.2) 0 1px 0 inset;
  transition: none 0s;
}

button:focus {
  outline: 1px transparent;
}

button:before {
  display: none;
}

button:-webkit-details-marker {
  display: none;
}

/*********** Button "On" ************/
button.button-on{
  background-color: #2ea44f;
  border: 1px solid rgba(27, 31, 35, .15);
  box-shadow: rgba(27, 31, 35, .1) 0 1px 0;
  color: #fff;
  font-weight: 600;
}

button.button-on:hover {
  background-color: #2c974b;
}

button.button-on:disabled {
  background-color: #94d3a2;
  border-color: rgba(27, 31, 35, .1);
  color: rgba(255, 255, 255, .8);
}

button.button-on:active {
  background-color: #298e46;
  box-shadow: rgba(20, 70, 32, .2) 0 1px 0 inset;
}

button.button-on:focus {
  box-shadow: rgba(46, 164, 79, .4) 0 0 0 3px;
  outline: none;
}

</style>