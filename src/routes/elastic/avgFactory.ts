import type { LabelAndDataset } from "$lib/elasticStruct"



export function runAvg(labelAndDataset:LabelAndDataset):number{
    let avg=0

    let cpt = 0
    let sum = 0
    labelAndDataset.data.forEach((value, key) => {
        sum += value
        cpt++
    });

    return sum / cpt
}