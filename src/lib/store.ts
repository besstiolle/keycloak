import { writable } from "svelte/store";

const isBrowser = typeof window !== 'undefined'

let storedJsonData:string = ''
if(isBrowser){
    let valueFromLocalStorage = localStorage.getItem("jsonData")
    if(valueFromLocalStorage){
        storedJsonData = valueFromLocalStorage
    }
}

export const jsonDataStore = writable(storedJsonData)

if(isBrowser){
    jsonDataStore.subscribe(value => {
        localStorage.setItem("jsonData", value)
    })
}
