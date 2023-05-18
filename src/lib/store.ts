import { writable } from "svelte/store";
import type { clientIdElastic, elasticStore } from "./elasticStruct";

import pako from 'pako';
import * as base64 from "byte-base64";
import { ElasticStoreFromJson as ElasticStoreFromJsonObject, ElasticStoreToJson as elasticStoreToJson } from "../routes/elastic/jsonParser";

const isBrowser = typeof window !== 'undefined'

let storedJsonData:string = ''
let storedHashNodeJsonData:string = ''
let storedConfigJsonData:string = ''
let storedElasticJsonData:elasticStore = {
    minDate:new Date("2099-01-01"),
    maxDate:new Date("2000-01-01"),
    container:new Map<string, clientIdElastic>()
}

if(isBrowser){
    let valueFromLocalStorage = localStorage.getItem("jsonData")
    if(valueFromLocalStorage){
        storedJsonData = valueFromLocalStorage
    }

    valueFromLocalStorage = localStorage.getItem("jsonHashNodeData")
    if(valueFromLocalStorage){
        storedHashNodeJsonData = valueFromLocalStorage
    }

    valueFromLocalStorage = localStorage.getItem("jsonConfigData")
    if(valueFromLocalStorage){
        storedConfigJsonData = valueFromLocalStorage
    }

    valueFromLocalStorage = localStorage.getItem("jsonElasticData")
    if(valueFromLocalStorage){
        const returned = base64.base64ToBytes(valueFromLocalStorage)
        const restored:object = JSON.parse(pako.inflate(returned, { to: 'string' }));
        //console.info(restored)  
        let elasticStore:elasticStore = ElasticStoreFromJsonObject(restored)
        //console.info(elasticStore)
        //storedElasticJsonData = elasticStore 
        //FIXME
    }
}

export const jsonDataStore = writable(storedJsonData)
export const jsonHashNodeDataStore = writable(storedHashNodeJsonData)
export const jsonConfigDataStore = writable(storedConfigJsonData)
export const jsonElasticDataStore = writable(storedElasticJsonData)

if(isBrowser){
    jsonDataStore.subscribe(value => {localStorage.setItem("jsonData", value)})
    jsonHashNodeDataStore.subscribe(value => {localStorage.setItem("jsonHashNodeData", value)})
    jsonConfigDataStore.subscribe(value => {localStorage.setItem("jsonConfigData", value)})
    jsonElasticDataStore.subscribe(value => {localStorage.setItem("jsonElasticData", toB64Compressed(value))})
}

function toB64Compressed(value:elasticStore):string{
    //console.info(value)
    const json = elasticStoreToJson(value)
    //console.info(json)
    const compressed = pako.deflate(json, { level: 9})
    const b64 = base64.bytesToBase64(compressed)
    //console.info(b64.length)
    return b64
}


//console.info(b64.length)

//let returned = base64.base64ToBytes(b64)
//const restored = JSON.parse(pako.inflate(returned, { to: 'string' }));
//console.info(restored)
//Saving data into localStorage
