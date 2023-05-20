import { COMMA, EMPTY_STRING, RCLN } from "./const";


const REGEX_BAD_NUMBER = /\"((\d)+\,(\d)+)+\"/gm; //Catching "1,234" or even "1,234,567,890"
/**
 * catch & Transform "1,234,567,890" to 1,234,567,890 to a real number 1234567890 but in a string type
 * @param the unformated number with double quote
 * @return string : the number without commas, double quote 
*/
export function cleanUnformatedNumbers(str:string):string{
    return str.replace(REGEX_BAD_NUMBER, (oc:string) =>{
        return oc.slice(1, oc.length-1).replace(COMMA, EMPTY_STRING) //Transform "1,234,567,890" to 1,234,567,890 to 1234567890 (string)
    })

}

/**
 * return true if it's an "unix" format \n, else it will return false (\r\n)
 * @param csvContent the content of the CSV
 */
export function isLN(csvContent:string){
    return csvContent.indexOf(RCLN) === -1
}



/**
 * Transform csv header "2023-04-15 00:00 › Count of records" to a proper JS date 
 * @param  : the csv header
 * @return the JS date 
 */
export function headerToDate(str:string):Date{
    return new Date(str.substring(1,17))
}