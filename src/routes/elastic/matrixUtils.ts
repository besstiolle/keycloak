import type { pointer } from "$lib/elasticStruct"


export function writeDataInMatrix(matrix: number[][][][], date: Date, value:number): number[][][][]{
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

let hasNan=  false
export function readDataOfMatrix(matrix: number[][][][], date: Date):number|null {
    let pointer = dateToPointer(date)
    if( matrix != undefined && matrix[pointer.y] !== undefined 
            && matrix[pointer.y][pointer.m] !== undefined
            && matrix[pointer.y][pointer.m][pointer.d] !== undefined
            && matrix[pointer.y][pointer.m][pointer.d][pointer.h / 3] !== undefined ){
        if(!isNaN(matrix[pointer.y][pointer.m][pointer.d][pointer.h / 3])){
            return matrix[pointer.y][pointer.m][pointer.d][pointer.h / 3]
        } else {
            if(!hasNan){
                console.error ("NaN ", matrix)
            }
            //hasNan = true
        }
    }
    return null
}

function dateToPointer(date:Date):pointer{
    return {
        y:date.getFullYear(),
        m:date.getMonth()+1,
        d:date.getDate(),
        h:date.getHours(),
    }
}

export function clearCsvString(str:string):string{
    return str.replaceAll("\"","")
}