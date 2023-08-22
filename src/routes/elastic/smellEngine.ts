import type { Config } from "$lib/configStruct";
import type { instance } from "$lib/gitStruct";
import type { clientIdElastic } from "./elasticStoreFactory";


export class SmellEngine{

    private knownClientId:string[] = []

    constructor(instances:instance[], config:Config){
        let allClientIdFromGit = this._getListOfClientId(instances)
        let allClientIdwhitelisted = config.whitelist.split('\n')
        
        //Add whitelist
        this.knownClientId = allClientIdFromGit.concat(allClientIdwhitelisted)
    }

    //TODO : lowercase vs gaareq & Gaareq ?
    isSmellByClientIdElastic(clientId:clientIdElastic):boolean{
        return !this.knownClientId.includes(clientId.clientId.toLocaleLowerCase())
    }

    isSmellByLabel(clientIdLabel:string):boolean{
        return !this.knownClientId.includes(clientIdLabel.toLocaleLowerCase())
    } 

    private _getListOfClientId(instances:instance[]):string[]{
        let list:string[]=[]
        instances.forEach(instance => {
            instance.royaumes.forEach(r => {
                r.clientIds?.forEach(c => {
                    list.push(c.label.toLocaleLowerCase())
                });
            });
        });
    
        return list
    }
}