
export interface GlobalState{
    isSumOrDistinctByInstance:ACTION_VAL,
    isSumOrDistinctByClientId:ACTION_VAL,
    isSumOrDistinctByRequestType:ACTION_VAL,
    isSumOrDistinctByErrorsByClientId:ACTION_VAL,
    isSumOrDistinctByErrorsSoc:ACTION_VAL,
    isAgregate:DATA_TYPE,
    graphType:GRAPH_TYPE,
    instances:Map<string,DisplaybleItems>,
    clientIds:Map<string,DisplaybleItems>,
    requestsType:Map<string,DisplaybleItems>,
    errorsByClientId:Map<string,DisplaybleItems>,
    errorsSoc:Map<string,DisplaybleItems>,
    showSmell:TRINAIRE_VAL
    sourceContainer:SOURCE_CONTAINER
}


//Initiate states store
export function initGlobalState():GlobalState {
    return {
        isSumOrDistinctByInstance : ACTION_VAL.SUM_BY_INSTANCE,
        isSumOrDistinctByClientId : ACTION_VAL.SUM_BY_CLIENTID,
        isSumOrDistinctByRequestType : ACTION_VAL.SUM_BY_REQUESTTYPE,
        isSumOrDistinctByErrorsByClientId : ACTION_VAL.SUM_BY_ERRORSBYCLIENTID,
        isSumOrDistinctByErrorsSoc : ACTION_VAL.SUM_BY_ERRORSSOC,
        graphType : GRAPH_TYPE.LINE,
        isAgregate : DATA_TYPE.SUM_BY_WEEK,
        instances: new Map<string, DisplaybleItems>(),
        clientIds: new Map<string, DisplaybleItems>(),
        requestsType: new Map<string, DisplaybleItems>(),
        errorsByClientId:new Map<string, DisplaybleItems>(),
        errorsSoc:new Map<string, DisplaybleItems>(),
        showSmell: TRINAIRE_VAL.UNDEF,
        sourceContainer: SOURCE_CONTAINER.HITS
    }
}


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
    ERRORS_SOC="ERRORS_SOC",
    TABLEUR="TABLEUR"

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
    SUM_BY_ERRORSSOC="SUM_BY_ERRORSSOC",
    DISTINCT_BY_ERRORSSOC="DISTINCT_BY_ERRORSSOC",
}

export const enum GRAPH_TYPE{
    LINE="LINE",
    PIE="PIE"
}

export interface DisplaybleItems{
    value:string,
    isVisible:boolean
    isChecked:boolean
}