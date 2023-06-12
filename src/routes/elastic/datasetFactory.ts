
import { getKeysOfClientIdElastic, type REQUEST_TYPE, type datasetAndLimitsForLine, type datasetAndLimitsForPie, type datasetTableurHit, type elasticStore } from '$lib/elasticStruct';
import type { commit } from '$lib/struct';
import { readDataOfMatrix } from './matrixUtils';

const DAY_OF_WEEK = [7,1,2,3,4,5,6] //Sunday, Monday ...

export function initiateDatasetFromStoreForLine(store:elasticStore, requestType:REQUEST_TYPE|null=null):datasetAndLimitsForLine{
    //console.info("initiateDatasetFromStore")
    let start = store.minDate
    let value:number|null=0
    let tmp_val:number=0
    let sumOfDay:number=0
    
    let sumByTsMax = 0
    let sumByTs = new Map<number,number>()
    let avgByTs = new Map<number,number>()
    let sumByDayOfWeek = new Map<number, number>()
    let countByDayOfWeek = new Map<number, number>()
    let avgByDayOfWeek = new Map<number, number>()

    store.container.forEach(clientId => {
        start = new Date(store.minDate)
        while (start <= store.maxDate){
            sumOfDay=0
            for(let i=0; i < 8;i++){
                start.setHours(i*3)
                value = 0
                if(requestType != null){
                    value = readDataOfMatrix(clientId[requestType], start)
                } else {
                    throw "requestType can't be null if CSV type is KEYCLOAK"
                }
                if(value !==null){
                    sumOfDay+= value
                }
            }
            start.setHours(0)

            if(sumByTs.has(start.getTime()/1000)){
                tmp_val = (sumByTs.get(start.getTime()/1000) as number)+ sumOfDay
                sumByTs.set(start.getTime()/1000,tmp_val)
                
                if(sumByTsMax < tmp_val){
                    sumByTsMax = tmp_val
                }
            } else {
                sumByTs.set(start.getTime()/1000,sumOfDay)
                avgByTs.set(start.getTime()/1000,-1) //Initiate for later in the code
            }

            /**
             * Section to processing AVG by DAY OF WEEK (part I)
            */
            let dayOfWeek = DAY_OF_WEEK[start.getDay()] //Translation sunday -> saturday to monday -> sunday like real people
            if(sumByDayOfWeek.has(dayOfWeek)){
                tmp_val = sumByDayOfWeek.get(dayOfWeek) as number + sumOfDay
                sumByDayOfWeek.set(dayOfWeek, tmp_val)
            } else {
                sumByDayOfWeek.set(dayOfWeek, sumOfDay)
            }

            /**
             * End of Section
            */

            start.setDate(start.getDate()+1)
        }

    })

    /**
     * Section to processing AVG by DAY OF WEEK (part II)
    */
    start = new Date(store.minDate)
    start.setHours(0)
    while (start <= store.maxDate){
        let dayOfWeek = DAY_OF_WEEK[start.getDay()]
        if(countByDayOfWeek.has(dayOfWeek)){
            tmp_val = countByDayOfWeek.get(dayOfWeek) as number + 1
            countByDayOfWeek.set(dayOfWeek, tmp_val)
        } else {
            countByDayOfWeek.set(dayOfWeek, 1)
        }
        start.setDate((start.getDate()+1))
    }
    DAY_OF_WEEK.forEach(dayOfWeek => {
        if(sumByDayOfWeek.has(dayOfWeek)){
            avgByDayOfWeek.set(dayOfWeek, (sumByDayOfWeek.get(dayOfWeek) as number) / (countByDayOfWeek.get(dayOfWeek) as number))
        } else {
            avgByDayOfWeek.set(dayOfWeek, 0)
        }
    })
    /**
     * End of Section
    */

    /**
     * Section to processing 2nd dataset of "sumByTs*" chart
    */
    avgByTs.forEach((value, key) => {
        avgByTs.set(key, avgByDayOfWeek.get(DAY_OF_WEEK[(new Date(key * 1000)).getDay()]) as number)
    })


    /**
     * Build All Datasets for Charts
    */
    let datasets = [{label:"Σ of hits by day",data:sumByTs},
                    {label:"x̄ by day of week", data:avgByTs}]

    let datasetAndLimits = {
        min:0,
        max:sumByTsMax,
        datasets:datasets
    }

    return datasetAndLimits
}


export function initiateDatasetFromStoreForPie(store:elasticStore):datasetAndLimitsForPie{
    let start:Date
    let tmp_value:number|null
    let sumOfError:number
    let datasetAndLimits:datasetAndLimitsForPie = {
        datasets:[]
    }
    let mapTypeErrorToCount = new Map<string,number>()

    store.errors.forEach((values, key) => {
        start = new Date(store.minDate)
        sumOfError=0
        while (start <= store.maxDate){
            for(let i=0; i < 8;i++){
                start.setHours(i*3)
                tmp_value = readDataOfMatrix(values, start)
                if(tmp_value !== null){
                    sumOfError += tmp_value
                }
            }
            start.setHours(0)
            start.setDate(start.getDate()+1)
        }
        mapTypeErrorToCount.set(key, sumOfError)
    })

    datasetAndLimits.datasets.push({
        label:'Σ d\'erreurs sur la période',
        data:mapTypeErrorToCount
    })
    return datasetAndLimits
}

function getListOfClientId(commit:commit):string[]{
    let list:string[]=[]
    commit.instances.forEach(instance => {
        instance.royaumes.forEach(r => {
            r.clientIds?.forEach(c => {
                list.push(c.label)
            });
        });
    });
    return list
}

export function initTableur(store:elasticStore, commit:commit):datasetTableurHit[]{
    
    let datasetByHit : datasetTableurHit[] = []
    let start:Date
    let tmp_value:number|null
    let sumOfHitsForDay:number
    let maxHits:number
    let sumHits:number
    let maxDate:Date
    let firstSeen:Date
    let lastSeen:Date
    let knownClientId = getListOfClientId(commit)

    store.container.forEach(clientId => {

        start = new Date(store.minDate)
        maxDate = new Date("1900-01-01")
        firstSeen = new Date("2900-01-01")
        lastSeen = new Date("1900-01-01")
        maxHits = 0
        sumHits = 0
        let sumRolling:Map<number, number> = new Map<number, number>()
        let cptRolling:Map<number, number> = new Map<number, number>()
        let avgRolling:Map<number, number> = new Map<number, number>()
        let keys = getKeysOfClientIdElastic()

        //Initiate keys for avgRolling
        while (start <= store.maxDate){
            start.setHours(0)
            sumRolling.set(start.getTime(), 0)
            cptRolling.set(start.getTime(), 0)
            start.setDate(start.getDate()+1)
        }

        start = new Date(store.minDate)
        while (start <= store.maxDate){
            sumOfHitsForDay=0
            for(let i=0; i < 8;i++){
                start.setHours(i*3)
                keys.forEach(key => {                    
                    tmp_value = readDataOfMatrix(clientId[key], start)
                    if(tmp_value !== null){
                        sumOfHitsForDay += tmp_value
                        sumHits += tmp_value
                        if(firstSeen > start){
                            firstSeen = new Date(start)
                        }
                        lastSeen = new Date(start)
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
        let sum, cpt =0
        while (start <= store.maxDate){
            start.setHours(0)
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
        let isKnown = knownClientId.includes(clientId.clientId)

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
