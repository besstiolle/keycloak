import { writable } from "svelte/store";

import { fromJsonToElasticStore, fromElasticStoretoJson } from "../routes/elastic/jsonParser";
import { getEmptyElasticStore, type elasticStore } from "../routes/elastic/elasticStoreFactory";
import type { instance } from "./gitStruct";
import { JSON_CONFIG_DATA, JSON_ELASTIC_DATA, JSON_GIT_DATA } from "./localStorageUtils";
import { Timeline } from "./Timeline.class";
import { initGlobalState } from "../routes/elastic/sideStateFactory";
import { Config } from "./configStruct";

const isBrowser = typeof window !== 'undefined'

let storedGitJsonData:instance[] = []
let storedConfigJsonData:Config = new Config()
let storedElasticJsonData:elasticStore = getEmptyElasticStore()
let storedTimeline:Timeline = new Timeline(new Date("2000-01-01 00:00:00"),new Date("2000-01-02 00:00:00"))

if(isBrowser){

    storedGitJsonData = JSON.parse(localStorage.getItem(JSON_GIT_DATA) || '[]');

    let valueFromLocalStorage = localStorage.getItem(JSON_CONFIG_DATA)
    if(valueFromLocalStorage){
        storedConfigJsonData = JSON.parse(valueFromLocalStorage)
    } 
    
    valueFromLocalStorage = localStorage.getItem(JSON_ELASTIC_DATA)
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
export const stateOfsideStore = writable( initGlobalState() )

if(isBrowser){
    jsonGitDataStore.subscribe(value => {localStorage.setItem(JSON_GIT_DATA, JSON.stringify(value))})
    jsonConfigDataStore.subscribe(value => {localStorage.setItem(JSON_CONFIG_DATA, JSON.stringify(value))})
    jsonElasticDataStore.subscribe(value => {localStorage.setItem(JSON_ELASTIC_DATA, fromElasticStoretoJson(value))})
}
