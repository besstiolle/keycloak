import { DATA_TYPE } from "$lib/elasticStruct"
import { fusionMap, getHashKey } from "./datasetFactory"


export class GroupByEngine{

    isGroupAllInstance:boolean = true
    isGroupClientId:boolean = true
    isGroupRequestType:boolean = true

    
    selectedInstances:string[] = []
    selectedClientsId:string[] = []
    selectedRequestsType:string[] = []

    instanceToClientId:Map<string,string[]> = new Map<string,string[]>()

    dataTypeSelected:DATA_TYPE = DATA_TYPE.SUM_BY_DAY

    constructor(isGroupAllInstance:boolean, isGroupClientId:boolean, isGroupRequestType:boolean, selectedInstances:string[], selectedClientsId:string[], selectedRequestsType:string[], dataTypeSelected:DATA_TYPE, instanceToClientId:Map<string,string[]>){
        this.isGroupAllInstance = isGroupAllInstance
        this.isGroupClientId = isGroupClientId
        this.isGroupRequestType = isGroupRequestType
        this.selectedInstances = selectedInstances
        this.selectedClientsId = selectedClientsId
        this.selectedRequestsType  = selectedRequestsType
        this.dataTypeSelected = dataTypeSelected
        this.instanceToClientId = instanceToClientId
    }
}

const MAX_VALUES = 10
export function runEngine(engine:GroupByEngine, globalMap:Map<string, Map<number, number>>):LabelAndDataset[]{

    /*
     * Can be : 
     *   0 : distinct instance,     distinct client ,   distinct request
     *   1 : group all instances,   N/A,                distinct request => n'a pas de raison d'exister.
     *   2 : distinct instance,     group all client,   distinct request
     *   3 : group all instances,   group all client,   distinct request
     *   4 : distinct instance,     distinct client ,   group all request
     *   5 : group all instances,   N/A,                group all request => n'a pas de raison d'exister.
     *   6 : distinct instance,     group all client,   group all request
     *   7 : group all instances,   group all client,   group all request
    */
    let dumb = (engine.isGroupAllInstance?1:0) + (engine.isGroupClientId?2:0) + (engine.isGroupRequestType?4:0) 
    let values:LabelAndDataset[] = []

    switch (dumb){
        case 0: values = _run0(engine, globalMap);break
        //case 1: 
        case 2: values =  _run2(engine, globalMap);break
        case 3: values =  _run3(engine, globalMap);break
        case 4: values =  _run4(engine, globalMap);break
        //case 5: 
        case 6: values =  _run6(engine, globalMap);break
        case 7: values =  _run7(engine, globalMap);break
        default:console.error("cas d'usage non définit. dumb was ", dumb)
    }

    if(values.length > MAX_VALUES){
        values = values.slice(0,MAX_VALUES)
    }

    return values
}

export interface LabelAndDataset{
    label:string,
    map:Map<number,number>
}


/**
 *   0 : distinct instance,     distinct client ,   distinct request
 * @param engine 
 * @param globalMap 
 * @returns 
 */
function _run0(engine:GroupByEngine, globalMap:Map<string, Map<number, number>>):LabelAndDataset[]{
    let allLabelsAndDatasets:LabelAndDataset[] = []
    for(let instance of engine.selectedInstances){
        for(let clientId of engine.selectedClientsId){
            if(engine.instanceToClientId.get(instance)?.includes(clientId)){
                for(let requestType of engine.selectedRequestsType){
                    allLabelsAndDatasets.push({
                        label: instance + ":" + clientId + ":" + requestType,
                        map: globalMap.get(getHashKey(null,clientId,requestType,engine.dataTypeSelected)) as Map<number,number>
                    })
                }
            }
        }
    }
    return allLabelsAndDatasets
}

/**
 *   2 : distinct instance,     group all client,   distinct request
 * @param engine 
 * @param globalMap 
 * @returns 
 */
function _run2(engine:GroupByEngine, globalMap:Map<string, Map<number, number>>):LabelAndDataset[]{
    let allLabelsAndDatasets:LabelAndDataset[] = []
    let tmp_maps:Map<number,number>[]

    for(let instance of engine.selectedInstances){
        for(let requestType of engine.selectedRequestsType){
            tmp_maps = []
            for(let clientId of engine.selectedClientsId){
                if(engine.instanceToClientId.get(instance)?.includes(clientId)){
                    tmp_maps.push(globalMap.get(getHashKey(null,clientId,requestType,engine.dataTypeSelected)) as Map<number,number>)
                }
            }
            allLabelsAndDatasets.push({
                label: instance + ":" + "" + ":" + requestType,
                map: fusionMap(tmp_maps)
            })
        }
    }
    return allLabelsAndDatasets
}

/**
 *   3 : group all instances,   group all client,   distinct request
 * @param engine 
 * @param globalMap 
 * @returns 
 */
function _run3(engine:GroupByEngine, globalMap:Map<string, Map<number, number>>):LabelAndDataset[]{
    let allLabelsAndDatasets:LabelAndDataset[] = []
    let tmp_maps:Map<number,number>[]
    
    for(let requestType of engine.selectedRequestsType){
        tmp_maps = []
        for(let instance of engine.selectedInstances){
            for(let clientId of engine.selectedClientsId){
                if(engine.instanceToClientId.get(instance)?.includes(clientId)){
                    tmp_maps.push(globalMap.get(getHashKey(null,clientId,requestType,engine.dataTypeSelected)) as Map<number,number>)
                }
            }
        }
        allLabelsAndDatasets.push({
            label: "" + ":" + "" + ":" + requestType,
            map: fusionMap(tmp_maps)
        })
    }
    return allLabelsAndDatasets
}


/**
 *   4 : distinct instance,     distinct client ,   group all request
 * @param engine 
 * @param globalMap 
 * @returns 
 */
function _run4(engine:GroupByEngine, globalMap:Map<string, Map<number, number>>):LabelAndDataset[]{
    let allLabelsAndDatasets:LabelAndDataset[] = []
    let tmp_maps:Map<number,number>[]

    for(let instance of engine.selectedInstances){
        for(let clientId of engine.selectedClientsId){
            if(engine.instanceToClientId.get(instance)?.includes(clientId)){
                tmp_maps = []
                for(let requestType of engine.selectedRequestsType){
                    tmp_maps.push(globalMap.get(getHashKey(null,clientId,requestType,engine.dataTypeSelected)) as Map<number,number>)
                }

                allLabelsAndDatasets.push({
                    label: instance +":"+clientId,
                    map: fusionMap(tmp_maps)
                })
            }
        }
    }
    return allLabelsAndDatasets
}


/**
 *   6 : distinct instance,     group all client,   group all request
 * @param engine 
 * @param globalMap 
 * @returns 
 */
function _run6(engine:GroupByEngine, globalMap:Map<string, Map<number, number>>):LabelAndDataset[]{
    let allLabelsAndDatasets:LabelAndDataset[] = []
    let tmp_maps:Map<number,number>[] = []
    for(let instance of engine.selectedInstances){
        tmp_maps=[]
        for(let clientId of engine.selectedClientsId){
            if(engine.instanceToClientId.get(instance)?.includes(clientId)){
                for(let requestType of engine.selectedRequestsType){
                    tmp_maps.push(globalMap.get(getHashKey(null,clientId,requestType,engine.dataTypeSelected)) as Map<number,number>)
                }
            }
        }
        allLabelsAndDatasets.push({
            label: instance,
            map: fusionMap(tmp_maps)
        })
    }
    
    return allLabelsAndDatasets
}


/**
 *   7 : group all instances,   group all client,   group all request
 * @param engine 
 * @param globalMap 
 * @returns 
 */
function _run7(engine:GroupByEngine, globalMap:Map<string, Map<number, number>>):LabelAndDataset[]{
    let allLabelsAndDatasets:LabelAndDataset[] = []
    let tmp_maps:Map<number,number>[] = []
    for(let requestType of engine.selectedRequestsType){
        for(let instance of engine.selectedInstances){
            for(let clientId of engine.selectedClientsId){
                if(engine.instanceToClientId.get(instance)?.includes(clientId)){
                    tmp_maps.push(globalMap.get(getHashKey(null,clientId,requestType,engine.dataTypeSelected)) as Map<number,number>)
                }
            }
        }
    }
    allLabelsAndDatasets.push({
        label: "all informations selected",
        map: fusionMap(tmp_maps)
    })
    return allLabelsAndDatasets
}
