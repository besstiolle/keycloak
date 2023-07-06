//Representation of the JSON data structure	
export interface instance{
    label: string
    show: boolean 
    royaumes:royaume[]
    commit:commit
}
export interface commit{
    hash:string
    ts:number
    log?:string[]
    message:string
    author:string[]
}
export interface royaume { 
    label: string
    show: boolean
    clientIds?:clientId[]
    nodes:string[]
}
            
export interface clientId { 
    protocol: string 
    show: boolean
    label: string
    envs:env[]
}
export interface env { 
    label: string
    show: boolean
    mapper:string
    uris: string[]
}
//Représentation on visual rendering
export interface visualCommit{
    hash:string
    date:string
    message:string
    author:string
    //link:string
}

export interface hashNode{
    md5:string
    clientId:clientId
}

export interface config{
    gitUrl1:string
    gitUrl2:string
    mapClientId:string
}