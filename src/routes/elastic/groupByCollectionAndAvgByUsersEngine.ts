import type { LabelAndDataset } from "$lib/elasticStruct"
import { VERTICAL_TWO_DOT } from "./const"
import { fusionMap, getHashKey } from "./datasetFactory"
import { DATA_TYPE } from "./sideStateFactory"


export class groupByCollectionAndAvgByUsersEngine{

    isGroupAllInstance:boolean = true
    isGroupClientId:boolean = true
    isGroupCollection:boolean = true

    
    selectedInstances:string[] = []
    selectedClientsId:string[] = []
    selectedCollection:string[] = []

    instanceToClientId:Map<string,string[]> = new Map<string,string[]>()

    dataTypeSelected:DATA_TYPE = DATA_TYPE.SUM_BY_DAY

    suffixCollection:string = ''

    constructor(isGroupAllInstance:boolean, isGroupClientId:boolean, isGroupCollection:boolean, selectedInstances:string[], selectedClientsId:string[], 
            selectedCollection:string[], dataTypeSelected:DATA_TYPE, instanceToClientId:Map<string,string[]>, suffixCollection:string=''){
        this.isGroupAllInstance = isGroupAllInstance
        this.isGroupClientId = isGroupClientId
        this.isGroupCollection = isGroupCollection
        this.selectedInstances = selectedInstances
        this.selectedClientsId = selectedClientsId
        this.selectedCollection  = selectedCollection
        this.dataTypeSelected = dataTypeSelected
        this.instanceToClientId = instanceToClientId
        this.suffixCollection = suffixCollection
    }
}

const MAX_VALUES = 10
const MACRON = 'x̄ '
const BY_USERS = ' / users'

export function runGroupByCollectionAndAvgByUsersEngine(engine:groupByCollectionAndAvgByUsersEngine, allRawData:Map<string, Map<number, number>>):LabelAndDataset[]{

    /*
     * Can be : 
     *   0 : distinct instance,     distinct client ,   distinct elt of Collection
     *   1 : group all instances,   N/A,                distinct elt of Collection => n'a pas de raison d'exister.
     *   2 : distinct instance,     group all client,   distinct elt of Collection
     *   3 : group all instances,   group all client,   distinct elt of Collection
     *   4 : distinct instance,     distinct client ,   group all elt of Collection
     *   5 : group all instances,   N/A,                group all elt of Collection => n'a pas de raison d'exister.
     *   6 : distinct instance,     group all client,   group all elt of Collection
     *   7 : group all instances,   group all client,   group all elt of Collection
    */
    let dumb = (engine.isGroupAllInstance?1:0) + (engine.isGroupClientId?2:0) + (engine.isGroupCollection?4:0) 
    let values:LabelAndDataset[] = []

    switch (dumb){
        case 0: values = _run0(engine, allRawData);break
        //case 1: 
        case 2: values =  _run2(engine, allRawData);break
        case 3: values =  _run3(engine, allRawData);break
        case 4: values =  _run4(engine, allRawData);break
        //case 5: 
        case 6: values =  _run6(engine, allRawData);break
        case 7: values =  _run7(engine, allRawData);break
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
 *   0 : distinct instance,     distinct client ,   distinct elt of Collection
 * @param engine 
 * @param allRawData 
 * @returns 
 */
function _run0(engine:groupByCollectionAndAvgByUsersEngine, allRawData:Map<string, Map<number, number>>):LabelAndDataset[]{
    let allLabelsAndDatasets:LabelAndDataset[] = []
    let tmp_map_forHits:Map<number,number>
    let tmp_map_forUsers:Map<number,number>
    let tmp_map_combined:Map<number,number>
    for(let instance of engine.selectedInstances){
        for(let clientId of engine.selectedClientsId){
            if(engine.instanceToClientId.get(instance)?.includes(clientId)){
                for(let element of engine.selectedCollection){
                    tmp_map_forHits = _getDataFromAllRawData(allRawData, clientId, '', element, engine.dataTypeSelected)
                    tmp_map_forUsers = _getDataFromAllRawData(allRawData, clientId, engine.suffixCollection, element, engine.dataTypeSelected)
                    tmp_map_combined = avgOfMap(tmp_map_forHits, tmp_map_forUsers)
                    allLabelsAndDatasets.push({
                        label: MACRON + instance + VERTICAL_TWO_DOT + clientId + VERTICAL_TWO_DOT + element + BY_USERS,
                        data: tmp_map_combined,
                        weight : getWeightOfMapCombined(tmp_map_combined)
                    })
                }
            }
        }
    }
    return allLabelsAndDatasets
}

/**
 *   2 : distinct instance,     group all client,   distinct elt of collection
 * @param engine 
 * @param allRawData 
 * @returns 
 */
function _run2(engine:groupByCollectionAndAvgByUsersEngine, allRawData:Map<string, Map<number, number>>):LabelAndDataset[]{
    let allLabelsAndDatasets:LabelAndDataset[] = []
    let tmp_map_forHits:Map<number,number>[] = []
    let tmp_map_forUsers:Map<number,number>[] = []
    let tmp_map_combined:Map<number,number>
    let weight = 0

    for(let instance of engine.selectedInstances){
        for(let element of engine.selectedCollection){
            weight = 0
            for(let clientId of engine.selectedClientsId){
                if(engine.instanceToClientId.get(instance)?.includes(clientId)){
                    tmp_map_forHits.push(_getDataFromAllRawData(allRawData, clientId, '', element, engine.dataTypeSelected))
                    tmp_map_forUsers.push(_getDataFromAllRawData(allRawData, clientId, engine.suffixCollection, element, engine.dataTypeSelected))
                }
            }

            tmp_map_combined = avgOfMap( fusionMap(tmp_map_forHits), fusionMap(tmp_map_forUsers))
            weight = getWeightOfMapCombined(tmp_map_combined)

            allLabelsAndDatasets.push({
                label: MACRON + instance + VERTICAL_TWO_DOT + element + BY_USERS,
                data: tmp_map_combined,
                weight : weight
            })
        }
    }
    return allLabelsAndDatasets
}

/**
 *   3 : group all instances,   group all client,   distinct elt of collection
 * @param engine 
 * @param allRawData 
 * @returns 
 */
function _run3(engine:groupByCollectionAndAvgByUsersEngine, allRawData:Map<string, Map<number, number>>):LabelAndDataset[]{
    let allLabelsAndDatasets:LabelAndDataset[] = []
    let tmp_map_forHits:Map<number,number>[] = []
    let tmp_map_forUsers:Map<number,number>[] = []
    let tmp_map_combined:Map<number,number>
    let weight = 0
    
    for(let element of engine.selectedCollection){
        weight = 0
        for(let instance of engine.selectedInstances){
            for(let clientId of engine.selectedClientsId){
                if(engine.instanceToClientId.get(instance)?.includes(clientId)){
                    tmp_map_forHits.push(_getDataFromAllRawData(allRawData, clientId, '', element, engine.dataTypeSelected))
                    tmp_map_forUsers.push(_getDataFromAllRawData(allRawData, clientId, engine.suffixCollection, element, engine.dataTypeSelected))
                }
            }
        }

        tmp_map_combined = avgOfMap( fusionMap(tmp_map_forHits), fusionMap(tmp_map_forUsers))
        weight = getWeightOfMapCombined(tmp_map_combined)

        allLabelsAndDatasets.push({
            label: MACRON + element + BY_USERS,
            data: tmp_map_combined,
            weight : weight
        })
        
    }
    return allLabelsAndDatasets
}


/**
 *   4 : distinct instance,     distinct client ,   group all elt of collection
 * @param engine 
 * @param allRawData 
 * @returns 
 */
function _run4(engine:groupByCollectionAndAvgByUsersEngine, allRawData:Map<string, Map<number, number>>):LabelAndDataset[]{
    let allLabelsAndDatasets:LabelAndDataset[] = []
    let tmp_map_forHits:Map<number,number>[] = []
    let tmp_map_forUsers:Map<number,number>[] = []
    let tmp_map_combined:Map<number,number>
    let weight = 0

    for(let instance of engine.selectedInstances){
        for(let clientId of engine.selectedClientsId){
            if(engine.instanceToClientId.get(instance)?.includes(clientId)){
                weight = 0
                for(let element of engine.selectedCollection){
                    tmp_map_forHits.push(_getDataFromAllRawData(allRawData, clientId, '', element, engine.dataTypeSelected))
                    tmp_map_forUsers.push(_getDataFromAllRawData(allRawData, clientId, engine.suffixCollection, element, engine.dataTypeSelected))
                }

                tmp_map_combined = avgOfMap( fusionMap(tmp_map_forHits), fusionMap(tmp_map_forUsers))
                weight = getWeightOfMapCombined(tmp_map_combined)

                allLabelsAndDatasets.push({
                    label: MACRON + instance + VERTICAL_TWO_DOT + clientId + BY_USERS,
                    data: tmp_map_combined,
                    weight : weight
                })
            }
        }
    }
    return allLabelsAndDatasets
}


/**
 *   6 : distinct instance,     group all client,   group all elt of collection
 * @param engine 
 * @param allRawData 
 * @returns 
 */
function _run6(engine:groupByCollectionAndAvgByUsersEngine, allRawData:Map<string, Map<number, number>>):LabelAndDataset[]{
    let allLabelsAndDatasets:LabelAndDataset[] = []
    let tmp_map_forHits:Map<number,number>[] = []
    let tmp_map_forUsers:Map<number,number>[] = []
    let tmp_map_combined:Map<number,number>
    let weight = 0

    for(let instance of engine.selectedInstances){
        weight = 0
        for(let clientId of engine.selectedClientsId){
            if(engine.instanceToClientId.get(instance)?.includes(clientId)){
                for(let element of engine.selectedCollection){
                    tmp_map_forHits.push(_getDataFromAllRawData(allRawData, clientId, '', element, engine.dataTypeSelected))
                    tmp_map_forUsers.push(_getDataFromAllRawData(allRawData, clientId, engine.suffixCollection, element, engine.dataTypeSelected))
                }
            }
        }

        tmp_map_combined = avgOfMap( fusionMap(tmp_map_forHits), fusionMap(tmp_map_forUsers))
        weight = getWeightOfMapCombined(tmp_map_combined)

        allLabelsAndDatasets.push({
            label: MACRON + instance + BY_USERS,
            data: tmp_map_combined,
            weight : weight
        })
    }
    
    return allLabelsAndDatasets
}


/**
 *   7 : group all instances,   group all client,   group all elt of collection
 * @param engine 
 * @param allRawData 
 * @returns 
 */
function _run7(engine:groupByCollectionAndAvgByUsersEngine, allRawData:Map<string, Map<number, number>>):LabelAndDataset[]{
    let allLabelsAndDatasets:LabelAndDataset[] = []
    let tmp_map_forHits:Map<number,number>[] = []
    let tmp_map_forUsers:Map<number,number>[] = []
    let tmp_map_combined:Map<number,number>
    let weight = 0

    for(let element of engine.selectedCollection){
        for(let instance of engine.selectedInstances){
            for(let clientId of engine.selectedClientsId){
                if(engine.instanceToClientId.get(instance)?.includes(clientId)){
                    tmp_map_forHits.push(_getDataFromAllRawData(allRawData, clientId, '', element, engine.dataTypeSelected))
                    tmp_map_forUsers.push(_getDataFromAllRawData(allRawData, clientId, engine.suffixCollection, element, engine.dataTypeSelected))
                }
            }
        }
    }

    tmp_map_combined = avgOfMap( fusionMap(tmp_map_forHits), fusionMap(tmp_map_forUsers))
    weight = getWeightOfMapCombined(tmp_map_combined)

    allLabelsAndDatasets.push({
        label: MACRON + "all informations selected" + BY_USERS,
        data: tmp_map_combined,
        weight : weight
    })
    
    return allLabelsAndDatasets
}


function _getDataFromAllRawData(allRawData:Map<string, Map<number, number>>, clientId:string,suffixCollection:string='',element:string, dataType:DATA_TYPE):Map<number,number>{
    let key = getHashKey(null,clientId,suffixCollection + element, dataType)
    if(allRawData.has(key)){
        return (allRawData.get(key) as Map<number,number>)
    }
    return new Map<number,number>()
}
function _getDataAbsoluteSumFromAllRawData(allRawData:Map<string, Map<number, number>>, clientId:string,suffixCollection:string='',element:string):number{
    let keyAbsoluteSum = getHashKey(null, clientId, suffixCollection + element, DATA_TYPE.ABSOLUTE_SUM)
    if(allRawData.has(keyAbsoluteSum)){
        return (allRawData.get(keyAbsoluteSum) as Map<number,number>).get(0) as number
    } 
    return 0
}

function getWeightOfMapCombined(mapCombined:Map<number,number>):number{
    let sum = 0
    let cpt = 0
    mapCombined.forEach(value => {
        sum += value
        cpt++
    })

    if(cpt == 0){return 0}
    
    return sum / cpt
}
/**
 * Se base sur la map des utilisateurs pour parcourir la map des hits ce qui évite les "/ by 0". 
 *  Si existe pour un timestamp donné N utilisateurs pour 0 hits => le timestamp n'est pas renseigné en sortie.
 * @param map_forHits 
 * @param map_forUsers 
 * @returns 
 */
function avgOfMap(map_forHits:Map<number,number>, map_forUsers:Map<number,number>){
    let map = new Map<number,number>()
    map_forUsers.forEach((value, key) => {
        if(value !== 0 && map_forHits.has(key)){
            map.set(key, map_forHits.get(key) as number / value)
        } else {
          // map.set(key, 0)
        }
    })
    return map
}