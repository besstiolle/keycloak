export enum CSV_TYPE {
    REQUESTS,ERRORS
}
export enum REQUEST_TYPE {
    STRONGBOX='STRONGBOX',
    HABILITATIONS='HABILITATIONS',
    USER_INFO_REQUEST='USER_INFO_REQUEST',
    LOGIN_ERROR='LOGIN_ERROR',
    CODE_TO_TOKEN='CODE_TO_TOKEN',
    LOGIN='LOGIN',
    REFRESH_TOKEN='REFRESH_TOKEN',
    CLIENT_LOGIN='CLIENT_LOGIN',
    RESET_PASSWORD_ERROR='RESET_PASSWORD_ERROR',
    TOKEN_EXCHANGE='TOKEN_EXCHANGE',
    UPDATE_PROFILE='UPDATE_PROFILE',
    REFRESH_TOKEN_ERROR='REFRESH_TOKEN_ERROR',
    CUSTOM_REQUIRED_ACTION_ERROR='CUSTOM_REQUIRED_ACTION_ERROR',
    CODE_TO_TOKEN_ERROR='CODE_TO_TOKEN_ERROR',
    SEND_RESET_PASSWORD_ERROR='SEND_RESET_PASSWORD_ERROR',
    SEND_VERIFY_EMAIL_ERROR='SEND_VERIFY_EMAIL_ERROR',
    UPDATE_PASSWORD='UPDATE_PASSWORD',
    LOGOUT='LOGOUT',
    CUSTOM_REQUIRED_ACTION='CUSTOM_REQUIRED_ACTION',
    VERIFY_EMAIL_ERROR='VERIFY_EMAIL_ERROR', //update 20 mai 2023
    SEND_RESET_PASSWORD='SEND_RESET_PASSWORD' //update 20 mai 2023
}

	
export enum DATA_TYPE {
    SUM_BY_DAY='SUM_BY_DAY',
    SUM_BY_WEEK='SUM_BY_WEEK',
    SUM_BY_MONTH='SUM_BY_MONTH',
    SUM_BY_DAY_OF_WEEK='SUM_BY_DAY_OF_WEEK',
    AVG_BY_DAY_OF_WEEK='AVG_BY_DAY_OF_WEEK',
    ABSOLUTE_SUM='ABSOLUTE_SUM'
}


export const enum ACTION_VAL{
    SUM_BY_INSTANCE="SUM_BY_INSTANCE",
    DISTINCT_BY_INSTANCE="DISTINCT_BY_INSTANCE",
    SUM_BY_CLIENTID="SUM_BY_CLIENTID",
    DISTINCT_BY_CLIENTID="DISTINCT_BY_CLIENTID",
    SUM_BY_REQUESTTYPE="SUM_BY_REQUESTTYPE",
    DISTINCT_BY_REQUESTTYPE="DISTINCT_BY_REQUESTTYPE",
}

export const enum GRAPH_TYPE{
    LINE="LINE",
    PIE="PIE",
    TABLEUR="TABLEUR",
}

export interface GlobalState{
    isSumOrDistinctByInstance:ACTION_VAL,
    isSumOrDistinctByClientId:ACTION_VAL,
    isSumOrDistinctByRequestType:ACTION_VAL,
    isAgregate:DATA_TYPE,
    graphType:GRAPH_TYPE,
    selectedInstances:string[],
    selectedClientsId:string[],
    selectedRequestsType:string[]
}

export interface rawData{
    sumByDay : Map<number,number>,
    sumByWeek : Map<number,number>,
    sumByMonth : Map<number,number>,
    sumByDayOfWeek : Map<number,number>,
    cptByDayOfWeek : Map<number,number>,
    avgByDayOfWeek : Map<number,number>,
    //sumByDayOfWeek : Map<number,number>,
    //cptByDayOfYear : Map<number,number>,
    sumAbsolute : number
} 

export interface minMax{
    min:number,
    max:number
}

export interface elasticStore{
    minDate:Date,
    maxDate:Date,
    container:Map<string, clientIdElastic>,
    errors:Map<string, number[][][][]>
}

export interface pointer{
    y:number,
    m:number,
    d:number,
    h:number
}

export interface DatasetAndLimitsForLine{
    min:number,
    max:number,
    labelsAndDatasets:LabelAndDataset[]
}

export interface LabelAndDataset{
    label:string,
    data:Map<number, number>,
    weight:number
}
export interface LabelAndDatasetString{
    label:string,
    data:Map<string, number>
}
export interface datasetTableurHit{
    clientId:string,
    instance: string,
    firstSeen:Date,
    lastSeen:Date,
    duration:number,
    avgAll:number,
    avgHit30d:number,
    maxhit:number,
    maxDate:Date
    sumHits:number,
    isKnown:boolean
}

export interface clientIdElastic extends Record<string,any>{
    clientId:string
    instance:string

    //DATA array
    HABILITATIONS:number[][][][] //habilitation 
    STRONGBOX:number[][][][] //strongbox
    //other differents type of requests
    USER_INFO_REQUEST:number[][][][],
    LOGIN_ERROR:number[][][][],
    CODE_TO_TOKEN:number[][][][],
    LOGIN:number[][][][],
    REFRESH_TOKEN:number[][][][],
    CLIENT_LOGIN:number[][][][],
    RESET_PASSWORD_ERROR:number[][][][],
    TOKEN_EXCHANGE:number[][][][],
    UPDATE_PROFILE:number[][][][],
    REFRESH_TOKEN_ERROR:number[][][][],
    CUSTOM_REQUIRED_ACTION_ERROR:number[][][][],
    CODE_TO_TOKEN_ERROR:number[][][][],
    SEND_RESET_PASSWORD_ERROR:number[][][][],
    SEND_VERIFY_EMAIL_ERROR:number[][][][],
    UPDATE_PASSWORD:number[][][][],
    LOGOUT:number[][][][],
    CUSTOM_REQUIRED_ACTION:number[][][][],
    VERIFY_EMAIL_ERROR:number[][][][],
    SEND_RESET_PASSWORD:number[][][][]
}

export function getKeysOfClientIdElastic(){

    return [
        'HABILITATIONS',
        'STRONGBOX',
        'USER_INFO_REQUEST',
        'LOGIN_ERROR',
        'CODE_TO_TOKEN',
        'LOGIN',
        'REFRESH_TOKEN',
        'CLIENT_LOGIN',
        'RESET_PASSWORD_ERROR',
        'TOKEN_EXCHANGE',
        'UPDATE_PROFILE',
        'REFRESH_TOKEN_ERROR',
        'CUSTOM_REQUIRED_ACTION_ERROR',
        'CODE_TO_TOKEN_ERROR',
        'SEND_RESET_PASSWORD_ERROR',
        'SEND_VERIFY_EMAIL_ERROR',
        'UPDATE_PASSWORD',
        'LOGOUT',
        'CUSTOM_REQUIRED_ACTION',
        'VERIFY_EMAIL_ERROR',
        'SEND_RESET_PASSWORD'
    ]
}