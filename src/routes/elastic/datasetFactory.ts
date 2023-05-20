
import type { REQUEST_TYPE, datasetAndLimits, elasticStore } from '$lib/elasticStruct';
import { readDataOfMatrix } from './matrixUtils';

const DAY_OF_WEEK = [7,1,2,3,4,5,6] //Sunday, Monday ...

export function initiateDatasetFromStore(store:elasticStore, requestType:REQUEST_TYPE|null=null):datasetAndLimits{
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