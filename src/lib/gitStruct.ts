//Representation of the in-memory git data structure	
export interface instance{
    label: string
    show: boolean 
    royaumes:royaume[]
    commit:commit
    log?:string[]
    ts?:number
}
export interface commit{
    hash:string
    ts:number
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