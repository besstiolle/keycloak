
export interface elasticStore{
    minDate:Date,
    maxDate:Date,
    containerClientId:Map<string, clientIdElastic>,
    containerErrorsByClientId:Map<string, clientIdError>,
    containerErrorsSoc:Map<string, number[]>
}


export interface clientIdError extends Record<string, any>{
    clientId:string
    instance:string
}

export interface clientIdElastic extends Record<string,any>{
    clientId:string
    instance:string
}




export function getEmptyElasticStore():elasticStore {
    return {
        minDate:new Date("2099-01-01"),
        maxDate:new Date("2000-01-01"),
        containerClientId:new Map<string, clientIdElastic>(),
        containerErrorsByClientId:new Map<string, clientIdError>(),
        containerErrorsSoc:new Map<string, number[]>()
    }
}

export function emptyClientIdElastic(label:string, instance:string = "unknown"):clientIdElastic{
    return {
        clientId:label,
        instance:instance
    }
}
export function emptyClientIdError(label:string, instance:string = "unknown"):clientIdError{
    return {
        clientId:label,
        instance:instance
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