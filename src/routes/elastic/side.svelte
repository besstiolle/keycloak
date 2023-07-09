<script lang="ts">
    import { ACTION_VAL, DATA_TYPE, GRAPH_TYPE, type GlobalState } from "$lib/elasticStruct";
    import FilterBlock from "../FilterBlock.svelte";
    import { StateOfFiltersElastic } from "./StateOfFiltersElastic";

    export let fInstances:string[]
    export let fClientIds:string[]
    export let fRequestTypes:string[]
    export let instanceToClientId:Map<string,string[]>
    
    export let drawGraph:Function;

    export let sideState:GlobalState;

	function switchforSumByInstance(e:Event, className:string='sumOrDistinctInstance'){
		let button = e.target as HTMLButtonElement
		switchFor(button, className)
        
		sideState.isSumOrDistinctByInstance = button.getAttribute("data-val") as ACTION_VAL
    sideState.isSumOrDistinctByClientId = ACTION_VAL.SUM_BY_CLIENTID
		updateInstanceInState()


    //Update state for button "client-id"
    let buttons = document.getElementsByClassName("sumOrDistinctClientId")
    if(sideState.isSumOrDistinctByInstance == ACTION_VAL.SUM_BY_INSTANCE) {
      for(let button of buttons){
        if(button.getAttribute("data-val") as ACTION_VAL == ACTION_VAL.SUM_BY_CLIENTID){
          button.classList.add("button-on")
          button.classList.remove("button-off")
        } else {
          button.classList.remove("button-on")
          button.classList.add("button-off")
        }
        button.classList.add("hide")
      }
    } else {
      for(let button of buttons){
        button.classList.remove("hide")
      }
    }

	}

	function switchforSumByClientId(e:Event, className:string='sumOrDistinctClientId'){
		let button = e.target as HTMLButtonElement
		switchFor(button, className)
		sideState.isSumOrDistinctByClientId = button.getAttribute("data-val") as ACTION_VAL
        sideState.isSumOrDistinctByRequestType = ACTION_VAL.SUM_BY_REQUESTTYPE
		drawGraph()

	}

	function switchforSumByRequestType(e:Event, className:string='sumOrDistinctRequestType'){
		let button = e.target as HTMLButtonElement
		switchFor(button, className)
		sideState.isSumOrDistinctByRequestType = button.getAttribute("data-val") as ACTION_VAL
		updateRequestTypeInState()

	}

	function switchforTypeAgregate(e:Event, className:string='typeOfAgregate'){
		let button = e.target as HTMLButtonElement
		switchFor(button, className)
		sideState.isAgregate = button.getAttribute("data-val") as DATA_TYPE
		drawGraph()
	}
	
	function switchforTypeGraph(e:Event, className:string='typeOfGraph'){
		let button = e.target as HTMLButtonElement
		switchFor(button, className)
		sideState.graphType = button.getAttribute("data-val") as GRAPH_TYPE

    switch(sideState.graphType){
      case GRAPH_TYPE.LINE:doHideNoTableur(false);break; 
      case GRAPH_TYPE.PIE:doHideNoTableur(false);break; 
      case GRAPH_TYPE.TABLEUR:doHideNoTableur(true);break; 
    }

		drawGraph()
	}

  function doHideNoTableur(doHide:boolean){
    let divElements = document.getElementsByClassName("noTableur")
    for(let div of divElements){
      if(doHide){
        div.classList.add("hide")
      } else {
        div.classList.remove("hide")
      }
    }
  }

	function switchFor(button:HTMLButtonElement, className:string){
		let buttons = document.getElementsByClassName(className)
		for(let button of buttons){
			button.classList.remove("button-on")
			button.classList.add("button-off")
		}
		button.classList.remove("button-off")
		button.classList.add("button-on")
	}

    function updateInstanceInState(){
        //Reset information info state
        sideState.selectedInstances=[]
        sideState.selectedClientsId=[]
        let inputsInstance:HTMLCollectionOf<HTMLInputElement> = 
                document.getElementById("filterFor"+StateOfFiltersElastic.ID_INSTANCES)
                    ?.getElementsByTagName("input") as HTMLCollectionOf<HTMLInputElement>
        

        //Show or Hide 
        let inputsClientId:HTMLCollectionOf<HTMLInputElement> = 
                document.getElementById("filterFor"+StateOfFiltersElastic.ID_CLIENTIDS)
                    ?.getElementsByTagName("input") as HTMLCollectionOf<HTMLInputElement>

        let currentInstance = ""
        let currentClientId:string[] = []
        for(let item of inputsInstance){
            currentInstance = item.value
            currentClientId = instanceToClientId.get(currentInstance) as string[]

            if (item.checked){
                sideState.selectedInstances.push(currentInstance)
                for(let clientId of inputsClientId){
                    if(currentClientId.includes(clientId.value)){
                        clientId.disabled=false
                        clientId.parentElement?.classList.remove("hide")
                    }
                }
            } else {
                for(let clientId of inputsClientId){
                    if(currentClientId.includes(clientId.value)){
                        clientId.disabled=true
                        clientId.parentElement?.classList.add("hide")
                    }
                }

            } 
        }
        
        updateClientIdInState()
        updateRequestTypeInState()
    }

    function updateClientIdInState(){
        //Reset information info state
        sideState.selectedClientsId=[]

        let inputsClientId:HTMLCollectionOf<HTMLInputElement> = 
                document.getElementById("filterFor"+StateOfFiltersElastic.ID_CLIENTIDS)
                    ?.getElementsByTagName("input") as HTMLCollectionOf<HTMLInputElement>

        for(let item of inputsClientId){
            if(item.checked && !item.disabled){
                sideState.selectedClientsId.push(item.value)
            }
        }

        drawGraph()
    }

    function updateRequestTypeInState(){
      //Reset information info state
      sideState.selectedRequestsType=[]
      
      let inputsRequestsType:HTMLCollectionOf<HTMLInputElement> = 
                document.getElementById("filterFor"+StateOfFiltersElastic.ID_REQUESTTYPE)
                    ?.getElementsByTagName("input") as HTMLCollectionOf<HTMLInputElement>

        for(let item of inputsRequestsType){
            if(item.checked && !item.disabled){
                sideState.selectedRequestsType.push(item.value)
            }
        }

        drawGraph()
    }

</script>
<div>
  <button class="typeOfGraph button-on" on:click={switchforTypeGraph} data-val={GRAPH_TYPE.LINE}>Lines</button>
  <button class="typeOfGraph button-off" on:click={switchforTypeGraph} data-val={GRAPH_TYPE.PIE}>Charts</button>
  <button class="typeOfGraph button-off" on:click={switchforTypeGraph} data-val={GRAPH_TYPE.TABLEUR}>Table</button>
  <hr/>
</div>
<div class="noTableur">
  <button class="typeOfAgregate button-off" on:click={switchforTypeAgregate} data-val={DATA_TYPE.SUM_BY_DAY}>By Day</button>
  <button class="typeOfAgregate button-on" on:click={switchforTypeAgregate} data-val={DATA_TYPE.SUM_BY_WEEK}>By Week</button>
  <button class="typeOfAgregate button-off" on:click={switchforTypeAgregate} data-val={DATA_TYPE.SUM_BY_MONTH}>By Month</button>
  <button class="typeOfAgregate button-off" on:click={switchforTypeAgregate} data-val={DATA_TYPE.SUM_BY_DAY_OF_WEEK}>By Day of Week</button>
  <button class="typeOfAgregate button-off" on:click={switchforTypeAgregate} data-val={DATA_TYPE.AVG_BY_DAY_OF_WEEK}>x̄ By Day of Week</button>
  <hr/>
</div>
<div class="noTableur">
  <button class="button-off" disabled>Show x̄</button>
  <hr/>
</div>
<div class="noTableur">
  <FilterBlock filterCode={StateOfFiltersElastic.ID_INSTANCES} filterTitre='Instances' filterList={fInstances}  action={updateInstanceInState} action2={()=>{}}/>
  <button class="sumOrDistinctInstance button-on" on:click={switchforSumByInstance} data-val={ACTION_VAL.SUM_BY_INSTANCE}>Sum</button>
  <button class="sumOrDistinctInstance button-off" on:click={switchforSumByInstance} data-val={ACTION_VAL.DISTINCT_BY_INSTANCE}>Distinct</button>
  <FilterBlock filterCode={StateOfFiltersElastic.ID_CLIENTIDS} filterTitre='ClientIds' filterList={fClientIds}  action={updateClientIdInState} action2={()=>{}}/>
  <button class="sumOrDistinctClientId button-on hide" on:click={switchforSumByClientId} data-val={ACTION_VAL.SUM_BY_CLIENTID}>Sum</button>
  <button class="sumOrDistinctClientId button-off hide" on:click={switchforSumByClientId} data-val={ACTION_VAL.DISTINCT_BY_CLIENTID}>Distinct</button>
  <FilterBlock filterCode={StateOfFiltersElastic.ID_REQUESTTYPE} filterTitre='RequestTypes' filterList={fRequestTypes}  action={updateRequestTypeInState} action2={()=>{}}/>
  <button class="sumOrDistinctRequestType button-on" on:click={switchforSumByRequestType} data-val={ACTION_VAL.SUM_BY_REQUESTTYPE}>Sum</button>
  <button class="sumOrDistinctRequestType button-off" on:click={switchforSumByRequestType} data-val={ACTION_VAL.DISTINCT_BY_REQUESTTYPE}>Distinct</button>
</div>
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
  display: none;
}
hr{
  width: 90%;
}
</style>