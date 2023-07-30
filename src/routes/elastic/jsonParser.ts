import { REQUEST_TYPE, type clientIdElastic, type elasticStore} from "$lib/elasticStruct"
import { emptyClientIdElastic } from "./clientIdElasticFactory"

interface locaStorageValue extends Record<string,string> { //could be extends Record<string,any> but here it's not necessary,  allow adding member of object in TS
        clientId:string,
        instance:string
}

interface localStorageError{
    type:string,
    data:string
}

export function fromElasticStoretoJson(store:elasticStore):string{
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
            //tmp_str = reduceArray(clientIdElastic[requestType], store.minDate, store.maxDate)
            tmp_str = clientIdElastic[requestType].join('|')
            if(tmp_str !== ''){
                lsValue[requestType] = tmp_str
            }             
        }

        allClientId.push(lsValue)
    })

    store.errors.forEach((error, key) => {
        //tmp_str = reduceArray(error, store.minDate, store.maxDate)
        tmp_str = error.join('|')
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

export function fromJsonToElasticStore(json:any):elasticStore{
    let container = new Map<string,clientIdElastic>()
    let errors = new Map<string,number[]>()
    let tmp_clientIdElastic:clientIdElastic
    let minDate = new Date(json['minDate'])
    let maxDate = new Date(json['maxDate'])
 
    json['container']?.forEach((lsValue:locaStorageValue) => {

        tmp_clientIdElastic = emptyClientIdElastic(lsValue.clientId, lsValue.instance)

        for(const requestType in REQUEST_TYPE){
            tmp_clientIdElastic[requestType] = inflateArray2(lsValue[requestType])
        }

        container.set(tmp_clientIdElastic.clientId, tmp_clientIdElastic)
    })
    
    json['errors']?.forEach((lsValue:localStorageError) => {
        errors.set(lsValue.type, inflateArray2(lsValue.data))
    })

    let elasticStore:elasticStore = {
        minDate: minDate,
        maxDate: maxDate,
        container: container,
        errors:errors
    }
    return elasticStore
}

function inflateArray2(str: string): number[] {
    
    let matrix:number[] = []
    if(str === undefined){
        return matrix
    }

    str.split('|').forEach((val, index)=>{
        if(val !== null && val !== ''){
            matrix[index] = parseInt(val)
        }
    })

    return matrix
}