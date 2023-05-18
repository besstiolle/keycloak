import { REQUEST_TYPE, type clientIdElastic, type elasticStore, type pointer } from "$lib/elasticStruct"
import { dateToPointer, readDataOfClientId } from "./datasetFactory"

interface locaStorageValue extends Record<string,string> { //could be extends Record<string,any> but here it's not necessary,  allow adding member of object in TS
        clientId:string,
        instance:string,
        _s:string,
        _h:string
}

export function ElasticStoreToJson(store:elasticStore):string{

    let lsValue:locaStorageValue
    let allClientId:locaStorageValue[] = []

    store.container.forEach((value,key) => {

        lsValue = {
            clientId:value.clientId,
            instance:value.instance,
            _s:reduceArray(value._s, store),
            _h:reduceArray(value._h, store)
        }

        for(const requestType in REQUEST_TYPE){
            lsValue[key] = reduceArray(value[key], store)
        }

        allClientId.push(lsValue)
    })

    let json =  JSON.stringify({
        container: allClientId,
        minDate: store.minDate,
        maxDate: store.maxDate
    })

    return json
}

function reduceArray(arr:number[][][][], store:elasticStore){
    let values:any[] = []
    let hasValue:boolean = false
    let start = new Date(store.minDate)
    while(start <= store.maxDate){
        for(let i=0; i < 8;i++){
            start.setHours(i*3)
            let val = readDataOfClientId(arr,start)
            if(val !== null){
                hasValue = true
            }
            values.push(val)
        }
        start.setHours(0)
        start.setDate(start.getDate()+1)
    }
    if(!hasValue){
        return ''
    }
    return values.join('|')
}


export function ElasticStoreFromJson(json:any):elasticStore{
    let container = new Map<string,clientIdElastic>()
    let tmp_clientIdElastic:clientIdElastic
    let minDate = new Date(json['minDate'])
    let maxDate = new Date(json['maxDate'])

    json['container'].forEach((lsValue:locaStorageValue) => {

        tmp_clientIdElastic = {
            clientId:lsValue.clientId,
            instance:lsValue.instance,
            _s:inflateArray(lsValue._s, minDate, maxDate),
            _h:inflateArray(lsValue._h, minDate, maxDate),
        }

        for(const requestType in REQUEST_TYPE){
            tmp_clientIdElastic.requestType = inflateArray(lsValue.requestType, minDate, maxDate)
        }

        //console.info(lsValue.clientId)

        container.set(tmp_clientIdElastic.clientId, tmp_clientIdElastic)
    })


    let elasticStore:elasticStore = {
        minDate: minDate,
        maxDate: maxDate,
        container: container
    }
    return elasticStore
}

function inflateArray(str: string, minDate:Date, maxDate:Date): number[][][][] {
    let arr:number[][][][] = []
    let start = new Date(minDate)
    let values = str.split('|')
    let pos = 0
    while(start <= maxDate){
        for(let i=0; i < 8;i++){
            start.setHours(i*3)
            
            let val = values[pos]

            if(val !== null){
                arr = writeDataOfClientId(arr,start,parseInt(val))
            }

            pos++
        }
        start.setHours(0)
        start.setDate(start.getDate()+1)
    }

    return arr

}

function writeDataOfClientId(arr: number[][][][], date: Date, value:number): number[][][][]{
    let pointer = dateToPointer(date)
    if( arr == undefined) {
        arr = []
    }
    if(arr[pointer.y] === undefined) {
        arr[pointer.y] = []
    }
    if(arr[pointer.y][pointer.m] === undefined) {
        arr[pointer.y][pointer.m] = []
    }
    if(arr[pointer.y][pointer.m][pointer.d] === undefined) {
        arr[pointer.y][pointer.m][pointer.d] = []
    }
    if(arr[pointer.y][pointer.m][pointer.d][pointer.h / 3] === undefined) {
        arr[pointer.y][pointer.m][pointer.d][pointer.h / 3] = value
    }
    return arr
}