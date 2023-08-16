import { writable } from "svelte/store";
import { ACTION_VAL, DATA_TYPE, GRAPH_TYPE, TRINAIRE_VAL, type GlobalState, type elasticStore, SOURCE_CONTAINER, type DisplaybleItems } from "./elasticStruct";

import { fromJsonToElasticStore, fromElasticStoretoJson } from "../routes/elastic/jsonParser";
import { getEmptyElasticStore } from "../routes/elastic/elasticStoreFactory";
import type { instance } from "./gitStruct";
import { JSON_CONFIG_DATA, JSON_ELASTIC_DATA, JSON_GIT_DATA } from "./localStorageUtils";
import { Timeline } from "./Timeline.class";

const isBrowser = typeof window !== 'undefined'

let storedGitJsonData:instance[] = []
let storedConfigJsonData:string = ''
let storedElasticJsonData:elasticStore = getEmptyElasticStore()
let storedTimeline:Timeline = new Timeline(new Date("2000-01-01 00:00:00"),new Date("2000-01-02 00:00:00"))

if(isBrowser){

    storedGitJsonData = JSON.parse(localStorage.getItem(JSON_GIT_DATA) || '[]');
    storedConfigJsonData = localStorage.getItem(JSON_CONFIG_DATA) || '';

    let valueFromLocalStorage = localStorage.getItem(JSON_ELASTIC_DATA)
    if(valueFromLocalStorage){
        let start = new Date()
        storedElasticJsonData = fromJsonToElasticStore(JSON.parse(valueFromLocalStorage))
        storedTimeline = new Timeline(storedElasticJsonData.minDate, storedElasticJsonData.maxDate)
        console.debug("fromJsonMixedObject ended in " + ((new Date()).getTime() - start.getTime()) + "ms since start")
    }
}

export const jsonGitDataStore = writable(storedGitJsonData)
export const jsonConfigDataStore = writable(storedConfigJsonData)
export const jsonElasticDataStore = writable(storedElasticJsonData)
export const timelineStore = writable(storedTimeline)

if(isBrowser){
    jsonGitDataStore.subscribe(value => {localStorage.setItem(JSON_GIT_DATA, JSON.stringify(value))})
    jsonConfigDataStore.subscribe(value => {localStorage.setItem(JSON_CONFIG_DATA, value)})
    jsonElasticDataStore.subscribe(value => {localStorage.setItem(JSON_ELASTIC_DATA, fromElasticStoretoJson(value))})
}

//Initiate states store
let globalState:GlobalState = {
    isSumOrDistinctByInstance : ACTION_VAL.SUM_BY_INSTANCE,
    isSumOrDistinctByClientId : ACTION_VAL.SUM_BY_CLIENTID,
    isSumOrDistinctByRequestType : ACTION_VAL.SUM_BY_REQUESTTYPE,
    isSumOrDistinctByErrorsByClientId : ACTION_VAL.SUM_BY_ERRORSBYCLIENTID,
    isSumOrDistinctByErrorsSoc : ACTION_VAL.SUM_BY_ERRORSSOC,
    graphType : GRAPH_TYPE.LINE,
    isAgregate : DATA_TYPE.SUM_BY_WEEK,
    instances: new Map<string, DisplaybleItems>(),
    clientIds: new Map<string, DisplaybleItems>(),
    requestsType: new Map<string, DisplaybleItems>(),
    errorsByClientId:new Map<string, DisplaybleItems>(),
    errorsSoc:new Map<string, DisplaybleItems>(),
    showSmell: TRINAIRE_VAL.UNDEF,
    sourceContainer: SOURCE_CONTAINER.HITS
}
export const stateOfsideStore = writable(globalState)