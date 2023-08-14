
export enum CSV_TYPE {
    REQUESTS,ERRORS_BY_CLIENTID,ERRORS_SOC,USERS
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
    SEND_RESET_PASSWORD='SEND_RESET_PASSWORD', //update 20 mai 2023
    UPDATE_PASSWORD_ERROR='UPDATE_PASSWORD_ERROR' //update 31 juillet 2023
}

export enum ERROR_BY_CLIENTID_TYPE{
    CLIENT_NOT_FOUND='CLIENT_NOT_FOUND',
    COOKIE='COOKIE',
    DIFF_USER_AUTH='DIFF_USER_AUTH',
    EXPIRED_CODE='EXPIRED_CODE',
    IDP_ERROR='IDP_ERROR',
    INVALID_CODE='INVALID_CODE',
    INVALID_REDIRECT_URI='INVALID_REDIRECT_URI',
    INVALID_USER_CRED='INVALID_USER_CRED',
    NOT_ALLOWED='NOT_ALLOWED',
    REQUEST_INVALID='REQUEST_INVALID',
    USER_DISABLED='USER_DISABLED',
    USER_NOT_FOUND='USER_NOT_FOUND',
    USER_DISABLED_TMP='USER_DISABLED_TMP',
    USERNAME_IN_USE='USERNAME_IN_USE'
}

export const ERROR_BY_CLIENTID_TYPE_HUMAN_READABLE_MAP:Map<string,ERROR_BY_CLIENTID_TYPE> = new Map([
    ['CLIENT NOT FOUND', ERROR_BY_CLIENTID_TYPE.CLIENT_NOT_FOUND],
    ['COOKIE', ERROR_BY_CLIENTID_TYPE.COOKIE],
    ['DIFFERENT USER AUTHENTICATED', ERROR_BY_CLIENTID_TYPE.DIFF_USER_AUTH],
    ['EXPIRED CODE', ERROR_BY_CLIENTID_TYPE.EXPIRED_CODE],
    ['IDENTITY PROVIDER ERROR', ERROR_BY_CLIENTID_TYPE.IDP_ERROR],
    ['INVALID CODE', ERROR_BY_CLIENTID_TYPE.INVALID_CODE],
    ['INVALID REDIRECT URI', ERROR_BY_CLIENTID_TYPE.INVALID_REDIRECT_URI],
    ['INVALID USER CREDENTIALS', ERROR_BY_CLIENTID_TYPE.INVALID_USER_CRED],
    ['NOT ALLOWED', ERROR_BY_CLIENTID_TYPE.NOT_ALLOWED],
    ['REQUÊTE INVALIDE', ERROR_BY_CLIENTID_TYPE.REQUEST_INVALID],
    ['USER DISABLED', ERROR_BY_CLIENTID_TYPE.USER_DISABLED],
    ['USER NOT FOUND', ERROR_BY_CLIENTID_TYPE.USER_NOT_FOUND],
    ['USER TEMPORARILY DISABLED', ERROR_BY_CLIENTID_TYPE.USER_DISABLED_TMP],
    ['USERNAME IN USE', ERROR_BY_CLIENTID_TYPE.USERNAME_IN_USE],
])
	
export enum DATA_TYPE {
    SUM_BY_DAY='SUM_BY_DAY',
    SUM_BY_WEEK='SUM_BY_WEEK',
    SUM_BY_MONTH='SUM_BY_MONTH',
    SUM_BY_DAY_OF_WEEK='SUM_BY_DAY_OF_WEEK',
    AVG_BY_DAY_OF_WEEK='AVG_BY_DAY_OF_WEEK',
    ABSOLUTE_SUM='ABSOLUTE_SUM'
}

export const enum TRINAIRE_VAL{
    UNDEF="UNDEFINED",
    TRUE="TRUE",
    FALSE="FALSE"
}
export const enum SOURCE_CONTAINER{
    HITS="HITS",
    ERRORS_BY_CLIENTID="ERRORS_BY_CLIENTID",

}

export const enum ACTION_VAL{
    SUM_BY_INSTANCE="SUM_BY_INSTANCE",
    DISTINCT_BY_INSTANCE="DISTINCT_BY_INSTANCE",
    SUM_BY_CLIENTID="SUM_BY_CLIENTID",
    DISTINCT_BY_CLIENTID="DISTINCT_BY_CLIENTID",
    SUM_BY_REQUESTTYPE="SUM_BY_REQUESTTYPE",
    DISTINCT_BY_REQUESTTYPE="DISTINCT_BY_REQUESTTYPE",
    SUM_BY_ERRORSBYCLIENTID="SUM_BY_ERRORSBYCLIENTID",
    DISTINCT_BY_ERRORSBYCLIENTID="DISTINCT_BY_ERRORSBYCLIENTID",
}

export const enum GRAPH_TYPE{
    LINE="LINE",
    PIE="PIE",
    TABLEUR="TABLEUR",
}

export interface DisplaybleItems{
    value:string,
    isVisible:boolean
    isChecked:boolean
}

export interface GlobalState{
    isSumOrDistinctByInstance:ACTION_VAL,
    isSumOrDistinctByClientId:ACTION_VAL,
    isSumOrDistinctByRequestType:ACTION_VAL,
    isSumOrDistinctByErrorsByClientId:ACTION_VAL,
    isAgregate:DATA_TYPE,
    graphType:GRAPH_TYPE,
    instances:Map<string,DisplaybleItems>,
    clientIds:Map<string,DisplaybleItems>,
    requestsType:Map<string,DisplaybleItems>,
    errorsByClientId:Map<string,DisplaybleItems>,
    showSmell:TRINAIRE_VAL
    sourceContainer:SOURCE_CONTAINER
}

export interface rawData{
    sumByDay : Map<number,number>,
    sumByWeek : Map<number,number>,
    sumByMonth : Map<number,number>,
    sumByDayOfWeek : Map<number,number>,
    cptByDayOfWeek : Map<number,number>,
    avgByDayOfWeek : Map<number,number>,
    sumAbsolute : number
} 

export interface minMax{
    min:number,
    max:number
}

export interface elasticStore{
    minDate:Date,
    maxDate:Date,
    containerClientId:Map<string, clientIdElastic>,
    containerErrorsByClientId:Map<string, clientIdError>,
    containerErrorsSoc:Map<string, number[]>
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

export interface clientIdError extends Record<string, any>{
    clientId:string
    instance:string

    /*
    CLIENT_NOT_FOUND:number[]
    COOKIE:number[]
    DIFF_USER_AUTH:number[]
    EXPIRED_CODE:number[]
    IDP_ERROR:number[]
    INVALID_CODE:number[]
    INVALID_REDIRECT_URI:number[]
    INVALID_USER_CRED:number[]
    NOT_ALLOWED:number[]
    REQUEST_INVALID:number[]
    USER_DISABLED:number[]
    USER_NOT_FOUND:number[]
    USER_DISABLED_TMP:number[]
    USERNAME_IN_USE:number[]*/
}

export interface clientIdElastic extends Record<string,any>{
    clientId:string
    instance:string
/*
    //DATA array
    HABILITATIONS:number[] //habilitation 
    STRONGBOX:number[] //strongbox
    //other differents type of requests
    USER_INFO_REQUEST:number[],
    LOGIN_ERROR:number[],
    CODE_TO_TOKEN:number[],
    LOGIN:number[],
    REFRESH_TOKEN:number[],
    CLIENT_LOGIN:number[],
    RESET_PASSWORD_ERROR:number[],
    TOKEN_EXCHANGE:number[],
    UPDATE_PROFILE:number[],
    REFRESH_TOKEN_ERROR:number[],
    CUSTOM_REQUIRED_ACTION_ERROR:number[],
    CODE_TO_TOKEN_ERROR:number[],
    SEND_RESET_PASSWORD_ERROR:number[],
    SEND_VERIFY_EMAIL_ERROR:number[],
    UPDATE_PASSWORD:number[],
    LOGOUT:number[],
    CUSTOM_REQUIRED_ACTION:number[],
    VERIFY_EMAIL_ERROR:number[],//update 20 mai 2023
    SEND_RESET_PASSWORD:number[],//update 20 mai 2023
    UPDATE_PASSWORD_ERROR:number[], //update 31 juillet 2023
    */
}

