import { writable } from "svelte/store";

const isBrowser = typeof window !== 'undefined'

let storedJsonData:string = ''
let storedHashNodeJsonData:string = ''
let storedCondigJsonData:string = ''
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
        storedCondigJsonData = valueFromLocalStorage
    }
}

export const jsonDataStore = writable(storedJsonData)
export const jsonHashNodeDataStore = writable(storedHashNodeJsonData)
export const jsonConfigDataStore = writable(storedCondigJsonData)

if(isBrowser){
    jsonDataStore.subscribe(value => {localStorage.setItem("jsonData", value)})
    jsonHashNodeDataStore.subscribe(value => {localStorage.setItem("jsonHashNodeData", value)})
    jsonConfigDataStore.subscribe(value => {localStorage.setItem("jsonConfigData", value)})
}
