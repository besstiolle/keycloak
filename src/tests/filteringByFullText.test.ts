import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import type { instance } from '$lib/struct';

import * as i0 from './fullText/i0.json';
import * as i0_result from './fullText/i0_result.json';
import * as i0r1 from './fullText/i0r1.json';
import * as i0r1_result from './fullText/i0r1_result.json';
import * as i0r1c1 from './fullText/i0r1c1.json';
import * as i0r1c1_result from './fullText/i0r1c1_result.json';
import * as i0r1c0e0u0 from './fullText/i0r1c0e0u0.json'; 
import * as i0r1c0e0u0_result from './fullText/i0r1c0e0u0_result.json';
import * as u0 from './fullText/u0.json';
import * as u0_result from './fullText/u0_result.json';

import { SearchEngine } from '../routes/searchEngine';
import { deepComparatorInterfaces } from './runner.test';
import { StateOfFilters } from '../routes/StateOfFilters';


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

    it('if one instance was searched, all child node must be true and everything else should be false', () => {

        let instances:instance[] = JSON.parse(JSON.stringify((i0 as { [key: string]: any })['default']))
        let expectedResults:instance[] = JSON.parse(JSON.stringify((i0_result as { [key: string]: any })['default']))

        SearchEngine.filteringByFullText(instances, 'i0')


        //console.info("expected : ", JSON.stringify(expectedResults,null,1))
        //console.info("result : ", JSON.stringify(instances,null,1))

        expect(deepComparatorInterfaces(instances, expectedResults)).toBeTruthy()
    })


    it('if one royaume was searched, all child node must be true, its parent must be true and everything else should be false', () => {

        let instances:instance[] = JSON.parse(JSON.stringify((i0r1 as { [key: string]: any })['default']))
        let expectedResults:instance[] = JSON.parse(JSON.stringify((i0r1_result as { [key: string]: any })['default']))

        SearchEngine.filteringByFullText(instances, 'i0r1')

        //console.info("expected : ", JSON.stringify(expectedResults,null,1))
        //console.info("result : ", JSON.stringify(instances,null,1))

        expect(deepComparatorInterfaces(instances, expectedResults)).toBeTruthy()
    })

    

    it('if one clientId was searched by label, all child node must be true, its parent must be true and everything else should be false', () => {

        let instances:instance[] = JSON.parse(JSON.stringify((i0r1c1 as { [key: string]: any })['default']))
        let expectedResults:instance[] = JSON.parse(JSON.stringify((i0r1c1_result as { [key: string]: any })['default']))

        SearchEngine.filteringByFullText(instances, 'i0r1c1')

        //console.info("expected : ", JSON.stringify(expectedResults,null,1))
        //console.info("result : ", JSON.stringify(instances,null,1))

        expect(deepComparatorInterfaces(instances, expectedResults)).toBeTruthy()
    })

    
    it('if one env was searched by uri, its parent must be true and everything else should be false', () => {

        let instances:instance[] = JSON.parse(JSON.stringify((i0r1c0e0u0 as { [key: string]: any })['default']))
        let expectedResults:instance[] = JSON.parse(JSON.stringify((i0r1c0e0u0_result as { [key: string]: any })['default']))

        SearchEngine.filteringByFullText(instances, 'i0r1c0e0u0')

        //console.info("expected : ", JSON.stringify(expectedResults,null,1))
        //console.info("result : ", JSON.stringify(instances,null,1))

        expect(deepComparatorInterfaces(instances, expectedResults)).toBeTruthy()
    })


    
    it('if multiple env was searched by uri, their parent must be true and everything else should be false', () => {

        let instances:instance[] = JSON.parse(JSON.stringify((u0 as { [key: string]: any })['default']))
        let expectedResults:instance[] = JSON.parse(JSON.stringify((u0_result as { [key: string]: any })['default']))

        SearchEngine.filteringByFullText(instances, 'u0')

        //console.info("expected : ", JSON.stringify(expectedResults,null,1))
        //console.info("result : ", JSON.stringify(instances))
 
        expect(deepComparatorInterfaces(instances, expectedResults)).toBeTruthy()
    })

    

})
