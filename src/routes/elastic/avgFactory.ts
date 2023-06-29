import type { LabelAndDataset } from "./groupByFactory"


export interface LabelAndDatasetAndMeta{
    label:string,
    map:Map<number,number>
    avg:number
    avg30:Map<number,number>
    avg60:Map<number,number>
    //10% & 90% ?
}

export function runAvg(labelsAndDatasets:LabelAndDataset[]):LabelAndDatasetAndMeta[]{
    let labelsAndDatasetsAndMetas:LabelAndDatasetAndMeta[] = []

    let avg30 = new Map<number,number>()
    let avg60 = new Map<number,number>()
    //Processing Avg30 & Avg60
    if(labelsAndDatasets.length == 1){
        //TODO
    }

    labelsAndDatasets.forEach(labelsAndDatasets => {
        labelsAndDatasetsAndMetas.push({
            label:labelsAndDatasets.label,
            map:labelsAndDatasets.map,
            avg:0,
            avg30:avg30,
            avg60:avg60
        })
    });
    return labelsAndDatasetsAndMetas
}