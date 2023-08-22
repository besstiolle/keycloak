export class MasterExport {
    version:number=2
    gitData:string=''
    configData:string=''
    elasticData:string=''

    constructor(gitData:string='',configData:string='',elasticData:string=''){
        this.gitData = gitData
        this.configData = configData
        this.elasticData = elasticData
    }
}

export class Config{
    gitUrl_interne:string=''
    gitUrl_admin:string=''
    gitUrl_societaire:string=''
    mapClientId:string=''
    whitelist:string=''

    constructor(){
        
    }
}