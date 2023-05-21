import { writable } from "svelte/store";
import type { clientIdElastic, elasticStore } from "./elasticStruct";

import pako from 'pako';
import * as base64 from "byte-base64";
import { fromJsonMixedObject, toJson } from "../routes/elastic/jsonParser";
import { getEmptyElasticStore } from "../routes/elastic/elasticStoreFactory";

const isBrowser = typeof window !== 'undefined'

let storedJsonData:string = ''
let storedHashNodeJsonData:string = ''
let storedConfigJsonData:string = ''
let storedElasticJsonData:elasticStore = getEmptyElasticStore()

if(isBrowser){

    storedJsonData = localStorage.getItem("jsonData") || '';
    storedHashNodeJsonData = localStorage.getItem("jsonHashNodeData") || '';
    storedConfigJsonData = localStorage.getItem("jsonConfigData") || '';

    let valueFromLocalStorage = localStorage.getItem("jsonElasticData")
    if(valueFromLocalStorage){
        /*const returned = base64.base64ToBytes(valueFromLocalStorage)
        const restored:object = JSON.parse(pako.inflate(returned, { to: 'string' }));
        console.info(restored)  
        let elasticStore:elasticStore = ElasticStoreFromJsonObject(restored)*/
        let elasticStore:elasticStore = fromJsonMixedObject(JSON.parse(valueFromLocalStorage))
        storedElasticJsonData = elasticStore 
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

function toB64Compressed(elasticStore:elasticStore):string{
    //console.info("value avant JSON", elasticStore)


    const json = toJson(elasticStore)
    //console.info("json : ", json)
    //const compressed = pako.deflate(json, { level: 9})
    //const b64 = base64.bytesToBase64(compressed)
    //return b64
    return json
}


//console.info(b64.length)

//let returned = base64.base64ToBytes(b64)
//const restored = JSON.parse(pako.inflate(returned, { to: 'string' }));
//console.info(restored)
//Saving data into localStorage
