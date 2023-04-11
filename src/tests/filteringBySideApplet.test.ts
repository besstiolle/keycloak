import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import type { instance } from '$lib/struct';
import { getFakeDate } from './runner.test';

import { stateOfFiltersAsMap, testResult } from './searchEngineCommons';
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

        let instances:typeof instance[] = getFakeDate()
        SearchEngine.filteringBySideApplet(instances)

        expect( StateOfFilters.getAllStatesOfFilteers).toBeCalledTimes(1)

        let shouldBeFalse: string[] = []
        let shouldbeTrue:string[] = []
        testResult(instances, shouldBeFalse, shouldbeTrue)
    }) 

    it('without 1 instance, everything should stay "show=undefined" except that node', () => {
        let map = stateOfFiltersAsMap()
        let mapMocked = map.get(SearchEngine.ID_INSTANCES)
        if(mapMocked !== undefined){
            mapMocked?.set('i0',false)
            map.set(SearchEngine.ID_INSTANCES,mapMocked)
        }

        
        mock.mockReturnValue(map);  // mock the return value

        let instances:typeof instance[] = getFakeDate()
        SearchEngine.filteringBySideApplet(instances)

        expect( StateOfFilters.getAllStatesOfFilteers).toBeCalledTimes(1)

        let shouldBeFalse: string[] = ['i0']
        let shouldbeTrue:string[] = []
        testResult(instances, shouldBeFalse, shouldbeTrue)

    })

    it('without 1 royaume, everything should stay "show=undefined" except that node', () => {
        let map = stateOfFiltersAsMap()
        let mapMocked = map.get(SearchEngine.ID_ROYAUMES)
        if(mapMocked !== undefined){
            mapMocked?.set('i0r1',false)
            map.set(SearchEngine.ID_ROYAUMES,mapMocked)
        }

        mock.mockReturnValue(map);  // mock the return value

        let instances:typeof instance[] = getFakeDate()
        SearchEngine.filteringBySideApplet(instances)

        expect( StateOfFilters.getAllStatesOfFilteers).toBeCalledTimes(1)

        let shouldBeFalse: string[] = ['i0r1'] 
        let shouldbeTrue:string[] = []
        testResult(instances, shouldBeFalse, shouldbeTrue)

    })

    it('without 1 protocole, everything should stay "show=undefined" except that type of protocole', () => {
        let map = stateOfFiltersAsMap()
        let mapMocked = map.get(SearchEngine.ID_PROTOCOLES)
        if(mapMocked !== undefined){
            mapMocked?.set('saml',false)
            map.set(SearchEngine.ID_PROTOCOLES,mapMocked)
        }

        mock.mockReturnValue(map);  // mock the return value

        let instances:typeof instance[] = getFakeDate()
        SearchEngine.filteringBySideApplet(instances)

        expect( StateOfFilters.getAllStatesOfFilteers).toBeCalledTimes(1)

        let shouldBeFalse: string[] = ['i0r0c0', 'i0r1c0', 'i0r1c1', 'i1r0c0', 'i1r0c1'] 
        let shouldbeTrue:string[] = []
        testResult(instances, shouldBeFalse, shouldbeTrue)

    })

    it('without 1 env, everything should stay "show=undefined" except that type of env', () => {
        let map = stateOfFiltersAsMap()
        let mapMocked = map.get(SearchEngine.ID_ENVS)
        if(mapMocked !== undefined){
            mapMocked?.set('dev',false)
            mapMocked?.set('prod',false)
            map.set(SearchEngine.ID_ENVS,mapMocked)
        }

        mock.mockReturnValue(map);  // mock the return value

        let instances:typeof instance[] = getFakeDate()
        SearchEngine.filteringBySideApplet(instances)

        expect( StateOfFilters.getAllStatesOfFilteers).toBeCalledTimes(1)

        let shouldBeFalse: string[] = ['dev','prod'] 
        let shouldbeTrue:string[] = []
        testResult(instances, shouldBeFalse, shouldbeTrue)

    }) 

    it('without 1 instance & 1 env, everything should stay "show=undefined" except that node & that type of env', () => {
        let map = stateOfFiltersAsMap()
        let mapMockedInstance = map.get(SearchEngine.ID_INSTANCES)
        if(mapMockedInstance !== undefined){
            mapMockedInstance?.set('i1',false)
            map.set(SearchEngine.ID_INSTANCES,mapMockedInstance)
        }

        let mapMockedEnvs = map.get(SearchEngine.ID_ENVS)
        if(mapMockedEnvs !== undefined){
            mapMockedEnvs?.set('dev',false)
            mapMockedEnvs?.set('prod',false)
            map.set(SearchEngine.ID_ENVS,mapMockedEnvs)
        }

        mock.mockReturnValue(map);  // mock the return value

        let instances:typeof instance[] = getFakeDate()
        SearchEngine.filteringBySideApplet(instances)

        expect( StateOfFilters.getAllStatesOfFilteers).toBeCalledTimes(1)

        let shouldBeFalse: string[] = ['i1', 'dev','prod'] 
        let shouldbeTrue:string[] = []
        testResult(instances, shouldBeFalse, shouldbeTrue)

    })
})