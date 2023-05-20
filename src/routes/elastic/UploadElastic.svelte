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
   
            let currentType = CSV_TYPE.REQUESTS
            if(jsonFile.name.indexOf('LOGIN_ERROR') !== -1) {
                currentType = CSV_TYPE.ERRORS
            } else if(jsonFile.name.indexOf('code erreur') !== -1) {
                currentType = CSV_TYPE.ERRORS
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

    function csvToContainer(str:string , type:CSV_TYPE, delimiter:string = ","): void{

        
        let runner:Function
        switch(type){
            //TODO
            //case CSV_TYPE.ERRORS:
//
            //    break
            default:
                runner = runnerKeyCloackHits
                
                break;
        }

        //Fix for files habilitations & strongbox
        let mustAddInstance = type === CSV_TYPE.REQUESTS && !str.startsWith('Instance')
        if(mustAddInstance){
            str = 'Instance,' + str
            //console.info("must add")
        }

        const headersStr = str.slice(0, str.indexOf("\n"))
        const headers:string[] = headersStr.split(delimiter)

        //Update min date & max date
        let tmp_date:string = headers[3] //TODO fix case of CSV ERROR
        if(type === CSV_TYPE.REQUESTS){
            tmp_date = headers[3]
        }
        if(minDate > headerToDate(tmp_date)) {
            minDate = headerToDate(tmp_date)
        }
        if(maxDate < headerToDate(headers[headers.length-1])) {
            maxDate = headerToDate(headers[headers.length-1])
        }


        str.slice(str.indexOf("\r\n") + 1).split("\r\n").forEach(line =>{
            if(line.length > 2){
                //Fix for files habilitations & strongbox
                if(mustAddInstance){
                    line = "keycloak-interne," + line
                }
                //console.info(headers, line)
                runner(headers, line)
            }
        })
    }

    /**
     * Transform csv header to a proper date
     * @param str
     */
    function headerToDate(str:string){
        return new Date(str.substring(1,17))
    }

    function runnerKeyCloackHits(headers:string[], line:string):void{
        let elts:string[] = line.split(',')
        let instance=elts[0].replaceAll("\"","")
        let clientIdLabel=elts[1].replaceAll("\"","")
        let requestType=elts[2].replaceAll("\"","").toUpperCase()

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
                //console.info(clientIdLabel, elts[i], headers[i])
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
    