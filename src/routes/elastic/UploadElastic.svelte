<script lang="ts">
    import { CSV_TYPE, type clientIdElastic, type elasticStore } from '$lib/elasticStruct';
    import { jsonElasticDataStore } from '$lib/store';
    import { emptyClientIdElastic } from './clientIdElasticFactory';
    import { writeDataInMatrix } from './matrixUtils';

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

        str.slice(str.indexOf("\r\n") + 1).split("\r\n").forEach(line =>{
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

        for(let i=1; i<elts.length; i++){
            if(elts[i] === ''){
                continue
            }

            if(type === CSV_TYPE.STRONGBOX){
                clientId._s = writeDataInMatrix(clientId._s, headerToDate(headers[i]), parseInt(elts[i]))
            } else {
                clientId._h = writeDataInMatrix(clientId._h, headerToDate(headers[i]), parseInt(elts[i]))
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

        for(let i=3; i<elts.length; i++){
            if(elts[i] === ""){
                continue
            }

            if(elts[i].trim() !== ''){
                clientId[requestType] = writeDataInMatrix(clientId[requestType], headerToDate(headers[i]), parseInt(elts[i]))
            }           
            
        }

        container.set(clientIdLabel, clientId)
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
    