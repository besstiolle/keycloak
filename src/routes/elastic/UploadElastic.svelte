<script lang="ts">
    import { CSV_TYPE, REQUEST_TYPE, type clientIdElastic, type elasticStore, type pointer } from '$lib/elasticStruct';
    import { jsonElasticDataStore } from '$lib/store';

    export let initiateBinder:Function

	let fileinput:HTMLInputElement
    let minDate:Date = new Date("2099-01-01 00:00")
    let maxDate:Date = new Date("2000-01-01 00:00")
    let container:Map<string, clientIdElastic> = new Map<string, clientIdElastic>()


	const invite:string = 'Choose a Elastic exported CSV file'
	
	const onFileSelected = (e:any)=>{

        if($jsonElasticDataStore.container.size > 0){
            container = $jsonElasticDataStore.container
            minDate = $jsonElasticDataStore.minDate
            maxDate = $jsonElasticDataStore.maxDate
        }


		let jsonFile = e.target.files[0];
		let reader = new FileReader();
		reader.readAsText(jsonFile);
		reader.onload = e => {
            
            let csv = e.target?.result as string

            //Expurge string like "12,012" to real number like 12012
            csv = cleanUnformatedNumbers(csv)
   
            let currentType = CSV_TYPE.KEYCLOAK
            if(jsonFile.name.indexOf('_api_strongbox') !== -1) {
                currentType = CSV_TYPE.STRONGBOX
            } else if(jsonFile.name.indexOf('_api_habilitation') !== -1) {
                currentType = CSV_TYPE.HABILITATION
            } 
            
            csvToContainer(csv, currentType)
   
            let elasticStoreCloned:elasticStore = {
                minDate: minDate,
                maxDate: maxDate,
                container: container
            }

            $jsonElasticDataStore = elasticStoreCloned

            initiateBinder()
		};
	}

    /**
     * catch & Transform "1,234,567,890" to 1,234,567,890 to a real number 1234567890 but in a string type
     * @param the unformated number with double quote
     * @return string : the number without commas, double quote 
    */
    function cleanUnformatedNumbers(str:string):string{
        const regex = /\"((\d)+\,(\d)+)+\"/gm; //Catching "1,234" or even "1,234,567,890"

        return str.replace(regex, (oc:string) =>{
            return oc.slice(1, oc.length-1).replace(",","") //Transform "1,234,567,890" to 1,234,567,890 to 1234567890 (string)
        })

    }

    /**
     * Transform csv header to a proper date
     * @param str
     */
    function headerToDate(str:string){
        return new Date(str.substring(1,17))
    }

    function csvToContainer(str:string , type:CSV_TYPE, delimiter:string = ","): void{

        const headersStr = str.slice(0, str.indexOf("\n"))
        const headers:string[] = headersStr.split(delimiter)
        
        let runner:Function
        let tmp_date:string
        switch(type){
            case CSV_TYPE.HABILITATION:
                runner = runnerHabilitationHits
                tmp_date = headers[1]
                break
            case CSV_TYPE.STRONGBOX:
                runner = runnerStrongboxHits
                tmp_date = headers[1]
                break;
            default:
                runner = runnerKeyCloackHits
                tmp_date = headers[3]
                break;
        }

        //Update min date & max date
        if(minDate > headerToDate(tmp_date)) {
            minDate = headerToDate(tmp_date)
        }
        if(maxDate < headerToDate(headers[headers.length-1])) {
            maxDate = headerToDate(headers[headers.length-1])
        }

        str.slice(str.indexOf("\n") + 1).split("\n").forEach(line =>{
            if(line.length > 2){
                runner(headers, line)
            }
        })
    }

    function runnerHabilitationHits(headers:string[], line:string):void{
        runnerStrongboxHits(headers, line, CSV_TYPE.HABILITATION)
    }

    function runnerStrongboxHits(headers:string[], line:string, type:CSV_TYPE=CSV_TYPE.STRONGBOX):void{
        let elts:string[] = line.split(',')
        let clientIdLabel=elts[0].replaceAll("\"","")

        let clientId:clientIdElastic = emptyClientIdElastic(clientIdLabel)

        if(container.has(clientIdLabel)){
            clientId = container.get(clientIdLabel) as clientIdElastic
        } 

        let pointer:pointer
        for(let i=1; i<elts.length; i++){
            if(elts[i] === ""){
                continue
            }

            pointer = headerToPointer(headers[i])
            if(type === CSV_TYPE.STRONGBOX){
                clientId._s = _set(clientId._s, pointer, elts[i])
            } else {
                clientId._h = _set(clientId._h, pointer, elts[i])
            }
            
        }

        container.set(clientIdLabel, clientId)
    }

    function runnerKeyCloackHits(headers:string[], line:string):void{
        let elts:string[] = line.split(',')
        let instance=elts[0].replaceAll("\"","")
        let clientIdLabel=elts[1].replaceAll("\"","")
        let requestType=elts[2].replaceAll("\"","")

        //TODO implements more controls
       // if(Object.values(REQUEST_TYPE).indexOf(requestType) == -1){
       //     throw requestType + " is an unknown request type. Please update interface clientIdElastic in elasticStruct.ts"
       // }

        let clientId:clientIdElastic = emptyClientIdElastic(clientIdLabel, instance)

        if(container.has(clientIdLabel)){
            clientId = container.get(clientIdLabel) as clientIdElastic
            clientId.instance = instance //Update for security
        } 

        let pointer:pointer
        for(let i=3; i<elts.length; i++){
            if(elts[i] === ""){
                continue
            }

            pointer = headerToPointer(headers[i]);
            //TODO find a way to be more agnostic
            //(clientId[requestType] as number[][][][]) = []
            //clientId[requestType] = _set(clientId[requestType], pointer, elts[i])    

            switch(requestType){
                case REQUEST_TYPE.USER_INFO_REQUEST :
                    clientId.USER_INFO_REQUEST = _set(clientId.USER_INFO_REQUEST, pointer, elts[i])    
                    break
                case REQUEST_TYPE.LOGIN_ERROR :
                    clientId.LOGIN_ERROR = _set(clientId.LOGIN_ERROR, pointer, elts[i])    
                    break
                case REQUEST_TYPE.CODE_TO_TOKEN :
                    clientId[requestType] = _set(clientId[requestType], pointer, elts[i])    
                    break
                case REQUEST_TYPE.LOGIN :
                    clientId.LOGIN = _set(clientId.LOGIN, pointer, elts[i])    
                    break
                case REQUEST_TYPE.REFRESH_TOKEN :
                    clientId.REFRESH_TOKEN = _set(clientId.REFRESH_TOKEN, pointer, elts[i])    
                    break
                case REQUEST_TYPE.CLIENT_LOGIN :
                    clientId.CLIENT_LOGIN = _set(clientId.CLIENT_LOGIN, pointer, elts[i])    
                    break
                case REQUEST_TYPE.RESET_PASSWORD_ERROR :
                    clientId.RESET_PASSWORD_ERROR = _set(clientId.RESET_PASSWORD_ERROR, pointer, elts[i])    
                    break
                case REQUEST_TYPE.TOKEN_EXCHANGE :
                    clientId.TOKEN_EXCHANGE = _set(clientId.TOKEN_EXCHANGE, pointer, elts[i])    
                    break
                case REQUEST_TYPE.UPDATE_PROFILE :
                    clientId.UPDATE_PROFILE = _set(clientId.UPDATE_PROFILE, pointer, elts[i])    
                    break
                case REQUEST_TYPE.REFRESH_TOKEN_ERROR :
                    clientId.REFRESH_TOKEN_ERROR = _set(clientId.REFRESH_TOKEN_ERROR, pointer, elts[i])    
                    break
                case REQUEST_TYPE.CUSTOM_REQUIRED_ACTION_ERROR :
                    clientId.CUSTOM_REQUIRED_ACTION_ERROR = _set(clientId.CUSTOM_REQUIRED_ACTION_ERROR, pointer, elts[i])    
                    break
                case REQUEST_TYPE.CODE_TO_TOKEN_ERROR :
                    clientId.CODE_TO_TOKEN_ERROR = _set(clientId.CODE_TO_TOKEN_ERROR, pointer, elts[i])    
                    break
                case REQUEST_TYPE.SEND_RESET_PASSWORD_ERROR :
                    clientId.SEND_RESET_PASSWORD_ERROR = _set(clientId.SEND_RESET_PASSWORD_ERROR, pointer, elts[i])    
                    break
                case REQUEST_TYPE.SEND_VERIFY_EMAIL_ERROR :
                    clientId.SEND_VERIFY_EMAIL_ERROR = _set(clientId.SEND_VERIFY_EMAIL_ERROR, pointer, elts[i])    
                    break
                case REQUEST_TYPE.UPDATE_PASSWORD :
                    clientId.UPDATE_PASSWORD = _set(clientId.UPDATE_PASSWORD, pointer, elts[i])    
                    break
                case REQUEST_TYPE.LOGOUT :
                    clientId.LOGOUT = _set(clientId.LOGOUT, pointer, elts[i])    
                    break
                case REQUEST_TYPE.CUSTOM_REQUIRED_ACTION :
                    clientId.CUSTOM_REQUIRED_ACTION = _set(clientId.CUSTOM_REQUIRED_ACTION, pointer, elts[i])    
                    break
            }
            
        }

        container.set(clientIdLabel, clientId)
    }

    function headerToPointer(header:string):pointer{
        return {
            y:parseInt(header.substring(1,5)),
            m:parseInt(header.substring(6,8)),
            d:parseInt(header.substring(9,11)),
            h:parseInt(header.substring(12,14))/3,
        }
    }

    function _set(s:number[][][][], pointer:pointer, elt:string){

        if(elt.trim() === ''){
            return s
        }

        if(s[pointer.y] === undefined){
            s[pointer.y] = []
        }
        if(s[pointer.y][pointer.m] === undefined){
            s[pointer.y][pointer.m] = []
        }
        if(s[pointer.y][pointer.m][pointer.d] === undefined){
            s[pointer.y][pointer.m][pointer.d] = []
        }
        s[pointer.y][pointer.m][pointer.d][pointer.h] = parseInt(elt)
        return s
    }

    function emptyClientIdElastic(label:string, instance:string = "unknown"):clientIdElastic{
        return {
            clientId:label,
            instance:instance,
            _h:[],
            _s:[],
            USER_INFO_REQUEST:[],
            LOGIN_ERROR:[],
            CODE_TO_TOKEN:[],
            LOGIN:[],
            REFRESH_TOKEN:[],
            CLIENT_LOGIN:[],
            RESET_PASSWORD_ERROR:[],
            TOKEN_EXCHANGE:[],
            UPDATE_PROFILE:[],
            REFRESH_TOKEN_ERROR:[],
            CUSTOM_REQUIRED_ACTION_ERROR:[],
            CODE_TO_TOKEN_ERROR:[],
            SEND_RESET_PASSWORD_ERROR:[],
            SEND_VERIFY_EMAIL_ERROR:[],
            UPDATE_PASSWORD:[],
            LOGOUT:[],
            CUSTOM_REQUIRED_ACTION:[]
        }
    }

</script>


<div id="box" on:click={()=>{fileinput.click();}} on:keydown={()=>{fileinput.click();}}>
    <div><img src='./download.png' alt={invite} title={invite}/></div>
    <div>
        <input type="file" name="files[]" accept=".csv" id="file" on:change={(e)=>onFileSelected(e)}  bind:this={fileinput} />
        <label for="file">{invite}</label>
    </div>
    <button type="submit">Upload</button>
</div>

<style>
    #box{
      min-height: 100%;
      font-size: 1.5rem;
      background-color: #c8dadf;
      position: relative;
      text-align:center;
      cursor: pointer;
      padding: 5%;
    }

    #box input,
    #box button{
        display: none;
    }
</style>
    