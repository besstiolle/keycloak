import { ERROR_BY_CLIENTID_TYPE, REQUEST_TYPE, type clientIdElastic, type clientIdError, type elasticStore} from "$lib/elasticStruct"
import { emptyClientIdElastic } from "./clientIdElasticFactory"
import { emptyClientIdError } from "./clientIdErrorFactory"

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
    let allErrorsByClientId:locaStorageValue[] = []
    let allErrorsSoc:localStorageError[] = []
    let tmp_str:string

    store.containerClientId.forEach((clientIdElastic,key) => {

        lsValue = {
            clientId:clientIdElastic.clientId,
            instance:clientIdElastic.instance
        }

        for(const requestType in REQUEST_TYPE){
            tmp_str = clientIdElastic[requestType].join('|')
            if(tmp_str !== ''){
                lsValue[requestType] = tmp_str
            }             
        }

        allClientId.push(lsValue)
    })

    store.containerErrorsByClientId.forEach((clientIError,key) => {

        lsValue = {
            clientId:clientIError.clientId,
            instance:clientIError.instance
        }
        for(const errorType in ERROR_BY_CLIENTID_TYPE){
            tmp_str = clientIError[errorType].join('|')
            if(tmp_str !== ''){
                lsValue[errorType] = tmp_str
            }             
        }

        allErrorsByClientId.push(lsValue)
    })

    store.containerErrorsSoc.forEach((error, key) => {
        tmp_str = error.join('|')
        if(tmp_str !== ''){
            allErrorsSoc.push({
                type: key,
                data: tmp_str
            })
        }   

    })

    let json =  JSON.stringify({
        container: allClientId,
        containerErrorsByClientId: allErrorsByClientId,
        containerErrorsSoc : allErrorsSoc,
        minDate: store.minDate,
        maxDate: store.maxDate
    })

    return json
}

export function fromJsonToElasticStore(json:any):elasticStore{
    let containerClientId = new Map<string,clientIdElastic>()
    let containerErrorsByClientId = new Map<string,clientIdError>()
    let containerErrorsSoc = new Map<string,number[]>()
    let tmp_clientIdElastic:clientIdElastic
    let tmp_clientIdError:clientIdError
    let minDate = new Date(json['minDate'])
    let maxDate = new Date(json['maxDate'])
 
    json['container']?.forEach((lsValue:locaStorageValue) => {

        tmp_clientIdElastic = emptyClientIdElastic(lsValue.clientId, lsValue.instance)

        for(const requestType in REQUEST_TYPE){
            tmp_clientIdElastic[requestType] = inflateArray(lsValue[requestType])
        }

        containerClientId.set(tmp_clientIdElastic.clientId, tmp_clientIdElastic)
    })

    json['containerErrorsByClientId']?.forEach((lsValue:locaStorageValue) => {

        tmp_clientIdError = emptyClientIdError(lsValue.clientId, lsValue.instance)

        for(const errorType in ERROR_BY_CLIENTID_TYPE){
            tmp_clientIdError[errorType] = inflateArray(lsValue[errorType])
        }

        containerErrorsByClientId.set(tmp_clientIdError.clientId, tmp_clientIdError)
    })
    
    json['containerErrorsSoc']?.forEach((lsValue:localStorageError) => {
        containerErrorsSoc.set(lsValue.type, inflateArray(lsValue.data))
    })

    let elasticStore:elasticStore = {
        minDate: minDate,
        maxDate: maxDate,
        containerClientId: containerClientId,
        containerErrorsByClientId: containerErrorsByClientId,
        containerErrorsSoc : containerErrorsSoc,
    }
    return elasticStore
}

function inflateArray(str: string): number[] {
    
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