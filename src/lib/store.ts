import { writable } from "svelte/store";
import type { elasticStore } from "./elasticStruct";

import { fromJsonMixedObject, toJson } from "../routes/elastic/jsonParser";
import { getEmptyElasticStore } from "../routes/elastic/elasticStoreFactory";
import type { instance } from "./gitStruct";
import { JSON_CONFIG_DATA, JSON_ELASTIC_DATA, JSON_GIT_DATA } from "./localStorageUtils";

const isBrowser = typeof window !== 'undefined'

let storedGitJsonData:instance[] = []
let storedConfigJsonData:string = ''
let storedElasticJsonData:elasticStore = getEmptyElasticStore()

if(isBrowser){

    storedGitJsonData = JSON.parse(localStorage.getItem(JSON_GIT_DATA) || '[]');
    storedConfigJsonData = localStorage.getItem(JSON_CONFIG_DATA) || '';

    let valueFromLocalStorage = localStorage.getItem(JSON_ELASTIC_DATA)
    if(valueFromLocalStorage){
        //FIXME : fromJsonMixedObject is heavy on CPU
        storedElasticJsonData = fromJsonMixedObject(JSON.parse(valueFromLocalStorage))
    }
}

export const jsonGitDataStore = writable(storedGitJsonData)
export const jsonConfigDataStore = writable(storedConfigJsonData)
export const jsonElasticDataStore = writable(storedElasticJsonData)

if(isBrowser){
    jsonGitDataStore.subscribe(value => {localStorage.setItem(JSON_GIT_DATA, JSON.stringify(value))})
    jsonConfigDataStore.subscribe(value => {localStorage.setItem(JSON_CONFIG_DATA, value)})
    jsonElasticDataStore.subscribe(value => {localStorage.setItem(JSON_ELASTIC_DATA, toJson(value))})
}
