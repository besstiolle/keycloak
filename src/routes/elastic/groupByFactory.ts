import { DATA_TYPE, type LabelAndDataset } from "$lib/elasticStruct"
import { VERTICAL_TWO_DOT } from "./const"
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

    
    //Sort desc by weight
    values.sort(function (ob1, ob2) {
        return ob2.weight - ob1.weight
    });


    if(values.length > MAX_VALUES){
        let newDatas:Map<number, number>[] = []
        let newWeight = 0
        let shortValues:LabelAndDataset[] = values.slice(0,MAX_VALUES)
        values.slice(MAX_VALUES).forEach(labelAndDataset => {
            newDatas.push(labelAndDataset.data)
            newWeight += labelAndDataset.weight
        });

        //Add +1 last dataset
        shortValues.push({
            label:"Others",
            data:fusionMap(newDatas),
            weight:newWeight
        })

        return shortValues
    } 

    return values
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
                        label: instance + VERTICAL_TWO_DOT + clientId + VERTICAL_TWO_DOT + requestType,
                        data: globalMap.get(getHashKey(null,clientId,requestType,engine.dataTypeSelected)) as Map<number,number>,
                        weight : (globalMap.get(getHashKey(null,clientId,requestType,DATA_TYPE.ABSOLUTE_SUM)) as Map<number,number>).get(0) as number
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
    let weight = 0

    for(let instance of engine.selectedInstances){
        for(let requestType of engine.selectedRequestsType){
            tmp_maps = []
            weight = 0
            for(let clientId of engine.selectedClientsId){
                if(engine.instanceToClientId.get(instance)?.includes(clientId)){
                    tmp_maps.push(globalMap.get(getHashKey(null,clientId,requestType,engine.dataTypeSelected)) as Map<number,number>)
                    weight += (globalMap.get(getHashKey(null,clientId,requestType,DATA_TYPE.ABSOLUTE_SUM)) as Map<number,number>).get(0) as number
                }
            }
            allLabelsAndDatasets.push({
                label: instance + VERTICAL_TWO_DOT + requestType,
                data: fusionMap(tmp_maps),
                weight : weight
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
    let weight = 0
    
    for(let requestType of engine.selectedRequestsType){
        tmp_maps = []
        weight = 0
        for(let instance of engine.selectedInstances){
            for(let clientId of engine.selectedClientsId){
                if(engine.instanceToClientId.get(instance)?.includes(clientId)){
                    tmp_maps.push(globalMap.get(getHashKey(null,clientId,requestType,engine.dataTypeSelected)) as Map<number,number>)
                    weight += (globalMap.get(getHashKey(null,clientId,requestType,DATA_TYPE.ABSOLUTE_SUM)) as Map<number,number>).get(0) as number
                }
            }
        }
        allLabelsAndDatasets.push({
            label: requestType,
            data: fusionMap(tmp_maps),
            weight : weight
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
    let weight = 0

    for(let instance of engine.selectedInstances){
        for(let clientId of engine.selectedClientsId){
            if(engine.instanceToClientId.get(instance)?.includes(clientId)){
                tmp_maps = []
                weight = 0
                for(let requestType of engine.selectedRequestsType){
                    tmp_maps.push(globalMap.get(getHashKey(null,clientId,requestType,engine.dataTypeSelected)) as Map<number,number>)
                    weight += (globalMap.get(getHashKey(null,clientId,requestType,DATA_TYPE.ABSOLUTE_SUM)) as Map<number,number>).get(0) as number
                }

                allLabelsAndDatasets.push({
                    label: instance + VERTICAL_TWO_DOT + clientId,
                    data: fusionMap(tmp_maps),
                    weight : weight
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
    let weight = 0

    for(let instance of engine.selectedInstances){
        tmp_maps = []
        weight = 0
        for(let clientId of engine.selectedClientsId){
            if(engine.instanceToClientId.get(instance)?.includes(clientId)){
                for(let requestType of engine.selectedRequestsType){
                    tmp_maps.push(globalMap.get(getHashKey(null,clientId,requestType,engine.dataTypeSelected)) as Map<number,number>)
                    weight += (globalMap.get(getHashKey(null,clientId,requestType,DATA_TYPE.ABSOLUTE_SUM)) as Map<number,number>).get(0) as number
                }
            }
        }
        allLabelsAndDatasets.push({
            label: instance,
            data: fusionMap(tmp_maps),
            weight : weight
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
    let weight = 0

    for(let requestType of engine.selectedRequestsType){
        for(let instance of engine.selectedInstances){
            for(let clientId of engine.selectedClientsId){
                if(engine.instanceToClientId.get(instance)?.includes(clientId)){
                    tmp_maps.push(globalMap.get(getHashKey(null,clientId,requestType,engine.dataTypeSelected)) as Map<number,number>)
                    weight += (globalMap.get(getHashKey(null,clientId,requestType,DATA_TYPE.ABSOLUTE_SUM)) as Map<number,number>).get(0) as number
                }
            }
        }
    }
    allLabelsAndDatasets.push({
        label: "all informations selected",
        data: fusionMap(tmp_maps),
        weight : weight
    })
    return allLabelsAndDatasets
}
