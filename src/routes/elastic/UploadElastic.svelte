<script lang="ts">
    import { Timeline } from '$lib/Timeline.class';
    import { CSV_TYPE, REQUEST_TYPE, type clientIdElastic, type elasticStore } from '$lib/elasticStruct';
    import { jsonElasticDataStore, timelineStore } from '$lib/store';
    import UploadGeneric from '../UploadGeneric.svelte';
    import { emptyClientIdElastic } from './clientIdElasticFactory';
    import { COMMA, DOUBLE_QUOTE, EMPTY_STRING, LN, RCLN } from './const';
    import { cleanUnformatedNumbers, headerToDate, isLN } from './utils';

    export let initiateBinder:Function
    //Type of file supported separated by a COMMA like .json,.jpeg,....
    const extensionAccepted = '.csv'
	const invite:string = 'Choose a Elastic exported CSV file'

    let minDate:Date = new Date("2099-01-01 00:00")
    let maxDate:Date = new Date("2000-01-01 00:00")
    let container:Map<string, clientIdElastic> = new Map<string, clientIdElastic>()
    let errors:Map<string,number[]> = new Map<string,number[]>()
    let RC:string


	
    function customInitiator(fileName:string, contentFile:string){

        if($jsonElasticDataStore.container.size > 0 || $jsonElasticDataStore.errors.size > 0){
            container = $jsonElasticDataStore.container
            minDate = $jsonElasticDataStore.minDate
            maxDate = $jsonElasticDataStore.maxDate
            errors = $jsonElasticDataStore.errors
        }
            
        let csv = contentFile

        //Detect return chariot type windows or unix
        RC = isLN(csv) ? LN : RCLN

        //Expurge string like "12,012" to real number like 12012
        csv = cleanUnformatedNumbers(csv)

        let currentType = CSV_TYPE.REQUESTS
        if(fileName.indexOf('LOGIN_ERROR') !== -1) {
            currentType = CSV_TYPE.ERRORS
        } else if(fileName.indexOf('code erreur') !== -1) {
            currentType = CSV_TYPE.ERRORS
        } 
        
        csvToContainer(csv, currentType)
        //Refresh timeline in Store
        $timelineStore =  new Timeline(minDate, maxDate)

        let elasticStoreCloned:elasticStore = {
            minDate: minDate,
            maxDate: maxDate,
            container: container,
            errors: errors
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
        if(type === CSV_TYPE.REQUESTS){
            tmp_date = headers[3]
            runner = runnerKeyCloackHits
        } else if(type === CSV_TYPE.ERRORS){
            tmp_date = headers[1]
            runner = runnerErrorsHits
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

    function runnerErrorsHits(headers:string[], line:string):void{
        let elts:string[] = line.split(COMMA)
        let errorType=elts[0].replaceAll(DOUBLE_QUOTE,EMPTY_STRING).trim()
        let arr:number[] = []

        if(!errors.has(errorType)){
            errors.set(errorType, arr)
        } 

        for(let i=1; i<elts.length; i++){
            if(elts[i].trim() === EMPTY_STRING){
                continue
            }
            arr = errors.get(errorType) as  number[]
            
            //errors.set(errorType, writeDataInMatrix(arr, headerToDate(headers[i]), parseInt(elts[i])))
            arr[$timelineStore.getIndexByDate(headerToDate(headers[i]))] = parseInt(elts[i])
            errors.set(errorType, arr)
        }

    }

    function runnerKeyCloackHits(headers:string[], line:string):void{
        let elts:string[] = line.split(COMMA)
        let instance=elts[0].replaceAll(DOUBLE_QUOTE,EMPTY_STRING).trim()
        let clientIdLabel=elts[1].replaceAll(DOUBLE_QUOTE,EMPTY_STRING).trim()
        let requestType=elts[2].replaceAll(DOUBLE_QUOTE,EMPTY_STRING).trim().toUpperCase()

        //Strict control to avoid unwanted data inside our container
        if(!(requestType in REQUEST_TYPE)){
            console.error("requestType is unknown", requestType)
            throw Error("requestType is unknown")
        }

        let clientId:clientIdElastic = emptyClientIdElastic(clientIdLabel, instance)

        if(container.has(clientIdLabel)){
            clientId = container.get(clientIdLabel) as clientIdElastic
            clientId.instance = instance //Update for security
        } 

        for(let i=3; i<elts.length; i++){
            if(elts[i].trim() === EMPTY_STRING){
                continue
            }

            //clientId[requestType] = writeDataInMatrix(clientId[requestType], headerToDate(headers[i]), parseInt(elts[i]))           
            clientId[requestType][$timelineStore.getIndexByDate(headerToDate(headers[i]))] = parseInt(elts[i])
        }

        container.set(clientIdLabel, clientId)
    }
</script>

<UploadGeneric initiateBinder={customInitiator} invite={invite} type={extensionAccepted} />