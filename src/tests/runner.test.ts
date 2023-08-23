import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import * as defaultjson from './struct.json';
import type { clientId, env, instance, royaume,  } from '$lib/gitStruct';
import { SearchEngine } from '../routes/searchEngine';
import { StateOfFilters } from '../routes/StateOfFilters';



describe('testJSONLoading', () => {
    it('basic test of loading fake JSON', () => {
        let instances:instance[] = getFakeDate()
        expect((instances[0].royaumes[0].clientIds as clientId[])[1].envs[0].label).toEqual('recette')
        expect((instances[0].royaumes[0].clientIds as clientId[])[1].envs[0].show).toEqual(undefined)
    });
})

describe('state mocking function', () => {

    const mock = vi.spyOn(StateOfFilters, 'getAllStatesOfFilteers');  // spy on getStateOfFilters

    beforeEach(() => {
        mock.mockReset()
        mock.mockClear()
    })

    afterEach(() => {
        mock.mockReset()
        mock.mockClear()
    })

    it('mock of single function should work as intended', () => {
        let map = new Map<string,Map<string,boolean>|null>()
        let partial = new Map<string,boolean>()
        map.set("foo",partial)
        mock.mockReturnValue(map);  // mock the return value
        
        
        expect(StateOfFilters.getAllStatesOfFilteers()).toBe(map)
        expect(mock).toHaveBeenCalledTimes(1)

        expect(SearchEngine.getAllStatesOfFilteersProxy()).toBe(map)
        expect(mock).toHaveBeenCalledTimes(2)
    })

})


export function deepComparatorInterfaces(o1:instance[],o2:instance[]){
    
    if(o1.length !== o2.length){return false}

    for(let i = 0; i<o1.length; i++){
        if(deepComparatorInterface(o1[i], o2[i]) == false){
            return false
        }
    }

    return true
}
function deepComparatorInterface(o1:instance,o2:instance){

    if(o1.label !== o2.label){return false}
    if(o1.show !== o2.show){return false}
    if(o1.royaumes.length !== o2.royaumes.length){return false}
    
    for(let i = 0; i<o1.royaumes.length; i++){
        if(deepComparatorRoyaume(o1.royaumes[i], o2.royaumes[i]) == false){
            return false
        }
    }

    return true
}
function deepComparatorRoyaume(o1:royaume,o2:royaume){

    if(o1.label !== o2.label){return false}
    if(o1.show !== o2.show){return false}
    if(o1.clientIds?.length !== o2.clientIds?.length){return false}
    
    for(let i = 0; i < (o1.clientIds as clientId[]).length; i++){
        if(deepComparatorClientId((o1.clientIds as clientId[])[i], (o2.clientIds as clientId[])[i]) == false){
            return false
        }
    }

    return true
}

function deepComparatorClientId(o1:clientId,o2:clientId){

    if(o1.label !== o2.label){return false}
    if(o1.show !== o2.show){return false}
    if(o1.protocol !== o2.protocol){return false}
    if(o1.envs.length !== o2.envs.length){return false}
    
    for(let i = 0; i<o1.envs.length; i++){
        if(deepComparatorEnv(o1.envs[i], o2.envs[i]) == false){
            return false
        }
    }

    return true
}

function deepComparatorEnv(o1:env,o2:env){

    if(o1.label !== o2.label){return false}
    if(o1.show !== o2.show){return false}
    if(o1.uris.length !== o2.uris.length){return false}
    
    for(let i = 0; i<o1.uris.length; i++){
        if(o1.uris[i] !== o2.uris[i]){
            return false
        }
    }

    return true
}



export function getFakeDate():instance[]{
    return JSON.parse(JSON.stringify((defaultjson as { [key: string]: any })['default']))
}
/*

function generateFakeStruct(){
    let instances:instance[] = [
        {label:'l1',show:true,royaumes:[
            {label:'l1r1',show:true,clientIds:[
                {label:'l1r1c1',protocol:'saml',show:true,envs:[
                    {label:'dev',show:true,uris:[
                        'l1r1c1e1u1','l1r1c1e1u2','l1r1c1e1u3'
                    ]},
                    {label:'prod',show:true,uris:[
                        'l1r1c1e2u1','l1r1c1e2u2','l1r1c1e2u3'
                    ]}
                ]},
                {label:'l1r1c2',protocol:'open',show:true,envs:[
                    {label:'recette',show:true,uris:[
                        'l1r1c2e1u1','l1r1c2e1u2','l1r1c2e1u3'
                    ]},
                    {label:'prod',show:true,uris:[
                        'l1r1c2e2u1','l1r1c2e2u2','l1r1c2e2u3'
                    ]}
                ]}
            ]},
            {label:'l1r2',show:true,clientIds:[
                {label:'l1r2c1',protocol:'saml',show:true,envs:[
                    {label:'recette',show:true,uris:[
                        'l1r2c1e1u1','l1r2c1e1u2','l1r2c1e1u3'
                    ]},
                    {label:'prod',show:true,uris:[
                        'l1r2c1e2u1','l1r2c1e2u2','l1r2c1e2u3'
                    ]}
                ]},
                {label:'l1r2c2',protocol:'saml',show:true,envs:[
                    {label:'l1r2c2e1',show:true,uris:[
                        'l1r2c2e1u1','l1r2c2e1u2','l1r2c2e1u3'
                    ]},
                    {label:'l1r2c2e2',show:true,uris:[
                        'l1r2c2e2u1','l1r2c2e2u2','l1r2c2e2u3'
                    ]}
                ]}
            ]}
        ]},
        {label:'l1',show:true,royaumes:[
            {label:'l2r1',show:true,clientIds:[
                {label:'l2r1c1',protocol:'saml',show:true,envs:[
                    {label:'preproduction',show:true,uris:[
                        'l2r1c1e1u1','l2r1c1e1u2','l2r1c1e1u3'
                    ]},
                    {label:'prod',show:true,uris:[
                        'l2r1c1e2u1','l2r1c1e2u2','l2r1c1e2u3'
                    ]}
                ]},
                {label:'l2r1c2',protocol:'saml',show:true,envs:[
                    {label:'recette',show:true,uris:[
                        'l2r1c2e1u1','l2r1c2e1u2','l2r1c2e1u3'
                    ]},
                    {label:'prod',show:true,uris:[
                        'l2r1c2e2u1','l2r1c2e2u2','l2r1c2e2u3'
                    ]}
                ]}
            ]},
            {label:'l2r2',show:true,clientIds:[
                {label:'l2r2c1',protocol:'open',show:true,envs:[
                    {label:'l2r2c1e1',show:true,uris:[
                        'l2r2c1e1u1','l2r2c1e1u2','l2r2c1e1u3'
                    ]},
                    {label:'l2r2c1e2',show:true,uris:[
                        'l2r2c1e2u1','l2r2c1e2u2','l2r2c1e2u3'
                    ]}
                ]},
                {label:'l2r2c2',protocol:'open',show:true,envs:[
                    {label:'dev',show:true,uris:[
                        'l2r2c2e1u1','l2r2c2e1u2','l2r2c2e1u3'
                    ]},
                    {label:'prod',show:true,uris:[
                        'l2r2c2e2u1','l2r2c2e2u2','l2r2c2e2u3'
                    ]}
                ]}
            ]}
        ]}
    ]
}*/