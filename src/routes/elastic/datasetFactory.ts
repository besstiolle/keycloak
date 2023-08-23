
import type { Timeline } from '$lib/Timeline.class';
import type { Config } from '$lib/configStruct';
import type { minMax } from '$lib/elasticStruct';
import type { elasticStore } from './elasticStoreFactory';
import type { EnrichedDataWrapper } from './enrichedDataFactory';
import { DATA_TYPE } from './sideStateFactory';
import { SmellEngine } from './smellEngine';
import type { instance } from "$lib/gitStruct";

export interface DatasetAndLimitsForLine{
    min:number,
    max:number,
    labelsAndDatasets:LabelAndDataset[]
}

export interface LabelAndDataset{
    label:string,
    data:Map<number, number>,
    weight:number
}
export interface LabelAndDatasetString{
    label:string,
    data:Map<string, number>
}
export interface datasetTableurHit{
    clientId:string,
    instance: string,
    firstSeen:Date,
    lastSeen:Date,
    duration:number,
    avgAll:number,
    avgHit30d:number,
    maxhit:number,
    maxDate:Date
    sumHits:number,
    isKnown:boolean
}


export function addToMap(map:Map<number, number>, key:number, value:number){
    let val = 0
    if(map.has(key)){
        val = map.get(key) as number
    }
    val += value
    map.set(key, val)
    return map
}

export function fusionMap(allMap:Map<number,number>[]):Map<number,number>{
    if(allMap.length == 0){
        return new Map<number, number>()
    }
    if(allMap.length == 1){
        return allMap[0]
    }
    if(allMap[1] == undefined){
        console.info("allMap[1] was undefined", allMap)
        return new Map<number, number>()
    }
    let map3 = new Map(allMap[0])
    let valueMap1 = 0
    allMap[1].forEach((valueMap2, key)  => {
        valueMap1 = 0
        if(map3.has(key)){
            valueMap1 = map3.get(key) as number
        }
        map3.set(key, valueMap1 + valueMap2)
    });

    if(allMap.length > 2){
        map3 = fusionMap([map3].concat(allMap.slice(2)))
    }

    return map3
}

const DELIM = '||'
const STAR = '*'
export function getHashKey(instance:string|null, clientId:string|null, requestType:string|null, dataType:string):string{
    return (instance?instance:STAR)+DELIM+(clientId?clientId:STAR)+DELIM+(requestType?requestType:STAR)+DELIM+dataType
}


export function getMinMax(allMap:Map<number,number>[], ob:minMax|null = null):minMax{
    if(ob == null){
        ob = {
            min:9999999999,
            max:0
        }
    }

    if(allMap.length == 0){
        return ob
    }
    
    if(allMap.length > 1){
        ob = getMinMax(allMap.slice(1), ob)
    }

    let min = ob.min
    let max = ob.max
    allMap[0].forEach((value) => {
        if(min > value){
            min = value
        }
        if(max < value){
            max = value
        }
    });


    return {min:min, max:max}
}

const DATE_1900:number = new Date("1900-01-01").valueOf()
const DATE_2900:number = new Date("2900-01-01").valueOf()
export function initTableur(store:elasticStore, timeline:Timeline, instances:instance[], config:Config, enrichedData:EnrichedDataWrapper):datasetTableurHit[]{
    
    let datasetByHit : datasetTableurHit[] = []
    
    let maxHits:number
    let sumHits:number
    let maxDate:number
    let firstSeenTS:number
    let lastSeenTS:number
    let smellEngine = new SmellEngine(instances, config)
    let sum30:number = 0
    let cpt30 = 0
    let avgHit30d = 0
    let globalMap:Map<string, Map<number, number>> = enrichedData.rawData

    enrichedData.allClientIds.forEach(clientId => {
        maxDate = DATE_1900
        firstSeenTS = DATE_2900
        lastSeenTS = DATE_1900
        maxHits = 0
        sumHits = 0
        sum30 = 0
        cpt30 = 0
        avgHit30d = 0

        let mapDays = globalMap.get(getHashKey(null, clientId, null, DATA_TYPE.SUM_BY_DAY)) as Map<number, number>
        let mapAbsolute = globalMap.get(getHashKey(null, clientId, null, DATA_TYPE.ABSOLUTE_SUM)) as Map<number, number>

        //Find rolling avg J-30
        // 1 : Get index of "30 day before the end"
        let index30d = timeline.length() -1 - (30*8)
        // 2 : Find the TS of the day 0h00
        let timeStamp30LatestDays = timeline.getTimestampOfDayByIndex(index30d)

        mapDays.forEach((value, key) => {
            if(value > 0){
                if(firstSeenTS > key){
                    firstSeenTS = key
                }
                lastSeenTS = key
            }
            
            if(value > maxHits){
                maxHits = value
                maxDate = key
            }

            //Start cumulating data on the 30 last days
            if(key >= timeStamp30LatestDays){
                sum30 += value
                cpt30 ++
            }
        })

        avgHit30d = 0
        if(cpt30){
            avgHit30d = Math.round(sum30 / cpt30)
        }

        sumHits = mapAbsolute.get(0) as number
        let duration =  Math.round((lastSeenTS - firstSeenTS) / 86400000) + 1
        
        //Find if the current clientId is a well-known and recognized clientId
        let isKnown = !smellEngine.isSmellByLabel(clientId)

        datasetByHit.push({
            clientId: clientId.trim(),
            instance: enrichedData.clientIdToInstance.get(clientId) as string,
            firstSeen: new Date(firstSeenTS),
            lastSeen: new Date(lastSeenTS),
            duration:duration,
            avgAll:Math.round(sumHits / duration),
            avgHit30d: avgHit30d,
            maxhit: maxHits,
            maxDate: new Date(maxDate),
            sumHits:sumHits,
            isKnown:isKnown
        })
    });
    return datasetByHit
}
