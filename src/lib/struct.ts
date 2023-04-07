//Representation of the JSON data structure	
export let commit:{
    hash:string
    ts:number
    instances:typeof instance[]
}
export let instance:{
    label: string
    show: boolean 
    royaumes:typeof royaume[]
}
let royaume: { 
    label: string
    show: boolean
    clientIds:typeof clientId[]
}
            
let clientId: { 
    protocol: string 
    show: boolean
    label: string
    envs:typeof env[]
}
let env: { 
    label: string
    show: boolean
    uris: string[]
}
//Représentation on visual rendering
export let visualCommit:{
    hash:string
    date:string
    //message:string
    //author:string
    //link:string
}|undefined