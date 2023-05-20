import type { clientIdElastic, elasticStore } from "$lib/elasticStruct";

export function getEmptyElasticStore():elasticStore {
    return {
        minDate:new Date("2099-01-01"),
        maxDate:new Date("2000-01-01"),
        container:new Map<string, clientIdElastic>()
    }
}