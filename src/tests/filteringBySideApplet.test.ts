import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import type { clientId, instance } from '$lib/struct';
import { getFakeDate } from './runner.test';

import { stateOfFiltersAsMap, testResult } from './filteringBySideAppletUtils';
import { SearchEngine } from '../routes/searchEngine';
import { StateOfFilters } from '../routes/StateOfFilters';


describe('test Filtering By Side Applet', () => {

    const mock = vi.spyOn(StateOfFilters, 'getAllStatesOfFilteers');  // spy on getStateOfFilters

    beforeEach(() => {
        mock.mockReset()
        mock.mockClear()
    })

    afterEach(() => {
        mock.mockReset()
        mock.mockClear()
    })
 
    it('by default, everything should stay "show=undefined"', () => {
        mock.mockReturnValue(stateOfFiltersAsMap());  // mock the return value

        let instances:instance[] = getFakeDate()
        SearchEngine.filteringBySideApplet(instances)

        expect( StateOfFilters.getAllStatesOfFilteers).toBeCalledTimes(1)

        let shouldBeFalse: string[] = []
        let shouldbeTrue:string[] = []
        testResult(instances, shouldBeFalse, shouldbeTrue)
    }) 

    it('without 1 instance, everything should stay "show=undefined" except that node', () => {
        let map = stateOfFiltersAsMap()
        let mapMocked = map.get(StateOfFilters.ID_INSTANCES)
        if(mapMocked !== undefined){
            mapMocked?.set('i0',false)
            map.set(StateOfFilters.ID_INSTANCES,mapMocked)
        }

        
        mock.mockReturnValue(map);  // mock the return value

        let instances:instance[] = getFakeDate()
        SearchEngine.filteringBySideApplet(instances)

        expect( StateOfFilters.getAllStatesOfFilteers).toBeCalledTimes(1)

        let shouldBeFalse: string[] = ['i0']
        let shouldbeTrue:string[] = []
        testResult(instances, shouldBeFalse, shouldbeTrue)

    })

    it('without 1 royaume, everything should stay "show=undefined" except that node', () => {
        let map = stateOfFiltersAsMap()
        let mapMocked = map.get(StateOfFilters.ID_ROYAUMES)
        if(mapMocked !== undefined){
            mapMocked?.set('i0r1',false)
            map.set(StateOfFilters.ID_ROYAUMES,mapMocked)
        }

        mock.mockReturnValue(map);  // mock the return value

        let instances:instance[] = getFakeDate()
        SearchEngine.filteringBySideApplet(instances)

        expect( StateOfFilters.getAllStatesOfFilteers).toBeCalledTimes(1)

        let shouldBeFalse: string[] = ['i0r1'] 
        let shouldbeTrue:string[] = []
        testResult(instances, shouldBeFalse, shouldbeTrue)

    })

    it('without 1 protocole, everything should stay "show=undefined" except that type of protocole', () => {
        let map = stateOfFiltersAsMap()
        let mapMocked = map.get(StateOfFilters.ID_PROTOCOLES)
        if(mapMocked !== undefined){
            mapMocked?.set('saml',false)
            map.set(StateOfFilters.ID_PROTOCOLES,mapMocked)
        }

        mock.mockReturnValue(map);  // mock the return value

        let instances:instance[] = getFakeDate()
        SearchEngine.filteringBySideApplet(instances)

        expect( StateOfFilters.getAllStatesOfFilteers).toBeCalledTimes(1)

        let shouldBeFalse: string[] = ['i0r0c0', 'i0r1c0', 'i0r1c1', 'i1r0c0', 'i1r0c1'] 
        let shouldbeTrue:string[] = []
        testResult(instances, shouldBeFalse, shouldbeTrue)

    })

    it('without 1 env, everything should stay "show=undefined" except that type of env', () => {
        let map = stateOfFiltersAsMap()
        let mapMocked = map.get(StateOfFilters.ID_ENVS)
        if(mapMocked !== undefined){
            mapMocked?.set('dev',false)
            mapMocked?.set('prod',false)
            map.set(StateOfFilters.ID_ENVS,mapMocked)
        }

        mock.mockReturnValue(map);  // mock the return value

        let instances:instance[] = getFakeDate()
        SearchEngine.filteringBySideApplet(instances)

        expect( StateOfFilters.getAllStatesOfFilteers).toBeCalledTimes(1)

        let shouldBeFalse: string[] = ['dev','prod'] 
        let shouldbeTrue:string[] = []
        testResult(instances, shouldBeFalse, shouldbeTrue)

    }) 

    it('without 1 instance & 1 env, everything should stay "show=undefined" except that node & that type of env', () => {
        let map = stateOfFiltersAsMap()
        let mapMockedInstance = map.get(StateOfFilters.ID_INSTANCES)
        if(mapMockedInstance !== undefined){
            mapMockedInstance?.set('i1',false)
            map.set(StateOfFilters.ID_INSTANCES,mapMockedInstance)
        }

        let mapMockedEnvs = map.get(StateOfFilters.ID_ENVS)
        if(mapMockedEnvs !== undefined){
            mapMockedEnvs?.set('dev',false)
            mapMockedEnvs?.set('prod',false)
            map.set(StateOfFilters.ID_ENVS,mapMockedEnvs)
        }

        mock.mockReturnValue(map);  // mock the return value

        let instances:instance[] = getFakeDate()
        SearchEngine.filteringBySideApplet(instances)

        expect( StateOfFilters.getAllStatesOfFilteers).toBeCalledTimes(1)

        let shouldBeFalse: string[] = ['i1', 'dev','prod'] 
        let shouldbeTrue:string[] = []
        testResult(instances, shouldBeFalse, shouldbeTrue)

    })

    

    it('without 1 mapper "San Mapper", everything should stay "show=undefined" except that node env', () => {
        let map = stateOfFiltersAsMap()
        let mapMockedInstance = map.get(StateOfFilters.ID_MAPPERS)
        if(mapMockedInstance !== undefined){
            mapMockedInstance?.set(StateOfFilters.VALUE_DEFAULT_NO_MAPPER,false)
            map.set(StateOfFilters.ID_INSTANCES,mapMockedInstance)
        }

        mock.mockReturnValue(map);  // mock the return value

        let instances:instance[] = getFakeDate()
        SearchEngine.filteringBySideApplet(instances)

        expect( StateOfFilters.getAllStatesOfFilteers).toBeCalledTimes(1)

        instances.forEach(i => {
            //Test show value
            expect(i.show).toBeUndefined()
            
            i.royaumes.forEach(r => {
                //Test show value 
                expect(r.show).toBeUndefined();
    
                (r.clientIds as typeof clientId[]).forEach(c => {
                    //Test show value
                    expect(i.show).toBeUndefined()     

                    c.envs.forEach(e => {
                        //Test show value
                        if(c.label === 'i0r0c0'){
                            expect(e.show).toBeUndefined()
                        } else {
                            expect(e.show).not.toBeUndefined()
                            expect(e.show).toBeFalsy()     
                        }
                    })
                })
            })
        })

    })

    it('without 1 mapper "m1", everything should stay "show=undefined" except that node env', () => {
        let map = stateOfFiltersAsMap()
        let mapMockedInstance = map.get(StateOfFilters.ID_MAPPERS)
        if(mapMockedInstance !== undefined){
            mapMockedInstance?.set('m1',false)
            map.set(StateOfFilters.ID_INSTANCES,mapMockedInstance)
        }

        mock.mockReturnValue(map);  // mock the return value 

        let instances:instance[] = getFakeDate()
        SearchEngine.filteringBySideApplet(instances)

        expect( StateOfFilters.getAllStatesOfFilteers).toBeCalledTimes(1)

        instances.forEach(i => {
            //Test show value
            expect(i.show).toBeUndefined()
            
            i.royaumes.forEach(r => {
                //Test show value 
                expect(r.show).toBeUndefined();
    
                (r.clientIds as typeof clientId[]).forEach(c => {
                    //Test show value
                    expect(i.show).toBeUndefined()     

                    c.envs.forEach(e => {
                        //Test show value
                        if(c.label === 'i0r0c0' && e.label === 'dev'){
                            expect(e.show).toBeFalsy()
                            expect(e.show).not.toBeUndefined()  
                        } else {
                            expect(e.show).toBeUndefined()     
                        }
                    })
                })
            })
        })

    })
})