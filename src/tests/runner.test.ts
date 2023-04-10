import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import * as defaultjson from './struct.json';
import type { instance } from '$lib/struct';
import { SearchEngine } from '../routes/searchEngine';
import { StateOfFilters } from '../routes/StateOfFilters';



describe('testJSONLoading', () => {
    it('basic test of loading fake JSON', () => {
        let instances:typeof instance[] = getFakeDate()
        expect(instances[0].royaumes[0].clientIds[1].envs[0].label).toEqual('recette')
        expect(instances[0].royaumes[0].clientIds[1].envs[0].show).toEqual(undefined)
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


export function getFakeDate():typeof instance[]{
    return JSON.parse(JSON.stringify((defaultjson as { [key: string]: any })['default']))
}
/*

function generateFakeStruct(){
    let instances:typeof instance[] = [
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