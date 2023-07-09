import type { pointer } from "$lib/elasticStruct"


function writeDataInMatrix(matrix: number[][][][], date: Date, value:number): number[][][][]{
    let pointer = dateToPointer(date)
    if( matrix == undefined) {
        matrix = []
    }
    if(matrix[pointer.y] === undefined) {
        matrix[pointer.y] = []
    }
    if(matrix[pointer.y][pointer.m] === undefined) {
        matrix[pointer.y][pointer.m] = []
    }
    if(matrix[pointer.y][pointer.m][pointer.d] === undefined) {
        matrix[pointer.y][pointer.m][pointer.d] = []
    }
    if(matrix[pointer.y][pointer.m][pointer.d][pointer.h / 3] === undefined) {
        matrix[pointer.y][pointer.m][pointer.d][pointer.h / 3] = value
    }
    return matrix
}

function readDataOfMatrix(matrix: number[][][][], date: Date):number|null {
    let pointer = dateToPointer(date)
    let val:number|null = matrix?.[pointer.y]?.[pointer.m]?.[pointer.d]?.[pointer.h / 3]
    return val?val:null
}

/**
 * Return 4 index to search into matrix by the date.
 * Using a proxy cache to avoid to much processing
 */
let mapPointer = new Map<number, pointer>()
function dateToPointer(date:Date):pointer{
    if(mapPointer.has(date.valueOf())){
        return mapPointer.get(date.valueOf()) as pointer
    }
    
    let pointer:pointer = {
        y:date.getFullYear(),
        m:date.getMonth()+1,
        d:date.getDate(),
        h:date.getHours(),
    }

    mapPointer.set(date.valueOf(), pointer)
    return pointer
}

export function clearCsvString(str:string):string{
    return str.replaceAll("\"","")
}