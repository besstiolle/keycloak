import type { clientIdElastic } from "$lib/elasticStruct";


export function emptyClientIdElastic(label:string, instance:string = "unknown"):clientIdElastic{
    return {
        clientId:label,
        instance:instance,
        HABILITATIONS:[],
        STRONGBOX:[],
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
        CUSTOM_REQUIRED_ACTION:[],
        VERIFY_EMAIL_ERROR:[],
        SEND_RESET_PASSWORD:[],
        UPDATE_PASSWORD_ERROR:[]
    }
}