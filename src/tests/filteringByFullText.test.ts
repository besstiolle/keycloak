import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import type { instance } from '$lib/struct';
import { getFakeDate } from './runner.test';

import { stateOfFiltersAsMap, testResult } from './searchEngineCommons';
import { SearchEngine } from '../routes/searchEngine';
import { StateOfFilters } from '../routes/StateOfFilters';

/*
describe('test Filtering by Full Text', () => {

    const mock = vi.spyOn(StateOfFilters, 'getAllStatesOfFilteers');  // spy on getStateOfFilters

    beforeEach(() => {
        mock.mockReset()
        mock.mockClear()
    })

    afterEach(() => {
        mock.mockReset()
        mock.mockClear() 
    })

    it('if one instance was searched, everything should stay "show=undefined except this instance"', () => {
        mock.mockReturnValue(stateOfFiltersAsMap());  // mock the return value

        let instances:typeof instance[] = getFakeDate()
        SearchEngine.filteringBySideApplet(instances)
        SearchEngine.filteringByFullText(instances, 'i0')

        console.info(instances)

        expect( StateOfFilters.getAllStatesOfFilteers).toBeCalledTimes(1)

        let shouldBeFalse: string[] = ['i1','i1r0','i1r0c0','i1r0c0-recette','i1r0c0-prod','i1r0c1','i1r0c1-preproduction',
        'i1r0c1-prod', 'i1r1', 'i1r1c0','i1r1c0e0-recette', 'i1r1c0e1-prod', 'i1r1c1', 'i1r1c1e0-recette', 
        'i1r1c1e1-preprod']
        let shouldbeTrue:string[] = ['i0','i0r0','i0r0c0','i0r0c0-dev','i0r0c0-prod','i0r0c1','i0r0c1-recette',
                'i0r0c1-prod', 'i0r1', 'i0r1c0','i0r1c0e0-recette', 'i0r1c0e1-prod', 'i0r1c1', 'i0r1c1e0-recette', 
                'i0r1c1e1-preprod']  //Instance & all child node
        testResult(instances, shouldBeFalse, shouldbeTrue)
    })

})*/