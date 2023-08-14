import type { clientIdError } from "$lib/elasticStruct";


export function emptyClientIdError(label:string, instance:string = "unknown"):clientIdError{
    return {
        clientId:label,
        instance:instance/*,
        CLIENT_NOT_FOUND:[],
        COOKIE:[],
        DIFF_USER_AUTH:[],
        EXPIRED_CODE:[],
        IDP_ERROR:[],
        INVALID_CODE:[],
        INVALID_REDIRECT_URI:[],
        INVALID_USER_CRED:[],
        NOT_ALLOWED:[],
        REQUEST_INVALID:[],
        USER_DISABLED:[],
        USER_NOT_FOUND:[],
        USER_DISABLED_TMP:[],
        USERNAME_IN_USE:[],*/
    }
}