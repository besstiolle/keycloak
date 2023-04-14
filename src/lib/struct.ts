//Representation of the JSON data structure	
export let commit:{
    hash:string
    ts:number
    log?:string[]
    instances:typeof instance[]
    message:string
    author:string[]
}
export let instance:{
    label: string
    show: boolean 
    royaumes:typeof royaume[]
}
export let royaume: { 
    label: string
    show: boolean
    clientIds?:typeof clientId[]
    nodes:string[]
}
            
export let clientId: { 
    protocol: string 
    show: boolean
    label: string
    envs:typeof env[]
}
export let env: { 
    label: string
    show: boolean
    uris: string[]
}
//Représentation on visual rendering
export let visualCommit:{
    hash:string
    date:string
    message:string
    author:string
    //link:string
}|undefined

export let hashNode:{
    md5:string
    clientId:typeof clientId
}