import type { instance } from "$lib/gitStruct";
import { getConfigValue } from "../HydratationUtils";
import { getWhitelist, type clientIdElastic } from "./elasticStoreFactory";


export class SmellEngine{

    private whitelist:string[] = []
    private knownClientId:string[] = []

    contructor(){}

    initWithGitInstances(instances:instance[], configValueJson:string):SmellEngine{
        this.whitelist = getWhitelist(getConfigValue(configValueJson).mapClientId)
        this.knownClientId = this._getListOfClientId(instances)
        
        //Add whitelist
        this.knownClientId = this.knownClientId.concat(this.whitelist)
        
        return this
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