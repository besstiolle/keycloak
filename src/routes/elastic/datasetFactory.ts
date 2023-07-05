
import { getKeysOfClientIdElastic, type datasetTableurHit, type elasticStore, DATA_TYPE, type minMax, type rawData } from '$lib/elasticStruct';
import type { commit } from '$lib/struct';
import { readDataOfMatrix } from './matrixUtils';

const DAY_OF_WEEK = [7,1,2,3,4,5,6] //Sunday, Monday ...

interface AllDates{
    day:number
    startOfWeek:number
    startOfMonth:number
    dayOfWeek:number
}

let map = new Map<number, AllDates>()
function findAllDates(date:Date):AllDates{
    if(map.has(date.valueOf())){
        return map.get(date.valueOf()) as AllDates
    }

    let allDate:AllDates = {
        day : date.getTime(),
        startOfWeek : getStartOfWeek(date).getTime(),
        startOfMonth : getStartOfMonth(date).getTime(),
        dayOfWeek : date.getDay()
        //dayofYear : getDayOfYear(start)
    }
    map.set(date.valueOf(), allDate)
    return allDate
}

export function getRawData(arr:number[][][][], start:Date, end:Date):rawData{
    let tmp_val:null|number = 0
    let value = 0
    let sumByDay = new Map<number,number>()  // eg : today 0:00
    let sumByWeek = new Map<number,number>() // eg : monday 0:00
    let sumByMonth = new Map<number,number>() // eg : first day of month 0:00
    let sumByDayOfWeek = new Map<number,number>() // 1 -> 7, 7 indexes
    let cptByDayOfWeek = new Map<number,number>() // 1 -> 7, 7 indexes
    let avgByDayOfWeek = new Map<number,number>() // 1 -> 7, 7 indexes
    //let sumByDayOfYear = new Map<number,number>() // 1 -> 365, 365 indexes
    //let cptByDayOfYear = new Map<number,number>() // 1 -> 365, 365 indexes
    let sumAbsolute = 0
    let allDate:AllDates
    let eightHours:Date[] = []

    //start.setHours(0)
    while (start <= end){
        
        allDate = findAllDates(start)
        eightHours = get8Hours(start)
        for(let hours of eightHours){
            tmp_val = readDataOfMatrix(arr, hours)
            value = 0
            if(tmp_val != null){
                value = tmp_val
                sumByDay = addToMap(sumByDay, allDate.day, value)
                sumByWeek = addToMap(sumByWeek, allDate.startOfWeek, value)
                sumByMonth = addToMap(sumByMonth, allDate.startOfMonth, value)
                sumByDayOfWeek = addToMap(sumByDayOfWeek, allDate.dayOfWeek, value)
                
                //sumByDayOfYear = addToMap(sumByDayOfYear, dayofYear, value)
                //cptByDayOfYear = addToMap(cptByDayOfWeek, dayOfWeek, 1)
                sumAbsolute += value
            }
        }
        
        cptByDayOfWeek = addToMap(cptByDayOfWeek, allDate.dayOfWeek, 1)

        start.setDate(start.getDate()+1)
    }

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
        //sumByDayOfYear:sumByDayOfYear,
        //cptByDayOfYear:cptByDayOfYear,
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

function getStartOfMonth(now:Date){
    return new Date(now.getFullYear(), now.getMonth(), 1);
}

function getStartOfWeek(date:Date){
    let now  = new Date(date)
    now.setDate(now.getDate() - (now.getDay() + 6) % 7)
    return now
}

function getDayOfYear(now:Date):number{
    let start = new Date(now.getFullYear(), 0, 0)
    let diff = (now.getTime() - start.getTime()) + ((start.getTimezoneOffset() - now.getTimezoneOffset()) * 60 * 1000)
    const oneDay = 1000 * 60 * 60 * 24
    return Math.floor(diff / oneDay)
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
    //map = processRawDataAndDataTypeIntoMap(map, rawData.sumByDayOfYear, instance, clientId, requestType, DATA_TYPE.SUM_BY_DAY_OF_YEAR)

    //console.info(rawData.cptByDayOfWeek)

    return map
}

function processRawDataAndDataTypeIntoMap(map:Map<string, Map<number,number>>,  mapValue:Map<number,number>, instance:string, clientId:string, requestType:string, dataType:string):Map<string, Map<number,number>>{
    //	6 Types of keys
    //Key 1 : Instance only + type of data 						=> x||*||*||¤
    //Key 2 : client ID only + type of data 				    => *||y||*||¤
    //Key 3 : RequestType only + type of data 					=> *||*||z||¤
    //Key 4 : Instance + RequestType + type of data 			=> x||*||z||¤
    //Key 5 : client ID + RequestType + type of data 			=> *||y||z||¤
    //Key 6 : Instance + client ID + RequesType + type of data 	=> x||y||z||¤

   // let key1 = getHashKey(instance, null, null, dataType)
  //  let key2 = getHashKey(null, clientId, null, dataType)
  //  let key3 = getHashKey(null, null, requestType, dataType)
  //  let key4 = getHashKey(instance, null, requestType, dataType)
    let key5 = getHashKey(null, clientId, requestType, dataType)
   // let key6 = getHashKey(instance, clientId, requestType, dataType)

  //  map = updateMapWithKey(map, key1, mapValue)
  //  map = updateMapWithKey(map, key2, mapValue)
  //  map = updateMapWithKey(map, key3, mapValue)
  //  map = updateMapWithKey(map, key4, mapValue)
    map = updateMapWithKey(map, key5, mapValue)
  //  map = updateMapWithKey(map, key6, mapValue)

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

const DATE_1900 = new Date("1900-01-01")
const DATE_2900 = new Date("2900-01-01")

let map8Hours = new Map<number, Date[]>()
function get8Hours(date:Date):Date[]{
    if(map8Hours.has(date.valueOf())){
       return map8Hours.get(date.valueOf()) as Date[] 
    }

    let start = new Date(date)
    let dates:Date[] = []
    for(let i=0; i < 8;i++){
        dates.push(new Date(start.setHours(i*3)))
    }
    map8Hours.set(date.valueOf(), dates)
    return dates
}

export function initTableur(store:elasticStore, commit:commit, whitelist:string[]):datasetTableurHit[]{
    
    let datasetByHit : datasetTableurHit[] = []
    let start:Date
    let tmp_value:number|null
    let sumOfHitsForDay:number
    let maxHits:number
    let sumHits:number
    let maxDate:Date
    let firstSeen:Date
    let lastSeen:Date
    let knownClientId = getListOfClientId(commit, whitelist)

    let sumRolling = new Map<number, number>()
    let cptRolling = new Map<number, number>()
    let avgRolling = new Map<number, number>()
    let keys = getKeysOfClientIdElastic()
    let eightHours:Date[] = []

    store.container.forEach(clientId => {

        start = new Date(store.minDate)
        maxDate = new Date(DATE_1900)
        firstSeen = new Date(DATE_2900)
        lastSeen = new Date(DATE_1900)
        maxHits = 0
        sumHits = 0
        sumRolling = new Map<number, number>()
        cptRolling = new Map<number, number>()
        avgRolling = new Map<number, number>()
        //let keys = getKeysOfClientIdElastic()

        //Initiate keys for avgRolling
        start.setHours(0)
        while (start <= store.maxDate){
            sumRolling.set(start.getTime(), 0)
            cptRolling.set(start.getTime(), 0)
            start.setDate(start.getDate()+1)
        }

        start = new Date(store.minDate)
        start.setHours(0)
        while (start <= store.maxDate){
            sumOfHitsForDay=0
            eightHours = get8Hours(start)
            for(let hours of eightHours){
                keys.forEach(key => {                    
                    tmp_value = readDataOfMatrix(clientId[key], hours)
                    if(tmp_value !== null){
                        sumOfHitsForDay += tmp_value
                        sumHits += tmp_value
                        if(firstSeen > start){
                            console.info()
                            firstSeen = new Date(hours)
                        }
                        lastSeen = new Date(hours)
                    }
                });
            }
            start.setHours(0)


            let tmp_d:Date = new Date(start)
            for(let j=0; j<30;j++){
                tmp_d.setDate(start.getDate() + j)
                if(sumRolling.has(tmp_d.getTime())) {
                    sumRolling.set(tmp_d.getTime(), sumRolling.get(tmp_d.getTime()) as number + sumOfHitsForDay)
                } 
                if(cptRolling.has(tmp_d.getTime())) {
                    cptRolling.set(tmp_d.getTime(), cptRolling.get(tmp_d.getTime()) as number + 1)
                }
            }

            if(sumOfHitsForDay > maxHits){
                maxHits = sumOfHitsForDay
                maxDate = new Date(start)
            }

            start.setDate(start.getDate()+1)
        }

        //Processing rolling avg 
        start = new Date(store.minDate)
        start.setHours(0)
        let sum, cpt =0
        while (start <= store.maxDate){
            
            sum = 0
            cpt = 1

            if(sumRolling.has(start.getTime())){
                sum = sumRolling.get(start.getTime()) as number
            } 
            if(cptRolling.has(start.getTime())){
                cpt = cptRolling.get(start.getTime()) as number
            }

            avgRolling.set(start.getTime(), sum/cpt)

            start.setDate(start.getDate()+1)
        }

        //Find rolling avg J-30
        let end = new Date(store.maxDate)
        end.setHours(0)
        end.setDate(start.getDate()-30)
        let avgHit30d = -1
        if(avgRolling.has(end.getTime())){
            avgHit30d = Math.round(avgRolling.get(end.getTime()) as number)
        }

        let duration = Math.round((lastSeen.getTime() - firstSeen.getTime()) / 86400000) + 1
        
        //Find if the current clientId is a well-known and recognized clientId
        let isKnown = knownClientId.includes(clientId.clientId.toLocaleLowerCase())

        datasetByHit.push({
            clientId: clientId.clientId.trim(),
            instance: clientId.instance,
            firstSeen: firstSeen,
            lastSeen: lastSeen,
            duration:duration,
            avgAll:Math.round(sumHits / duration),
            avgHit30d: avgHit30d,
            maxhit: maxHits,
            maxDate: maxDate,
            sumHits:sumHits,
            isKnown:isKnown
        })
    });
    return datasetByHit
}

function getListOfClientId(commit:commit, whitelist:string[]):string[]{
    let list:string[]=[]
    commit.instances.forEach(instance => {
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