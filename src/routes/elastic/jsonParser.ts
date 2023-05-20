import { REQUEST_TYPE, type clientIdElastic, type elasticStore} from "$lib/elasticStruct"
import { emptyClientIdElastic } from "./clientIdElasticFactory"
import { readDataOfMatrix, writeDataInMatrix } from "./matrixUtils"

interface locaStorageValue extends Record<string,string> { //could be extends Record<string,any> but here it's not necessary,  allow adding member of object in TS
        clientId:string,
        instance:string
}

interface localStorageError{
    type:string,
    data:string
}

export function toJson(store:elasticStore):string{
    //console.info("toJson")

    let lsValue:locaStorageValue
    let allClientId:locaStorageValue[] = []
    let allErrors:localStorageError[] = []
    let tmp_str:string

    store.container.forEach((clientIdElastic,key) => {

        lsValue = {
            clientId:clientIdElastic.clientId,
            instance:clientIdElastic.instance
        }

        for(const requestType in REQUEST_TYPE){
            tmp_str = reduceArray(clientIdElastic[requestType], store.minDate, store.maxDate)
            if(tmp_str !== ''){
                lsValue[requestType] = tmp_str
            }             
        }

        allClientId.push(lsValue)
    })

    store.errors.forEach((error, key) => {
        tmp_str = reduceArray(error, store.minDate, store.maxDate)
        if(tmp_str !== ''){
            allErrors.push({
                type: key,
                data: tmp_str
            })
        }   

    })

    let json =  JSON.stringify({
        container: allClientId,
        minDate: store.minDate,
        maxDate: store.maxDate,
        errors : allErrors
    })

    return json
}

function reduceArray(arr:number[][][][], minDate:Date, maxDate:Date):string{
    let values:any[] = []
    let hasValue:boolean = false
    let start = new Date(minDate)
    while(start <= maxDate){
        for(let i=0; i < 8;i++){
            start.setHours(i*3)
            let val = readDataOfMatrix(arr,start)
            if(isNaN(val as any)){
                console.error("NAN for ", arr, start)
                val=null
            }
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


export function fromJsonMixedObject(json:any):elasticStore{
    let container = new Map<string,clientIdElastic>()
    let errors = new Map<string,number[][][][]>()
    let tmp_clientIdElastic:clientIdElastic
    let minDate = new Date(json['minDate'])
    let maxDate = new Date(json['maxDate'])

    json['container'].forEach((lsValue:locaStorageValue) => {

        tmp_clientIdElastic = emptyClientIdElastic(lsValue.clientId, lsValue.instance)

        for(const requestType in REQUEST_TYPE){
            tmp_clientIdElastic[requestType] = inflateArray(lsValue[requestType], minDate, maxDate)
        }

        container.set(tmp_clientIdElastic.clientId, tmp_clientIdElastic)
    })
    
    json['errors'].forEach((lsValue:localStorageError) => {
        errors.set(lsValue.type, inflateArray(lsValue.data, minDate, maxDate))
    })

    let elasticStore:elasticStore = {
        minDate: minDate,
        maxDate: maxDate,
        container: container,
        errors:errors
    }
    return elasticStore
}

function inflateArray(str: string, minDate:Date, maxDate:Date): number[][][][] {
    
    let matrix:number[][][][] = []
    if(str === undefined){
        return matrix
    }
    let start = new Date(minDate)
    let values = str.split('|')
    let pos = 0
    
    while(start <= maxDate){
        for(let i=0; i < 8;i++){
            start.setHours(i*3)
            
            let val = values[pos]

            if(val !== null && val !== ''){
                matrix = writeDataInMatrix(matrix,start,parseInt(val))
            }

            pos++
        }
        start.setHours(0)
        start.setDate(start.getDate()+1)
    }
    
    return matrix

}
