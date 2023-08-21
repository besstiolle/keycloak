

import pako from 'pako';
import * as base64 from "byte-base64";
import { fromElasticStoretoJson, fromJsonToElasticStore } from "../routes/elastic/jsonParser";
import type { elasticStore } from '../routes/elastic/elasticStoreFactory';

export const JSON_GIT_DATA = "jsonGitData"
export const JSON_CONFIG_DATA = "jsonConfigData"
export const JSON_ELASTIC_DATA = "jsonElasticData"
export const CACHE = "CACHE1"

export function fromElasticStoreToB64deflatedString(elasticStore:elasticStore):string{
    const json = fromElasticStoretoJson(elasticStore)
    const compressed = pako.deflate(json, { level: 9})
    const b64 = base64.bytesToBase64(compressed)
    return b64
}

export function FromB64DeflatedStringToElasticStire(b64:string):elasticStore{
    const returned = base64.base64ToBytes(b64)
    const restored:object = JSON.parse(pako.inflate(returned, { to: 'string' }));
    //console.info(restored)  
    //FIXME : function fromJsonToElasticStore won't work
    let elasticStore:elasticStore = fromJsonToElasticStore(restored)
    return elasticStore
}