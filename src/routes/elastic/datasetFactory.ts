
import type { Timeline } from '$lib/Timeline.class';
import { getKeysOfClientIdElastic, type datasetTableurHit, type elasticStore, DATA_TYPE, type minMax, type rawData } from '$lib/elasticStruct';
import type { instance } from '$lib/gitStruct';


export function getRawData(arr:number[], timeline:Timeline):rawData{
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

function addToMap(map:Map<number, number>, key:number, value:number){
    let val = 0
    if(map.has(key)){
        val = map.get(key) as number
    }
    val += value
    map.set(key, val)
    return map
}

export function processRawDataIntoMap(map:Map<string, Map<number,number>>, rawData:rawData, instance:string, clientId:string, requestType:string):Map<string, Map<number,number>>{
    map = processRawDataAndDataTypeIntoMap(map, rawData.sumByDay, instance, clientId, requestType, DATA_TYPE.SUM_BY_DAY)
    map = processRawDataAndDataTypeIntoMap(map, rawData.sumByWeek, instance, clientId, requestType, DATA_TYPE.SUM_BY_WEEK)
    map = processRawDataAndDataTypeIntoMap(map, rawData.sumByMonth, instance, clientId, requestType, DATA_TYPE.SUM_BY_MONTH)
    map = processRawDataAndDataTypeIntoMap(map, rawData.sumByDayOfWeek, instance, clientId, requestType, DATA_TYPE.SUM_BY_DAY_OF_WEEK)
    map = processRawDataAndDataTypeIntoMap(map, rawData.avgByDayOfWeek, instance, clientId, requestType, DATA_TYPE.AVG_BY_DAY_OF_WEEK)


    let tmp_map = new Map<number, number>()
    tmp_map.set(0,rawData.sumAbsolute)
    map = processRawDataAndDataTypeIntoMap(map, tmp_map, instance, clientId, requestType, DATA_TYPE.ABSOLUTE_SUM)

    return map
}

function processRawDataAndDataTypeIntoMap(map:Map<string, Map<number,number>>,  mapValue:Map<number,number>, instance:string, clientId:string, requestType:string, dataType:string):Map<string, Map<number,number>>{

    let key1 = getHashKey(null, clientId, requestType, dataType)
    map = updateMapWithKey(map, key1, mapValue)

    let key2 = getHashKey(null, clientId, null, dataType)
    map = updateMapWithKey(map, key2, mapValue)

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
export function initTableur(store:elasticStore, timeline:Timeline, instances:instance[], whitelist:string[], globalMap:Map<string, Map<number, number>>):datasetTableurHit[]{
    
    let start = new Date()
    let datasetByHit : datasetTableurHit[] = []
    
    let tmp_value:number|null
    let sumOfHitsForDay:number
    let maxHits:number
    let sumHits:number
    let maxDate:number
    let firstSeenTS:number
    let lastSeenTS:number
    let knownClientId = getListOfClientId(instances, whitelist)

    let sumRolling = new Map<number, number>()
    let cptRolling = new Map<number, number>()
    let avgRolling = new Map<number, number>()
    let keys = getKeysOfClientIdElastic()

    //console.debug(" > before foreach container ended in " + ((new Date()).getTime() - start.getTime()) + "ms since start")

    store.container.forEach(clientId => {
        let start2 = new Date()
        //start = new Date(store.minDate)
        maxDate = DATE_1900
        firstSeenTS = DATE_2900
        lastSeenTS = DATE_1900
        maxHits = 0
        sumHits = 0
        sumRolling = new Map<number, number>()
        cptRolling = new Map<number, number>()
        avgRolling = new Map<number, number>()


        //Initiate keys for avgRolling
        timeline.getTimestampsOfDay().forEach((timestamp:number, index) => {
            sumRolling.set(timestamp, 0)
            cptRolling.set(timestamp, 0)
        })

        let switchDay = false
        timeline.getTimestampsOfDay().forEach((timestamp:number, index) => {

            //Changement de jour la prochaine itération
            switchDay = (timeline.getTimestampOfDayByIndex(index) !== timeline.getTimestampOfDayByIndex(index+1))
           
            keys.forEach(key => {                    
                tmp_value = clientId[key][index]
                if(tmp_value !== null && tmp_value !== undefined && !isNaN(tmp_value)){
                    sumOfHitsForDay += tmp_value
                    sumHits += tmp_value
                    if(firstSeenTS > timestamp){
                        firstSeenTS = timestamp
                    }
                    lastSeenTS = timestamp
                }
            });
            //console.debug(" > 1st loop ended in " + ((new Date()).getTime() - start.getTime()) + "ms since start")

            if(switchDay){
                let timeStampIn30Days = 0
                for(let j=0; j<(30*8);j++){
                    timeStampIn30Days = timeline.getTimestampOfDayByIndex(j+index)
                    if(sumRolling.has(timeStampIn30Days)) {
                        sumRolling.set(timeStampIn30Days, sumRolling.get(timeStampIn30Days) as number + sumOfHitsForDay)
                    } 
                    if(cptRolling.has(timeStampIn30Days)) {
                        cptRolling.set(timeStampIn30Days, cptRolling.get(timeStampIn30Days) as number + 1)
                    }
                }
                
                if(sumOfHitsForDay > maxHits){
                    maxHits = sumOfHitsForDay
                    maxDate = timestamp
                }

                //Reset var
                sumOfHitsForDay=0

            }
            //console.debug(" > 2nd loop ended in " + ((new Date()).getTime() - start.getTime()) + "ms since start")
            
        })

        let sum, cpt = 0
        timeline.getTimestampsOfDay().forEach((timestamp:number, index) => {
            sum = 0
            cpt = 1

            if(!avgRolling.has(timestamp)){
                if(sumRolling.has(timestamp)){
                    sum = sumRolling.get(timestamp) as number
                } 
                if(cptRolling.has(timestamp)){
                    cpt = cptRolling.get(timestamp) as number
                }
                avgRolling.set(timestamp, sum/cpt)
            }
        })
        //console.debug(" > 3th loop ended in " + ((new Date()).getTime() - start.getTime()) + "ms since start")


        //Find rolling avg J-30
        // 1 : Get index of "30 day before the end"
        let index30d = timeline.length() -1 - (30*8)
        // 2 : Find the TS of the day 0h00
        let ts30d = timeline.getTimestampOfDayByIndex(index30d)
        let avgHit30d = -1
        if(avgRolling.has(ts30d)){
            avgHit30d = Math.round(avgRolling.get(ts30d) as number)
        }

        let duration =  Math.round((lastSeenTS - firstSeenTS) / 86400000) + 1
        
        //Find if the current clientId is a well-known and recognized clientId
        let isKnown = knownClientId.includes(clientId.clientId.toLocaleLowerCase())

        datasetByHit.push({
            clientId: clientId.clientId.trim(),
            instance: clientId.instance,
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
        
        //console.debug(" > 4th part ended in " + ((new Date()).getTime() - start.getTime()) + "ms since start")
        //console.debug(" > round ended in " + ((new Date()).getTime() - start2.getTime()) + "ms since start")
    });
    return datasetByHit
}

function getListOfClientId(instances:instance[], whitelist:string[]):string[]{
    let list:string[]=[]
    instances.forEach(instance => {
        instance.royaumes.forEach(r => {
            r.clientIds?.forEach(c => {
                list.push(c.label.toLocaleLowerCase())
            });
        });
    });

    //Add whitelist
    list = list.concat(whitelist)

    return list
}