import { writable } from "svelte/store";

const isBrowser = typeof window !== 'undefined'

let storedJsonData:string = ''
let storedHashNodeJsonData:string = ''
if(isBrowser){
    let valueFromLocalStorage = localStorage.getItem("jsonData")
    if(valueFromLocalStorage){
        storedJsonData = valueFromLocalStorage
    }

    valueFromLocalStorage = localStorage.getItem("jsonHashNodeData")
    if(valueFromLocalStorage){
        storedHashNodeJsonData = valueFromLocalStorage
    }
}

export const jsonDataStore = writable(storedJsonData)
export const jsonHashNodeDataStore = writable(storedHashNodeJsonData)

if(isBrowser){
    jsonDataStore.subscribe(value => {localStorage.setItem("jsonData", value)})
    jsonHashNodeDataStore.subscribe(value => {localStorage.setItem("jsonHashNodeData", value)})
}
