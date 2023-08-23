import type { Timeline } from "$lib/Timeline.class"
import { ERROR_BY_CLIENTID_TYPE, ERROR_SOC_TYPE, REQUEST_TYPE } from "$lib/elasticStruct"
import { CACHE } from "$lib/localStorageUtils"
import pako from 'pako';
import * as base64 from "byte-base64";
import { addToMap, fusionMap, getHashKey } from "./datasetFactory"
import type { clientIdElastic, elasticStore } from "./elasticStoreFactory"
import { DATA_TYPE } from "./sideStateFactory"


export const SUFFIX_FOR_REQUEST_USERS = 'REQ_US_'

export class EnrichedDataWrapper{

    allClientIds:string[] = []
    allInstances:string[] = []
    rawData = new Map<string, Map<number,number>>()
    instanceToClientId = new Map<string,string[]>()
	clientIdToInstance = new Map<string,string>()

    constructor(){
    }
}


export interface rawData{
    sumByDay : Map<number,number>,
    sumByWeek : Map<number,number>,
    sumByMonth : Map<number,number>,
    sumByDayOfWeek : Map<number,number>,
    cptByDayOfWeek : Map<number,number>,
    avgByDayOfWeek : Map<number,number>,
    sumAbsolute : number
}

export function getEnrichedData():EnrichedDataWrapper{

    let start = new Date()

    //Retrieve from localstorage
    const  b64 = localStorage.getItem(CACHE) as string

    if(b64 == null){
        throw new Error("No cache was found")
    }

    //Turn it back to object
    const compress = base64.base64ToBytes(b64)
    const json = pako.inflate(compress, { to: 'string' })

    const enrichedData = JSON.parse(json, reviver) as EnrichedDataWrapper

    
    console.debug(" > getEnrichedData ended in " + ((new Date()).getTime() - start.getTime()) + "ms")

    //return it
    return enrichedData
}
export function refreshEnrichedData(store:elasticStore, timeline:Timeline):EnrichedDataWrapper{

    let start = new Date()

    //Get the fresh version
    const enrichedData = generateEnrichedData(store, timeline)

    //Turn it into JSON
    const json = JSON.stringify(enrichedData, replacer)
    const compressed = pako.deflate(json, { level: 9})
    const b64 = base64.bytesToBase64(compressed)

    //Save it inside localstorage
    localStorage.setItem(CACHE, b64)

    
    console.debug(" > refreshEnrichedData ended in " + ((new Date()).getTime() - start.getTime()) + "ms")
    
    //Return it
    return enrichedData
}

function replacer(key:string, value:any) {
    if(value instanceof Map) {
      return {
        dataType: 'Map',
        value: Array.from(value.entries()), // or with spread: value: [...value]
      };
    } else {
      return value;
    }
  }
  
  function reviver(key:string, value:any) {
    if(typeof value === 'object' && value !== null) {
      if (value.dataType === 'Map') {
        return new Map(value.value);
      }
    }
    return value;
  }
  

function generateEnrichedData(store:elasticStore, timeline:Timeline):EnrichedDataWrapper{
    let allRequestTypes = Object.values(REQUEST_TYPE).sort()
    let allErrorsByClientid = Object.values(ERROR_BY_CLIENTID_TYPE).sort()

    
    let rawData:rawData
    let map = new Map<string, Map<number,number>>()

    let enriched = new EnrichedDataWrapper()

    store.containerClientId.forEach(clientId => {
        enriched = addClientIdToEnrichedDataWrapper(clientId, enriched)
        for(const requestType of allRequestTypes){
            rawData = getRawData(clientId[requestType] as number[], timeline)
            map = processRawDataIntoMap(map, rawData, clientId.instance, clientId.clientId, requestType)
        }
    })
    store.containerRequestUsers.forEach(clientId => {
        enriched = addClientIdToEnrichedDataWrapper(clientId, enriched)
        for(const requestType of allRequestTypes){
            rawData = getRawData(clientId[requestType] as number[], timeline)
            map = processRawDataIntoMap(map, rawData, clientId.instance, clientId.clientId, SUFFIX_FOR_REQUEST_USERS + requestType)
        }
    })
    store.containerErrorsByClientId.forEach(clientId => {
        enriched = addClientIdToEnrichedDataWrapper(clientId, enriched)
        for(const errorByClientId of allErrorsByClientid){
            rawData = getRawData(clientId[errorByClientId] as number[], timeline)
            map = processRawDataIntoMap(map, rawData, clientId.instance, clientId.clientId, errorByClientId)
        }
    })
    store.containerErrorsSoc.forEach((value, key) => {
        rawData = getRawData(value, timeline)
        map = processRawDataIntoMap(map, rawData, "", "", key)
    })
    enriched.rawData = map
    return enriched
    
}

function addClientIdToEnrichedDataWrapper(clientId:clientIdElastic, enriched:EnrichedDataWrapper):EnrichedDataWrapper{
    let listOfClientIdForInstance:string[] = []
    if(!enriched.allClientIds.includes(clientId.clientId)){
        enriched.allClientIds.push(clientId.clientId)
    }
    if(!enriched.allInstances.includes(clientId.instance)){
        enriched.allInstances.push(clientId.instance)
    }

    if(!enriched.instanceToClientId.has(clientId.instance)){
        enriched.instanceToClientId.set(clientId.instance, [])
    }

    listOfClientIdForInstance = enriched.instanceToClientId.get(clientId.instance) as string[]
    if(!listOfClientIdForInstance.includes(clientId.clientId)){
        listOfClientIdForInstance.push(clientId.clientId)
    }
    enriched.instanceToClientId.set(clientId.instance, listOfClientIdForInstance)
    enriched.clientIdToInstance.set(clientId.clientId, clientId.instance)

    return enriched
}

function getRawData(arr:number[], timeline:Timeline):rawData{
    let value = 0
    let sumByDay = new Map<number,number>()  // eg : today 0:00
    let sumByWeek = new Map<number,number>() // eg : monday 0:00
    let sumByMonth = new Map<number,number>() // eg : first day of month 0:00
    let sumByDayOfWeek = new Map<number,number>() // 1 -> 7, 7 indexes
    let cptByDayOfWeek = new Map<number,number>() // 1 -> 7, 7 indexes
    let avgByDayOfWeek = new Map<number,number>() // 1 -> 7, 7 indexes
    let sumAbsolute = 0

    let currentDayOfWeek = -1
    timeline.getTimestampsOfDay().forEach((timestamp:number, index) => {
        value = arr[index]
        if(value != null){
            sumByDay = addToMap(sumByDay, timestamp, value)
            sumByWeek = addToMap(sumByWeek, timeline.getTimestampOfWeekByIndex(index), value)
            sumByMonth = addToMap(sumByMonth, timeline.getTimestampOfMonthByIndex(index), value)
            sumByDayOfWeek = addToMap(sumByDayOfWeek, timeline.getDayOfWeekByIndex(index), value)
            sumAbsolute += value

            if(currentDayOfWeek == -1 || currentDayOfWeek !== timeline.getDayOfWeekByIndex(index)){
                cptByDayOfWeek = addToMap(cptByDayOfWeek, timeline.getDayOfWeekByIndex(index), 1)
                currentDayOfWeek = timeline.getDayOfWeekByIndex(index)
            }
        }
    })

    //Post traitement pour AVG
    sumByDayOfWeek.forEach((value, key) => {
        if(cptByDayOfWeek.has(key)){
            avgByDayOfWeek.set(key, value / (cptByDayOfWeek.get(key) as number))
        }
    });

    return {
        sumByDay:sumByDay,
        sumByWeek:sumByWeek,
        sumByMonth:sumByMonth,
        sumByDayOfWeek:sumByDayOfWeek,
        cptByDayOfWeek:cptByDayOfWeek,
        avgByDayOfWeek:avgByDayOfWeek,
        sumAbsolute:sumAbsolute
    }
}


function processRawDataIntoMap(map:Map<string, Map<number,number>>, rawData:rawData, instance:string, clientId:string, requestType:string):Map<string, Map<number,number>>{
    
    if(rawData.sumAbsolute == 0){
        return map
    }

    map = processRawDataAndDataTypeIntoMap(map, rawData.sumByDay, instance, clientId, requestType, DATA_TYPE.SUM_BY_DAY)
    map = processRawDataAndDataTypeIntoMap(map, rawData.sumByWeek, instance, clientId, requestType, DATA_TYPE.SUM_BY_WEEK)
    map = processRawDataAndDataTypeIntoMap(map, rawData.sumByMonth, instance, clientId, requestType, DATA_TYPE.SUM_BY_MONTH)
    map = processRawDataAndDataTypeIntoMap(map, rawData.sumByDayOfWeek, instance, clientId, requestType, DATA_TYPE.SUM_BY_DAY_OF_WEEK)
    map = processRawDataAndDataTypeIntoMap(map, rawData.avgByDayOfWeek, instance, clientId, requestType, DATA_TYPE.AVG_BY_DAY_OF_WEEK)

    map = processRawDataAndDataTypeIntoMap(map, rawData.sumByDay, instance, clientId, '', DATA_TYPE.SUM_BY_DAY) //For Tableur

    let tmp_map = new Map<number, number>()
    tmp_map.set(0,rawData.sumAbsolute)
    map = processRawDataAndDataTypeIntoMap(map, tmp_map, instance, clientId, requestType, DATA_TYPE.ABSOLUTE_SUM)
    map = processRawDataAndDataTypeIntoMap(map, tmp_map, instance, clientId, '', DATA_TYPE.ABSOLUTE_SUM) //For Tableur

    return map
}

function processRawDataAndDataTypeIntoMap(map:Map<string, Map<number,number>>,  mapValue:Map<number,number>, instance:string, clientId:string, requestType:string, dataType:string):Map<string, Map<number,number>>{

    let key1 = getHashKey(null, clientId, requestType, dataType)
    map = updateMapWithKey(map, key1, mapValue)

    return map
}

function updateMapWithKey(map:Map<string, Map<number,number>>, key:string, mapValue:Map<number,number>):Map<string, Map<number,number>>{
    
    let existingMapValue = new Map<number,number>()
    if(map.has(key)){
        existingMapValue = map.get(key) as Map<number,number>
    }

    existingMapValue = fusionMap([existingMapValue, mapValue])
    map.set(key, existingMapValue)

    return map
}

export function retriveEnrichedData(){

}