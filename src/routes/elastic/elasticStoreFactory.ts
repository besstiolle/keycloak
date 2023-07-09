import type { clientIdElastic, elasticStore } from "$lib/elasticStruct";

export function getEmptyElasticStore():elasticStore {
    return {
        minDate:new Date("2099-01-01"),
        maxDate:new Date("2000-01-01"),
        container:new Map<string, clientIdElastic>(),
        errors:new Map<string, number[]>()
    }
}


export function getWhitelist(map:string):string[]{
    if(map == undefined || map.trim() === ''){
        return []
    }
    let lines = map.split('\n')
    let vals:string[]
    let keys:string[] = []
    lines.forEach(line => {
        vals = line.split('=')
        keys.push(vals[0].toLocaleLowerCase())
    });
    //console.info(keys)
    return keys
}