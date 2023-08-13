import type { LabelAndDataset } from "$lib/elasticStruct"



export function runAvg(labelAndDataset:LabelAndDataset):number{
    let cpt = 0
    let sum = 0
    labelAndDataset.data.forEach((value, key) => {
        sum += value
        cpt++
    });

    return sum / cpt
}