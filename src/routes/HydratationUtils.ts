import { Config } from "$lib/configStruct"

export function parseLog(log:string[]){

    let rawAuthors = ['','']
    let rawMessage =''
    let rawHash =''

    for(let i =0; i< log.length;i++){
        if(log[i].startsWith("Author")){
            rawAuthors = log[i].split("<")
        }
        if(log[i].startsWith("    ")){
            rawMessage = log[i].trim()
        }
        if(log[i].startsWith("commit")){
            rawHash = log[i].substring(6).trim()
        }
    }

    rawAuthors[0] = rawAuthors[0].substring(7).trim()
    rawAuthors[1] = rawAuthors[1].trim()
    rawAuthors[1] = rawAuthors[1].substring(0,rawAuthors[1].length-1).trim()

    return {author:rawAuthors, message:rawMessage, hash:rawHash}
}