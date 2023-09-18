import { ERROR_BY_CLIENTID_TYPE, REQUEST_TYPE} from "$lib/elasticStruct"
import { emptyClientIdError, type clientIdElastic, type clientIdError, type elasticStore, emptyClientIdElastic, emptyClientRequestUsers, type clientIdRequestUsers } from "./elasticStoreFactory"


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
    let allRequestUsers:locaStorageValue[] = []
    let allErrorsByClientId:locaStorageValue[] = []
    let allErrorsSoc:localStorageError[] = []
    let tmp_str:string

    store.containerClientId.forEach((clientIdElastic,key) => {

        lsValue = {
            clientId:clientIdElastic.clientId,
            instance:clientIdElastic.instance
        }

        for(const requestType in REQUEST_TYPE){
            if(clientIdElastic[requestType] == undefined){
                clientIdElastic[requestType] = []
            }
            tmp_str = clientIdElastic[requestType].join('|')
            if(tmp_str !== ''){
                lsValue[requestType] = tmp_str
            }             
        }

        allClientId.push(lsValue)
    })


    store.containerRequestUsers.forEach((clientIdRequestUsers,key) => {

        lsValue = {
            clientId:clientIdRequestUsers.clientId,
            instance:clientIdRequestUsers.instance
        }

        for(const requestType in REQUEST_TYPE){
            if(clientIdRequestUsers[requestType] == undefined){
                clientIdRequestUsers[requestType] = []
            }
            tmp_str = clientIdRequestUsers[requestType].join('|')
            if(tmp_str !== ''){
                lsValue[requestType] = tmp_str
            }             
        }

        allRequestUsers.push(lsValue)
    })


    store.containerErrorsByClientId.forEach((clientIError,key) => {

        lsValue = {
            clientId:clientIError.clientId,
            instance:clientIError.instance
        }
        for(const errorType in ERROR_BY_CLIENTID_TYPE){
            if(clientIError[errorType] == undefined){
                clientIError[errorType] = []
            }
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
        containerRequestUsers: allRequestUsers,
        containerErrorsByClientId: allErrorsByClientId,
        containerErrorsSoc : allErrorsSoc,
        minDate: store.minDate,
        maxDate: store.maxDate
    })

    return json
}

export function fromJsonToElasticStore(json:any):elasticStore{
    let containerRequetHits = new Map<string,clientIdElastic>()
    let containerRequetUsers = new Map<string,clientIdRequestUsers>()
    let containerErrorsByClientId = new Map<string,clientIdError>()
    let containerErrorsSoc = new Map<string,number[]>()
    let tmp_clientIdElastic:clientIdElastic
    let tmp_clientIdRequestUsers:clientIdRequestUsers
    let tmp_clientIdError:clientIdError
    let minDate = new Date(json['minDate'])
    let maxDate = new Date(json['maxDate'])
 
    json['container']?.forEach((lsValue:locaStorageValue) => {

        tmp_clientIdElastic = emptyClientIdElastic(lsValue.clientId, lsValue.instance)

        for(const requestType in REQUEST_TYPE){
            tmp_clientIdElastic[requestType] = inflateArray(lsValue[requestType])
        }

        containerRequetHits.set(tmp_clientIdElastic.clientId, tmp_clientIdElastic)
    })

    json['containerRequestUsers']?.forEach((lsValue:locaStorageValue) => {

        tmp_clientIdRequestUsers = emptyClientRequestUsers(lsValue.clientId, lsValue.instance)

        for(const requestType in REQUEST_TYPE){
            tmp_clientIdRequestUsers[requestType] = inflateArray(lsValue[requestType])
        }

        containerRequetUsers.set(tmp_clientIdRequestUsers.clientId, tmp_clientIdRequestUsers)
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
        containerClientId: containerRequetHits,
        containerRequestUsers: containerRequetUsers,
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