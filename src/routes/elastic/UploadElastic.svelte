<script lang="ts">
    import { Timeline } from '$lib/Timeline.class';
    import { CSV_TYPE, ERROR_BY_CLIENTID_TYPE, ERROR_BY_CLIENTID_TYPE_HUMAN_READABLE_MAP, REQUEST_TYPE, type clientIdElastic, type clientIdError, type elasticStore } from '$lib/elasticStruct';
    import { jsonElasticDataStore, timelineStore } from '$lib/store';
    import UploadGeneric from '../UploadGeneric.svelte';
    import { emptyClientIdElastic } from './clientIdElasticFactory';
    import { emptyClientIdError } from './clientIdErrorFactory';
    import { COMMA, DOUBLE_QUOTE, EMPTY_STRING, LN, RCLN } from './const';
    import { cleanUnformatedNumbers, headerToDate, isLN } from './utils';

    export let initiateBinder:Function
    //Type of file supported separated by a COMMA like .json,.jpeg,....
    const extensionAccepted = '.csv'
	const invite:string = 'Choose a Elastic exported CSV file'

    let minDate:Date = new Date("2099-01-01 00:00")
    let maxDate:Date = new Date("2000-01-01 00:00")
    let containerClientId:Map<string, clientIdElastic> = new Map<string, clientIdElastic>()
    let containerErrorByClientID:Map<string, clientIdError> = new Map<string, clientIdError>()
    let containerErrorsSoc:Map<string,number[]> = new Map<string,number[]>()
    let RC:string


	
    function customInitiator(fileName:string, contentFile:string){

        if($jsonElasticDataStore.containerClientId.size > 0 || $jsonElasticDataStore.containerErrorsSoc.size > 0){
            containerClientId = $jsonElasticDataStore.containerClientId
            containerErrorByClientID = $jsonElasticDataStore.containerErrorsByClientId
            containerErrorsSoc = $jsonElasticDataStore.containerErrorsSoc
            minDate = $jsonElasticDataStore.minDate
            maxDate = $jsonElasticDataStore.maxDate
        }
            
        let csv = contentFile

        //Detect return chariot type windows or unix
        RC = isLN(csv) ? LN : RCLN

        //Expurge string like "12,012" to real number like 12012
        csv = cleanUnformatedNumbers(csv)

        let currentType = CSV_TYPE.REQUESTS
        if(fileName.indexOf('LOGIN_ERROR') !== -1) { 
            currentType = CSV_TYPE.ERRORS_BY_CLIENTID
        } else if(fileName.indexOf('code erreur') !== -1) {
            currentType = CSV_TYPE.ERRORS_SOC
        } else if(fileName.indexOf("Nombre d'utilisateur") !== -1) {
            currentType = CSV_TYPE.USERS
        }
        
        csvToContainer(csv, currentType)
        //Refresh timeline in Store
        $timelineStore =  new Timeline(minDate, maxDate)

        let elasticStoreCloned:elasticStore = {
            minDate: minDate,
            maxDate: maxDate,
            containerClientId: containerClientId,
            containerErrorsByClientId: containerErrorByClientID,
            containerErrorsSoc: containerErrorsSoc
        }

        $jsonElasticDataStore = elasticStoreCloned

        initiateBinder()

	}

    function csvToContainer(csvContent:string , type:CSV_TYPE, delimiter:string = COMMA): void{

        //Fix for files habilitations & strongbox
        let mustAddInstance = type === CSV_TYPE.REQUESTS && !csvContent.startsWith('Instance')
        if(mustAddInstance){
            csvContent = 'Instance,' + csvContent
        }

        const headersStr = csvContent.slice(0, csvContent.indexOf(RC))
        const headers:string[] = headersStr.split(delimiter)

        //Update min date & max date
        let tmp_date:string
        let runner:Function
        if(type == CSV_TYPE.REQUESTS){
            tmp_date = headers[3]
            runner = runnerKeyCloackHits
        } else if(type === CSV_TYPE.ERRORS_BY_CLIENTID){
            tmp_date = headers[3]
            runner = runnerErrorsByClientIdHits
        } else if(type === CSV_TYPE.ERRORS_SOC){
            tmp_date = headers[1]
            runner = runnerErrorsSocHits
        } else if(type === CSV_TYPE.USERS){
            /*tmp_date = headers[1]
            runner = runnerErrorsHits*/
            //TODO
            return
        } else {
            throw new Error('case not implemented for type', type);
        }

        //Updating current min/max date of the processus
        if(minDate > headerToDate(tmp_date)) {
            minDate = headerToDate(tmp_date)
        }
        if(maxDate < headerToDate(headers[headers.length-1])) {
            maxDate = headerToDate(headers[headers.length-1])
        }


        csvContent.slice(csvContent.indexOf(RC) + 1).split(RC).forEach(line =>{
            if(line.length > 2){
                //Mandatory fix for files habilitations & strongbox
                if(mustAddInstance){
                    line = "keycloak-interne," + line
                }
                runner(headers, line)
            }
        })
    }

    function runnerErrorsSocHits(headers:string[], line:string):void{
        let elts:string[] = line.split(COMMA)
        let errorType=elts[0].replaceAll(DOUBLE_QUOTE,EMPTY_STRING).trim()
        let arr:number[] = []

        if(!containerErrorsSoc.has(errorType)){
            containerErrorsSoc.set(errorType, arr)
        } 

        for(let i=1; i<elts.length; i++){
            if(elts[i].trim() === EMPTY_STRING){
                continue
            }
            arr = containerErrorsSoc.get(errorType) as  number[]
            
            arr[$timelineStore.getIndexByDate(headerToDate(headers[i]))] = parseInt(elts[i])
            containerErrorsSoc.set(errorType, arr)
        }
    }

    function runnerErrorsByClientIdHits(headers:string[], line:string):void{
        let elts:string[] = line.split(COMMA)
        let instance=elts[0].replaceAll(DOUBLE_QUOTE,EMPTY_STRING).trim()
        let clientIdLabel=elts[1].replaceAll(DOUBLE_QUOTE,EMPTY_STRING).trim()
        let errorTypeLabel=elts[2].replaceAll(DOUBLE_QUOTE,EMPTY_STRING).trim().toUpperCase()
        let errorType:ERROR_BY_CLIENTID_TYPE

        //Strict control to avoid unwanted data inside our container
        if(!ERROR_BY_CLIENTID_TYPE_HUMAN_READABLE_MAP.has(errorTypeLabel)) {
            console.error("errorTypeLabel is unknown and will be ignore", errorTypeLabel)
            return 
        }

        errorType = ERROR_BY_CLIENTID_TYPE_HUMAN_READABLE_MAP.get(errorTypeLabel) as ERROR_BY_CLIENTID_TYPE

        let clientId:clientIdError = emptyClientIdError(clientIdLabel, instance)

        if(containerErrorByClientID.has(clientIdLabel)){
            clientId = containerErrorByClientID.get(clientIdLabel) as clientIdError
            clientId.instance = instance //Update for security
        } 

        for(let i=3; i<elts.length; i++){
            //Fixme :  le parseInt(elts[i]) == 0 ne semble pas fonctionner ?
            if(elts[i].trim() === EMPTY_STRING || parseInt(elts[i]) == 0){
                continue
            }
        
            clientId[errorType][$timelineStore.getIndexByDate(headerToDate(headers[i]))] = parseInt(elts[i])
        }

        containerErrorByClientID.set(clientIdLabel, clientId)
    }

    function runnerKeyCloackHits(headers:string[], line:string):void{
        let elts:string[] = line.split(COMMA)
        let instance=elts[0].replaceAll(DOUBLE_QUOTE,EMPTY_STRING).trim()
        let clientIdLabel=elts[1].replaceAll(DOUBLE_QUOTE,EMPTY_STRING).trim()
        let requestType=elts[2].replaceAll(DOUBLE_QUOTE,EMPTY_STRING).trim().toUpperCase()

        //Strict control to avoid unwanted data inside our container
        if(!(requestType in REQUEST_TYPE)){
            console.error("requestType is unknown and will be ignore", requestType)
            return 
        }

        let clientId:clientIdElastic = emptyClientIdElastic(clientIdLabel, instance)

        if(containerClientId.has(clientIdLabel)){
            clientId = containerClientId.get(clientIdLabel) as clientIdElastic
            clientId.instance = instance //Update for security
        } 

        for(let i=3; i<elts.length; i++){
            if(elts[i].trim() === EMPTY_STRING){
                continue
            }
        
            clientId[requestType][$timelineStore.getIndexByDate(headerToDate(headers[i]))] = parseInt(elts[i])
        }

        containerClientId.set(clientIdLabel, clientId)
    }
</script>

<UploadGeneric initiateBinder={customInitiator} invite={invite} type={extensionAccepted} />