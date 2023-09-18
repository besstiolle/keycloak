<script lang="ts">
    import { jsonGitDataStore, jsonConfigDataStore, stateOfsideStore } from "$lib/store";
    import { onMount } from "svelte";
    import FilterBlock3 from "../FilterBlock3.svelte";
    import { ACTION_VAL, DATA_TYPE, GRAPH_TYPE, SOURCE_CONTAINER, TRINAIRE_VAL, type DisplaybleItems } from "./sideStateFactory";
    import { SmellEngine } from "./smellEngine";
    import { FriendlyName } from "./friendlyName";

    export let clientIdToInstance:Map<string,string>

    export let fInstances:string[]
    export let fClientIds:string[]
    export let fErrorsByClientId:string[]
    export let fRequestTypes:string[] 
    export let fErrorsSoc:string[]
    export let draw:Function
    
    let smellEngine = new SmellEngine($jsonGitDataStore, $jsonConfigDataStore)
    let previousStateSmells = TRINAIRE_VAL.UNDEF
    let listOfClientidToHideBecauseOfSmellCondifuration:string[] = []
    function updateShowSmell(value:TRINAIRE_VAL){
      $stateOfsideStore.showSmell = value
      if(previousStateSmells !== value){
        previousStateSmells = value
        listOfClientidToHideBecauseOfSmellCondifuration = []
        if(value === TRINAIRE_VAL.TRUE){        //Show only smell
          fClientIds.forEach(clientId=>{
            if(smellEngine.isSmellByLabel(clientId)){
              listOfClientidToHideBecauseOfSmellCondifuration.push(clientId)  
            }
          })
        } else if(value === TRINAIRE_VAL.FALSE){ //don't Show smell
          fClientIds.forEach(clientId=>{
            if(!smellEngine.isSmellByLabel(clientId)){
              listOfClientidToHideBecauseOfSmellCondifuration.push(clientId)  
            }
          })
        } else {                                                        // Show all
          //Nothing to do
        }

        //Refresh status of clientId 
        callbackInstances(new Map($stateOfsideStore.instances))
      }
    }

    //Force l'état "somme" du clientid si l'instant est toujours en "somme"
    function updateStatusOfSumOrDistinctClient(action:ACTION_VAL){
      $stateOfsideStore.isSumOrDistinctByInstance = action
      if($stateOfsideStore.isSumOrDistinctByInstance === ACTION_VAL.SUM_BY_INSTANCE && $stateOfsideStore.isSumOrDistinctByClientId === ACTION_VAL.DISTINCT_BY_CLIENTID){
        $stateOfsideStore.isSumOrDistinctByClientId = ACTION_VAL.SUM_BY_CLIENTID
      }
    }
    
  /**
   * Transforme un array d'item au format string dans une map de DisplaybleItm initialisé à true
   * @param arr
   */
  function fromStringArrayToMapStringDisplaybleItems(arr:string[]):Map<string,DisplaybleItems>{
    let map = new Map<string, DisplaybleItems>()

    arr.forEach(item =>{
      map.set(item, {isChecked:true, isVisible:true, value:item} )
    })

    return map
  }

  $stateOfsideStore.instances = fromStringArrayToMapStringDisplaybleItems(fInstances)
  $stateOfsideStore.clientIds = fromStringArrayToMapStringDisplaybleItems(fClientIds)
  $stateOfsideStore.requestsType = fromStringArrayToMapStringDisplaybleItems(fRequestTypes)
  $stateOfsideStore.errorsByClientId = fromStringArrayToMapStringDisplaybleItems(fErrorsByClientId)
  $stateOfsideStore.errorsSoc = fromStringArrayToMapStringDisplaybleItems(fErrorsSoc)

  function callbackInstancesAndDraw(map:Map<string, DisplaybleItems>){
    callbackInstances(map)
    draw()
  }
  function callbackRequetsTypeAndDraw(map:Map<string, DisplaybleItems>){
    callbackRequetsType(map)
    draw()
  }
  function callbackClientsIdAndDraw(map:Map<string, DisplaybleItems>){
    callbackClientsId(map)
    draw()
  }
  function callbackErrorsByClientIdAndDraw(map:Map<string, DisplaybleItems>){
    callbackErrorsByClientId(map)
    draw()
  }
  function callbackErrorsSocAndDraw(map:Map<string, DisplaybleItems>){
    callbackErrorsSoc(map)
    draw()
  }

  function callbackInstances(map:Map<string, DisplaybleItems>){
    let disp:DisplaybleItems
    $stateOfsideStore.clientIds.forEach((displaybleItem, key) => {
      disp = $stateOfsideStore.clientIds.get(key) as DisplaybleItems
      disp.isVisible = (map.get(clientIdToInstance.get(key) as string) as DisplaybleItems).isChecked 
                        && (listOfClientidToHideBecauseOfSmellCondifuration.length == 0 
                              || listOfClientidToHideBecauseOfSmellCondifuration.includes(key))
      $stateOfsideStore.clientIds.set(key, disp)
    })
    $stateOfsideStore.instances = map
  }
  function callbackClientsId(map:Map<string, DisplaybleItems>){
    $stateOfsideStore.clientIds = map
  }
  function callbackRequetsType(map:Map<string, DisplaybleItems>){
    $stateOfsideStore.requestsType = map
  }
  function callbackErrorsByClientId(map:Map<string, DisplaybleItems>){
    $stateOfsideStore.errorsByClientId = map
  }
  function callbackErrorsSoc(map:Map<string, DisplaybleItems>){
    $stateOfsideStore.errorsSoc = map
  }

  onMount(async () => {
		draw()
	});

  function dummyFunction(str:string){return str}
</script>

<div>
  <button class:button-on={$stateOfsideStore.sourceContainer === SOURCE_CONTAINER.HITS} on:click={() => {$stateOfsideStore.sourceContainer = SOURCE_CONTAINER.HITS;draw()}}>Hits</button>
  <button class:button-on={$stateOfsideStore.sourceContainer === SOURCE_CONTAINER.REQUEST_USERS} on:click={() => {$stateOfsideStore.sourceContainer = SOURCE_CONTAINER.REQUEST_USERS;draw()}}>Users</button>
  <button class:button-on={$stateOfsideStore.sourceContainer === SOURCE_CONTAINER.REQUEST_HITS_BY_USERS} on:click={() => {$stateOfsideStore.sourceContainer = SOURCE_CONTAINER.REQUEST_HITS_BY_USERS;draw()}}>x̄ Hits by Users</button>
  <button class:button-on={$stateOfsideStore.sourceContainer === SOURCE_CONTAINER.ERRORS_BY_CLIENTID} on:click={() => {$stateOfsideStore.sourceContainer = SOURCE_CONTAINER.ERRORS_BY_CLIENTID;draw()}}>Errors By ClientId</button>
  <button class:button-on={$stateOfsideStore.sourceContainer === SOURCE_CONTAINER.ERRORS_SOC} on:click={() => {$stateOfsideStore.sourceContainer = SOURCE_CONTAINER.ERRORS_SOC;draw()}}>Errors Societaire</button>
  <button class:button-on={$stateOfsideStore.sourceContainer === SOURCE_CONTAINER.TABLEUR} on:click={() => {$stateOfsideStore.sourceContainer = SOURCE_CONTAINER.TABLEUR;draw()}}>Rapport</button>
  <hr/>
</div>

{#if $stateOfsideStore.sourceContainer !== SOURCE_CONTAINER.TABLEUR}
<div>
  <button class:button-on={$stateOfsideStore.graphType === GRAPH_TYPE.LINE} on:click={() => {$stateOfsideStore.graphType = GRAPH_TYPE.LINE;draw()}}>Lines</button>
  <button class:button-on={$stateOfsideStore.graphType === GRAPH_TYPE.PIE} on:click={() => {$stateOfsideStore.graphType = GRAPH_TYPE.PIE;draw()}}>Charts</button>
  
  <hr/>
</div>
{/if}
{#if $stateOfsideStore.sourceContainer !== SOURCE_CONTAINER.TABLEUR}
<div>
  <button class:button-on={$stateOfsideStore.isAgregate === DATA_TYPE.SUM_BY_DAY} on:click={() => {$stateOfsideStore.isAgregate = DATA_TYPE.SUM_BY_DAY;draw()}}>By Day</button>
  <button class:button-on={$stateOfsideStore.isAgregate === DATA_TYPE.SUM_BY_WEEK} on:click={() => {$stateOfsideStore.isAgregate = DATA_TYPE.SUM_BY_WEEK;draw()}}>By Week</button>
  <button class:button-on={$stateOfsideStore.isAgregate === DATA_TYPE.SUM_BY_MONTH} on:click={() => {$stateOfsideStore.isAgregate = DATA_TYPE.SUM_BY_MONTH;draw()}}>By Month</button>
  <button class:button-on={$stateOfsideStore.isAgregate === DATA_TYPE.SUM_BY_DAY_OF_WEEK} on:click={() => {$stateOfsideStore.isAgregate = DATA_TYPE.SUM_BY_DAY_OF_WEEK;draw()}}>By Day of Week</button>
  <button class:button-on={$stateOfsideStore.isAgregate === DATA_TYPE.AVG_BY_DAY_OF_WEEK} on:click={() => {$stateOfsideStore.isAgregate = DATA_TYPE.AVG_BY_DAY_OF_WEEK;draw()}}>x̄ By Day of Week</button>
  <hr/>
</div>
{/if}

{#if $stateOfsideStore.sourceContainer !== SOURCE_CONTAINER.TABLEUR && $stateOfsideStore.sourceContainer !== SOURCE_CONTAINER.ERRORS_SOC}
<div>
  <h3>Smell clientId</h3>
  <button class:button-on={$stateOfsideStore.showSmell === TRINAIRE_VAL.UNDEF} on:click={() => {updateShowSmell(TRINAIRE_VAL.UNDEF);draw()}}>Show</button>
  <button class:button-on={$stateOfsideStore.showSmell === TRINAIRE_VAL.FALSE} on:click={() => {updateShowSmell(TRINAIRE_VAL.FALSE);draw()}}>Hide</button>
  <button class:button-on={$stateOfsideStore.showSmell === TRINAIRE_VAL.TRUE} on:click={() => {updateShowSmell(TRINAIRE_VAL.TRUE);draw()}}>Only</button>
</div>
{/if}

{#if $stateOfsideStore.sourceContainer !== SOURCE_CONTAINER.TABLEUR && $stateOfsideStore.sourceContainer !== SOURCE_CONTAINER.ERRORS_SOC}
  <div>
    {#key $stateOfsideStore.instances}
      <FilterBlock3 title='Instances' items={$stateOfsideStore.instances} callback={callbackInstancesAndDraw} rewrite={dummyFunction}/>
    {/key}
    
    <button class:button-on={$stateOfsideStore.isSumOrDistinctByInstance === ACTION_VAL.SUM_BY_INSTANCE} on:click={() => {updateStatusOfSumOrDistinctClient(ACTION_VAL.SUM_BY_INSTANCE);draw()}}>Sum</button>
    <button class:button-on={$stateOfsideStore.isSumOrDistinctByInstance === ACTION_VAL.DISTINCT_BY_INSTANCE} on:click={() => {updateStatusOfSumOrDistinctClient(ACTION_VAL.DISTINCT_BY_INSTANCE);draw()}}>Distinct</button>

    {#key $stateOfsideStore.clientIds}
      <FilterBlock3 title='ClientIds' items={$stateOfsideStore.clientIds} callback={callbackClientsIdAndDraw} rewrite={FriendlyName.getFriendlyName}/>
    {/key}
    <button class:button-on={$stateOfsideStore.isSumOrDistinctByClientId === ACTION_VAL.SUM_BY_CLIENTID} on:click={() => {$stateOfsideStore.isSumOrDistinctByClientId = ACTION_VAL.SUM_BY_CLIENTID;draw()}}>Sum</button>
    <button class:button-on={$stateOfsideStore.isSumOrDistinctByClientId === ACTION_VAL.DISTINCT_BY_CLIENTID} on:click={() => {$stateOfsideStore.isSumOrDistinctByClientId = ACTION_VAL.DISTINCT_BY_CLIENTID;draw()}} 
      disabled={$stateOfsideStore.isSumOrDistinctByInstance === ACTION_VAL.SUM_BY_INSTANCE}
      >Distinct</button>
  {#if $stateOfsideStore.sourceContainer === SOURCE_CONTAINER.HITS || $stateOfsideStore.sourceContainer === SOURCE_CONTAINER.REQUEST_USERS || $stateOfsideStore.sourceContainer === SOURCE_CONTAINER.REQUEST_HITS_BY_USERS}
    <FilterBlock3 title='Request Types' items={$stateOfsideStore.requestsType} callback={callbackRequetsTypeAndDraw}  rewrite={dummyFunction}/>
  
    <button class:button-on={$stateOfsideStore.isSumOrDistinctByRequestType === ACTION_VAL.SUM_BY_REQUESTTYPE} on:click={() => {$stateOfsideStore.isSumOrDistinctByRequestType = ACTION_VAL.SUM_BY_REQUESTTYPE;draw()}}>Sum</button>
    <button class:button-on={$stateOfsideStore.isSumOrDistinctByRequestType === ACTION_VAL.DISTINCT_BY_REQUESTTYPE} on:click={() => {$stateOfsideStore.isSumOrDistinctByRequestType = ACTION_VAL.DISTINCT_BY_REQUESTTYPE;draw()}}>Distinct</button>
  {/if}
  {#if $stateOfsideStore.sourceContainer === SOURCE_CONTAINER.ERRORS_BY_CLIENTID}
    <FilterBlock3 title='Errors' items={$stateOfsideStore.errorsByClientId} callback={callbackErrorsByClientIdAndDraw}  rewrite={dummyFunction}/>
    
    <button class:button-on={$stateOfsideStore.isSumOrDistinctByErrorsByClientId === ACTION_VAL.SUM_BY_ERRORSBYCLIENTID} on:click={() => {$stateOfsideStore.isSumOrDistinctByErrorsByClientId = ACTION_VAL.SUM_BY_ERRORSBYCLIENTID;draw()}}>Sum</button>
    <button class:button-on={$stateOfsideStore.isSumOrDistinctByErrorsByClientId === ACTION_VAL.DISTINCT_BY_ERRORSBYCLIENTID} on:click={() => {$stateOfsideStore.isSumOrDistinctByErrorsByClientId = ACTION_VAL.DISTINCT_BY_ERRORSBYCLIENTID;draw()}}>Distinct</button>
  {/if}
  </div>
{/if}

{#if $stateOfsideStore.sourceContainer === SOURCE_CONTAINER.ERRORS_SOC}
<div>
  <FilterBlock3 title='Errors Societaire' items={$stateOfsideStore.errorsSoc} callback={callbackErrorsSocAndDraw}  rewrite={dummyFunction}/>

  <button class:button-on={$stateOfsideStore.isSumOrDistinctByErrorsSoc === ACTION_VAL.SUM_BY_ERRORSSOC} on:click={() => {$stateOfsideStore.isSumOrDistinctByErrorsSoc = ACTION_VAL.SUM_BY_ERRORSSOC;draw()}}>Sum</button>
  <button class:button-on={$stateOfsideStore.isSumOrDistinctByErrorsSoc === ACTION_VAL.DISTINCT_BY_ERRORSSOC} on:click={() => {$stateOfsideStore.isSumOrDistinctByErrorsSoc = ACTION_VAL.DISTINCT_BY_ERRORSSOC;draw()}}>Distinct</button>
</div>
{/if}

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
/**********************/

hr{
  width: 90%;
}
</style>