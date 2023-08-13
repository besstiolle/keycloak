<script lang="ts">
    import { ACTION_VAL, DATA_TYPE, GRAPH_TYPE, TRINAIRE_VAL, SOURCE_CONTAINER, type GlobalState, type DisplaybleItems } from "$lib/elasticStruct";
    import { jsonGitDataStore, jsonConfigDataStore, stateOfsideStore } from "$lib/store";
    import FilterBlock3 from "../FilterBlock3.svelte";
    import { SmellEngine } from "./smellEngine";

    export let clientIdToInstance:Map<string,string>

    export let fInstances:string[]
    export let fClientIds:string[]
    export let fErrorsByClientId:string[]
    export let fRequestTypes:string[] 
    
    let smellEngine = new SmellEngine().initWithGitInstances($jsonGitDataStore, $jsonConfigDataStore)
    let previousStateSmells = TRINAIRE_VAL.UNDEF
    let listOfClientidToHideBecauseOfSmellCondifuration:string[] = []
    function checkSmells(){
      if(previousStateSmells !== $stateOfsideStore.showSmell){
        previousStateSmells = $stateOfsideStore.showSmell
        listOfClientidToHideBecauseOfSmellCondifuration = []
        if($stateOfsideStore.showSmell === TRINAIRE_VAL.TRUE){        //Show only smell
          fClientIds.forEach(clientId=>{
            if(smellEngine.isSmellByLabel(clientId)){
              listOfClientidToHideBecauseOfSmellCondifuration.push(clientId)  
            }
          })
        } else if($stateOfsideStore.showSmell === TRINAIRE_VAL.FALSE){ //don't Show smell
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
    function updateStatusOfSumOrDistinctClient(){
      if($stateOfsideStore.isSumOrDistinctByInstance === ACTION_VAL.SUM_BY_INSTANCE && $stateOfsideStore.isSumOrDistinctByClientId === ACTION_VAL.DISTINCT_BY_CLIENTID){
        $stateOfsideStore.isSumOrDistinctByClientId = ACTION_VAL.SUM_BY_CLIENTID
      }
    }

    stateOfsideStore.subscribe(value => checkSmells())
    stateOfsideStore.subscribe(value => updateStatusOfSumOrDistinctClient())
    
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
    const ON =  'button-on'
    const OFF = 'button-off'

</script>

<div>
  <button class={$stateOfsideStore.sourceContainer === SOURCE_CONTAINER.HITS ? ON : OFF} 
      on:click={(e) => $stateOfsideStore.sourceContainer = SOURCE_CONTAINER.HITS}>Hits By ClientId</button>
  <button class={$stateOfsideStore.sourceContainer === SOURCE_CONTAINER.ERRORS_BY_CLIENTID ? ON : OFF} 
      on:click={(e) => $stateOfsideStore.sourceContainer = SOURCE_CONTAINER.ERRORS_BY_CLIENTID}>Errors By ClientId</button>
  <hr/>
</div>

<div>
  <button class={$stateOfsideStore.graphType === GRAPH_TYPE.LINE ? ON : OFF} 
      on:click={(e) => $stateOfsideStore.graphType = GRAPH_TYPE.LINE}>Lines</button>
  <button class={$stateOfsideStore.graphType === GRAPH_TYPE.PIE ? ON : OFF} 
      on:click={(e) => $stateOfsideStore.graphType = GRAPH_TYPE.PIE}>Charts</button>
  <button class={$stateOfsideStore.graphType === GRAPH_TYPE.TABLEUR ? ON : OFF} 
      on:click={(e) => $stateOfsideStore.graphType = GRAPH_TYPE.TABLEUR}>Table</button>
  
  <hr/>
</div>
{#if $stateOfsideStore.graphType !== GRAPH_TYPE.TABLEUR}
<div>
  <button class={$stateOfsideStore.isAgregate === DATA_TYPE.SUM_BY_DAY ? ON : OFF} 
      on:click={(e) => $stateOfsideStore.isAgregate = DATA_TYPE.SUM_BY_DAY}>By Day</button>
  <button class={$stateOfsideStore.isAgregate === DATA_TYPE.SUM_BY_WEEK ? ON : OFF} 
      on:click={(e) => $stateOfsideStore.isAgregate = DATA_TYPE.SUM_BY_WEEK}>By Week</button>
  <button class={$stateOfsideStore.isAgregate === DATA_TYPE.SUM_BY_MONTH ? ON : OFF} 
      on:click={(e) => $stateOfsideStore.isAgregate = DATA_TYPE.SUM_BY_MONTH}>By Month</button>
  <button class={$stateOfsideStore.isAgregate === DATA_TYPE.SUM_BY_DAY_OF_WEEK ? ON : OFF} 
      on:click={(e) => $stateOfsideStore.isAgregate = DATA_TYPE.SUM_BY_DAY_OF_WEEK}>By Day of Week</button>
  <button class={$stateOfsideStore.isAgregate === DATA_TYPE.AVG_BY_DAY_OF_WEEK ? ON : OFF} 
      on:click={(e) => $stateOfsideStore.isAgregate = DATA_TYPE.AVG_BY_DAY_OF_WEEK}>x̄ By Day of Week</button>
  <hr/>
</div>
{/if}

{#if $stateOfsideStore.graphType !== GRAPH_TYPE.TABLEUR}
<div>
  <h3>Smell clientId</h3>
  <button class={$stateOfsideStore.showSmell === TRINAIRE_VAL.UNDEF ? ON : OFF} 
      on:click={(e) => $stateOfsideStore.showSmell = TRINAIRE_VAL.UNDEF}>Show</button>
  <button class={$stateOfsideStore.showSmell === TRINAIRE_VAL.FALSE ? ON : OFF} 
      on:click={(e) => $stateOfsideStore.showSmell = TRINAIRE_VAL.FALSE}>Hide</button>
  <button class={$stateOfsideStore.showSmell === TRINAIRE_VAL.TRUE ? ON : OFF} 
      on:click={(e) => $stateOfsideStore.showSmell = TRINAIRE_VAL.TRUE}>Only</button>
</div>
{/if}

{#if $stateOfsideStore.graphType !== GRAPH_TYPE.TABLEUR}
<div>
  {#key $stateOfsideStore.instances}
    <FilterBlock3 title='Instances' items={$stateOfsideStore.instances} callback={callbackInstances} />
  {/key}
  
  <button class={$stateOfsideStore.isSumOrDistinctByInstance === ACTION_VAL.SUM_BY_INSTANCE ? ON : OFF} 
    on:click={(e) => $stateOfsideStore.isSumOrDistinctByInstance = ACTION_VAL.SUM_BY_INSTANCE}>Sum</button>
  <button class={$stateOfsideStore.isSumOrDistinctByInstance === ACTION_VAL.DISTINCT_BY_INSTANCE ? ON : OFF} 
    on:click={(e) => $stateOfsideStore.isSumOrDistinctByInstance = ACTION_VAL.DISTINCT_BY_INSTANCE}>Distinct</button>

  {#key $stateOfsideStore.clientIds}
    <FilterBlock3 title='ClientIds' items={$stateOfsideStore.clientIds}  callback={callbackClientsId} />
  {/key}
  <button class={$stateOfsideStore.isSumOrDistinctByClientId === ACTION_VAL.SUM_BY_CLIENTID ? ON : OFF} 
    on:click={(e) => $stateOfsideStore.isSumOrDistinctByClientId = ACTION_VAL.SUM_BY_CLIENTID}>Sum</button>
  <button class={$stateOfsideStore.isSumOrDistinctByClientId === ACTION_VAL.DISTINCT_BY_CLIENTID ? ON : OFF} 
    on:click={(e) => $stateOfsideStore.isSumOrDistinctByClientId = ACTION_VAL.DISTINCT_BY_CLIENTID} 
    disabled={$stateOfsideStore.isSumOrDistinctByInstance === ACTION_VAL.SUM_BY_INSTANCE}
    >Distinct</button>
{#if $stateOfsideStore.sourceContainer === SOURCE_CONTAINER.HITS}
  <FilterBlock3 title='Request Types' items={$stateOfsideStore.requestsType} callback={callbackRequetsType} />
 
  <button class={$stateOfsideStore.isSumOrDistinctByRequestType === ACTION_VAL.SUM_BY_REQUESTTYPE ? ON : OFF} 
    on:click={(e) => $stateOfsideStore.isSumOrDistinctByRequestType = ACTION_VAL.SUM_BY_REQUESTTYPE}>Sum</button>
  <button class={$stateOfsideStore.isSumOrDistinctByRequestType === ACTION_VAL.DISTINCT_BY_REQUESTTYPE ? ON : OFF} 
    on:click={(e) => $stateOfsideStore.isSumOrDistinctByRequestType = ACTION_VAL.DISTINCT_BY_REQUESTTYPE}>Distinct</button>
{/if}
{#if $stateOfsideStore.sourceContainer === SOURCE_CONTAINER.ERRORS_BY_CLIENTID}
  <FilterBlock3 title='Errors' items={$stateOfsideStore.errorsByClientId} callback={callbackErrorsByClientId} />
   
  <button class={$stateOfsideStore.isSumOrDistinctByErrorsByClientId === ACTION_VAL.SUM_BY_ERRORSBYCLIENTID ? ON : OFF} 
    on:click={(e) => $stateOfsideStore.isSumOrDistinctByErrorsByClientId = ACTION_VAL.SUM_BY_ERRORSBYCLIENTID}>Sum</button>
  <button class={$stateOfsideStore.isSumOrDistinctByErrorsByClientId === ACTION_VAL.DISTINCT_BY_ERRORSBYCLIENTID ? ON : OFF} 
    on:click={(e) => $stateOfsideStore.isSumOrDistinctByErrorsByClientId = ACTION_VAL.DISTINCT_BY_ERRORSBYCLIENTID}>Distinct</button>
{/if}
</div>
{/if}

<style>
/* CSS https://getcssscan.com/css-buttons-examples */
.button-on {
  appearance: none;
  background-color: #2ea44f;
  border: 1px solid rgba(27, 31, 35, .15);
  border-radius: 6px;
  box-shadow: rgba(27, 31, 35, .1) 0 1px 0;
  box-sizing: border-box;
  color: #fff;
  cursor: pointer;
  display: inline-block;
  font-family: -apple-system,system-ui,"Segoe UI",Helvetica,Arial,sans-serif,"Apple Color Emoji","Segoe UI Emoji";
  font-size: 14px;
  font-weight: 600;
  line-height: 20px;
  padding: 6px 16px;
  position: relative;
  text-align: center;
  text-decoration: none;
  user-select: none;
  -webkit-user-select: none;
  touch-action: manipulation;
  vertical-align: middle;
  white-space: nowrap;
}

.button-on:focus:not(:focus-visible):not(.focus-visible) {
  box-shadow: none;
  outline: none;
}

.button-on:hover {
  background-color: #2c974b;
}

.button-on:focus {
  box-shadow: rgba(46, 164, 79, .4) 0 0 0 3px;
  outline: none;
}

.button-on:disabled {
  background-color: #94d3a2;
  border-color: rgba(27, 31, 35, .1);
  color: rgba(255, 255, 255, .8);
  cursor: default;
}

.button-on:active {
  background-color: #298e46;
  box-shadow: rgba(20, 70, 32, .2) 0 1px 0 inset;
}

/* CSS https://getcssscan.com/css-buttons-examples */
.button-off {
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
  transition: background-color 0.2s cubic-bezier(0.3, 0, 0.5, 1);
  user-select: none;
  -webkit-user-select: none;
  touch-action: manipulation;
  vertical-align: middle;
  white-space: nowrap;
  word-wrap: break-word;
}

.button-off:hover {
  background-color: #F3F4F6;
  text-decoration: none;
  transition-duration: 0.1s;
}

.button-off:disabled {
  background-color: #FAFBFC;
  border-color: rgba(27, 31, 35, 0.15);
  color: #959DA5;
  cursor: default;
}

.button-off:active {
  background-color: #EDEFF2;
  box-shadow: rgba(225, 228, 232, 0.2) 0 1px 0 inset;
  transition: none 0s;
}

.button-off:focus {
  outline: 1px transparent;
}

.button-off:before {
  display: none;
}

.button-off:-webkit-details-marker {
  display: none;
}

/**********************/

:global(.hide){
  display: none !important;
}
hr{
  width: 90%;
}
</style>