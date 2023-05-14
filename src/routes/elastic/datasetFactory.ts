
import { CSV_TYPE, REQUEST_TYPE, type clientIdElastic, type datasetAndLimits, type elasticStore, type pointer } from '$lib/elasticStruct';

const DAY_OF_WEEK = [7,1,2,3,4,5,6] //Sunday, Monday ...

export function initiateDataset(store:elasticStore, csvType:CSV_TYPE, requestType:REQUEST_TYPE|null=null):datasetAndLimits{
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
                switch(csvType){
                    case CSV_TYPE.STRONGBOX:
                        value = readDataOfClientId(clientId._s,start)
                        break
                    case CSV_TYPE.HABILITATION:
                        value = readDataOfClientId(clientId._h,start)
                        break;
                    default:
                        value = readDataOfClientIdByRequestType(clientId, requestType, start)
                        break;
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


function readDataOfClientIdByRequestType(clientId:clientIdElastic, requestType: REQUEST_TYPE | null, start: Date): number | null {
    switch(requestType){
        case REQUEST_TYPE.USER_INFO_REQUEST :
            return readDataOfClientId(clientId.USER_INFO_REQUEST, start)
            break
        case REQUEST_TYPE.LOGIN_ERROR :
            return readDataOfClientId(clientId.LOGIN_ERROR, start)
            break
        case REQUEST_TYPE.CODE_TO_TOKEN :
            return readDataOfClientId(clientId.CODE_TO_TOKEN, start)
            break
        case REQUEST_TYPE.LOGIN :
            return readDataOfClientId(clientId.LOGIN, start)
            break
        case REQUEST_TYPE.REFRESH_TOKEN :
            return readDataOfClientId(clientId.REFRESH_TOKEN, start)
            break
        case REQUEST_TYPE.CLIENT_LOGIN :
            return readDataOfClientId(clientId.CLIENT_LOGIN, start)
            break
        case REQUEST_TYPE.RESET_PASSWORD_ERROR :
            return readDataOfClientId(clientId.RESET_PASSWORD_ERROR, start)
            break
        case REQUEST_TYPE.TOKEN_EXCHANGE :
            return readDataOfClientId(clientId.TOKEN_EXCHANGE, start)
            break
        case REQUEST_TYPE.UPDATE_PROFILE :
            return readDataOfClientId(clientId.UPDATE_PROFILE, start)
            break
        case REQUEST_TYPE.REFRESH_TOKEN_ERROR :
            return readDataOfClientId(clientId.REFRESH_TOKEN_ERROR, start)
            break
        case REQUEST_TYPE.CUSTOM_REQUIRED_ACTION_ERROR :
            return readDataOfClientId(clientId.CUSTOM_REQUIRED_ACTION_ERROR, start)
            break
        case REQUEST_TYPE.CODE_TO_TOKEN_ERROR :
            return readDataOfClientId(clientId.CODE_TO_TOKEN_ERROR, start)
            break
        case REQUEST_TYPE.SEND_RESET_PASSWORD_ERROR :
            return readDataOfClientId(clientId.SEND_RESET_PASSWORD_ERROR, start)
            break
        case REQUEST_TYPE.SEND_VERIFY_EMAIL_ERROR :
            return readDataOfClientId(clientId.SEND_VERIFY_EMAIL_ERROR, start)
            break
        case REQUEST_TYPE.UPDATE_PASSWORD :
            return readDataOfClientId(clientId.UPDATE_PASSWORD, start)
            break
        case REQUEST_TYPE.LOGOUT :
            return readDataOfClientId(clientId.LOGOUT, start)
            break
        case REQUEST_TYPE.CUSTOM_REQUIRED_ACTION :
            return readDataOfClientId(clientId.CUSTOM_REQUIRED_ACTION, start)
            break
    }
    return null
}


function readDataOfClientId(arr: number[][][][], date: Date):number|null {
    let pointer = dateToPointer(date)
    if( arr[pointer.y] !== undefined 
            && arr[pointer.y][pointer.m] !== undefined
            && arr[pointer.y][pointer.m][pointer.d] !== undefined
            && arr[pointer.y][pointer.m][pointer.d][pointer.h / 3] !== undefined ){
        return arr[pointer.y][pointer.m][pointer.d][pointer.h / 3]
    }
    return null
}

function dateToPointer(date:Date):pointer{
    return {
        y:date.getFullYear(),
        m:date.getMonth()+1,
        d:date.getDate(),
        h:date.getHours(),
    }
}