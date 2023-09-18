import type { Config } from "$lib/configStruct";


export class FriendlyName{

    private static mapName = new Map<string, string>()

    private constructor(){}

    static initiate(config:Config){
        FriendlyName.mapName = new Map<string, string>()
        let blob = config.mapClientId?config.mapClientId:""
        let allFriendlyNames = blob.toLocaleLowerCase().split('\n')
        for(let str of allFriendlyNames){
            let pairs = str.split('=')
            if(pairs.length != 2){
                console.warn("key/value  `" + pairs[0] + "` in Mapping clientId is not valid")
                continue
            }

            if(FriendlyName.mapName.has(pairs[0].trim())){
                console.warn("key already `" + pairs[0] + "` existing in Mapping clientId")
                continue
            }

            FriendlyName.mapName.set(pairs[0].trim(), pairs[1].trim())
        }
    }
    
    static getFriendlyName(str:string):string{
        if(FriendlyName.mapName.has(str.toLocaleLowerCase())){
            console.info("was ", str, "is ", FriendlyName.mapName.get(str.toLocaleLowerCase()))
            return FriendlyName.mapName.get(str.toLocaleLowerCase()) as string
        }
        console.info("ww")
        return str
    }
}