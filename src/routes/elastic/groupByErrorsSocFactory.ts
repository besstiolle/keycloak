import { DATA_TYPE, type LabelAndDataset } from "$lib/elasticStruct"
import { VERTICAL_TWO_DOT } from "./const"
import { fusionMap, getHashKey } from "./datasetFactory"


export class GroupByErrorsSocEngine{

    isGroupClientId:boolean = true
    selectedClientsId:string[] = []
    dataTypeSelected:DATA_TYPE = DATA_TYPE.SUM_BY_DAY

    constructor(isGroupClientId:boolean, selectedClientsId:string[], dataTypeSelected:DATA_TYPE){
        this.isGroupClientId = isGroupClientId
        this.selectedClientsId = selectedClientsId
        this.dataTypeSelected = dataTypeSelected
    }
}

const MAX_VALUES = 10
export function runGroupByErrorsSocEngine(engine:GroupByErrorsSocEngine, globalMap:Map<string, Map<number, number>>):LabelAndDataset[]{

    /*
     * Can be : 
     *   0 : distinct errorsSoc
     *   1 : group all errorsSoc
    */
    let dumb = (engine.isGroupClientId?1:0) 
    let values:LabelAndDataset[] = []

    switch (dumb){
        case 0: values = _run0(engine, globalMap);break 
        case 1: values = _run1(engine, globalMap);break
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
 *   0 : distinct errorsSoc
 * @param engine 
 * @param globalMap 
 * @returns 
 */
function _run0(engine:GroupByErrorsSocEngine, globalMap:Map<string, Map<number, number>>):LabelAndDataset[]{
    let allLabelsAndDatasets:LabelAndDataset[] = []
    for(let element of engine.selectedClientsId){  
        allLabelsAndDatasets.push({
            label: element,
            data: globalMap.get(getHashKey(null,null ,element,engine.dataTypeSelected)) as Map<number,number>,
            weight : (globalMap.get(getHashKey(null,null,element,DATA_TYPE.ABSOLUTE_SUM)) as Map<number,number>).get(0) as number
        })   
    }
    
    return allLabelsAndDatasets
}

/**
 *   2 : group errorsSoc
 * @param engine 
 * @param globalMap 
 * @returns 
 */
function _run1(engine:GroupByErrorsSocEngine, globalMap:Map<string, Map<number, number>>):LabelAndDataset[]{
    let allLabelsAndDatasets:LabelAndDataset[] = []
    let tmp_maps:Map<number,number>[] = []
    let weight = 0
    for(let element of engine.selectedClientsId){
        tmp_maps.push(globalMap.get(getHashKey(null,null,element,engine.dataTypeSelected)) as Map<number,number>)
        weight += (globalMap.get(getHashKey(null,null,element,DATA_TYPE.ABSOLUTE_SUM)) as Map<number,number>).get(0) as number
    }
    allLabelsAndDatasets.push({
        label: "all informations selected",
        data: fusionMap(tmp_maps),
        weight : weight
    })
    
    
    return allLabelsAndDatasets
}
