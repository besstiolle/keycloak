import { fusionMap, getHashKey, type LabelAndDataset } from "./datasetFactory"
import { DATA_TYPE } from "./sideStateFactory"


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
export function runGroupByErrorsSocEngine(engine:GroupByErrorsSocEngine, allRawData:Map<string, Map<number, number>>):LabelAndDataset[]{

    /*
     * Can be : 
    *   0 : group all errorsSoc
    *   1 : distinct errorsSoc
    */
    let dumb = (engine.isGroupClientId?1:0)
    let values:LabelAndDataset[] = []

    switch (dumb){
        case 0: values = _run0(engine, allRawData);break 
        case 1: values = _run1(engine, allRawData);break
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
 * @param allRawData 
 * @returns 
 */
function _run0(engine:GroupByErrorsSocEngine, allRawData:Map<string, Map<number, number>>):LabelAndDataset[]{
    let allLabelsAndDatasets:LabelAndDataset[] = []
    for(let element of engine.selectedClientsId){  
        allLabelsAndDatasets.push({
            label: element,
            data: _getDataFromAllRawData(allRawData, element, engine.dataTypeSelected),
            weight : _getDataAbsoluteSumFromAllRawData(allRawData, element)
        })   
    }
    
    return allLabelsAndDatasets
}

/**
 *   1 : group errorsSoc
 * @param engine 
 * @param allRawData 
 * @returns 
 */
function _run1(engine:GroupByErrorsSocEngine, allRawData:Map<string, Map<number, number>>):LabelAndDataset[]{
    let allLabelsAndDatasets:LabelAndDataset[] = []
    let tmp_maps:Map<number,number>[] = []
    let weight = 0
    for(let element of engine.selectedClientsId){
        tmp_maps.push(_getDataFromAllRawData(allRawData, element, engine.dataTypeSelected))
        weight += _getDataAbsoluteSumFromAllRawData(allRawData, element)
    }
    allLabelsAndDatasets.push({
        label: "all informations selected",
        data: fusionMap(tmp_maps),
        weight : weight
    })
    
    
    return allLabelsAndDatasets
}


function _getDataFromAllRawData(allRawData:Map<string, Map<number, number>>, element:string, dataType:DATA_TYPE):Map<number,number>{
    let key = getHashKey(null,null, element, dataType)
    if(allRawData.has(key)){
        return (allRawData.get(key) as Map<number,number>)
    }
    return new Map<number,number>()
}
function _getDataAbsoluteSumFromAllRawData(allRawData:Map<string, Map<number, number>>, element:string):number{
    let keyAbsoluteSum = getHashKey(null, null, element, DATA_TYPE.ABSOLUTE_SUM)
    if(allRawData.has(keyAbsoluteSum)){
        return (allRawData.get(keyAbsoluteSum) as Map<number,number>).get(0) as number
    } 
    return 0
}