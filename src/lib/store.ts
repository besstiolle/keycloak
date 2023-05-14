import { writable } from "svelte/store";
import type { clientIdElastic, elasticStore } from "./elasticStruct";

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
        //storedElasticJsonData = valueFromLocalStorage
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
    //jsonElasticDataStore.subscribe(value => {localStorage.setItem("jsonElasticData", value)})
}
