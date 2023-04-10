import type { instance } from "$lib/struct"
import { SearchEngine } from "../routes/searchEngine"


export function testResult(instancesToTest:typeof instance[], shouldBeFalse: string[], shouldbeTrue:string[]){
    instancesToTest.forEach(i => {
        
        //Test show value vs the label
        itShouldBe(i.label, i.show, shouldBeFalse, shouldbeTrue)        
        i.royaumes.forEach(r => {
            
            //Test show value vs the label
            itShouldBe(r.label, r.show, shouldBeFalse, shouldbeTrue)        
            r.clientIds.forEach(c => {
                
                //Test show value vs the label
                itShouldBe(c.label, c.show, shouldBeFalse, shouldbeTrue)        
                c.envs.forEach(e => {
                    
                    //Test show value vs the label
                    itShouldBe(e.label, e.show, shouldBeFalse, shouldbeTrue)        
                    e.uris.forEach(uri => {
                        
                    })
                })
            })
        })
    })
}

function itShouldBe(label:string, show:boolean, shouldBeFalse: string[], shouldbeTrue:string[]){
    if(shouldBeFalse.indexOf(label) > -1 && shouldbeTrue.indexOf(label) > -1){
        console.error("error de configuration du test")
    }
    
    if(shouldBeFalse.indexOf(label) > -1){
        if(show !== false){
            console.error("error for label " + label + " : wasn't false", shouldBeFalse)
        }
        expect(show).toBeFalsy()
    } else if(shouldbeTrue.indexOf(label) > -1){
        if(show !== true){
            console.error("error for label " + label + " : wasn't true", shouldbeTrue)
        }
        
        expect(show).toBeTruthy()
    } else {
        if(show !== undefined){
            console.error("error for label " + label + " : wasn't undefined", shouldBeFalse, shouldbeTrue)
        }

        expect(show).toBeUndefined()
    }
}

export function stateOfFiltersAsMap(){
    let map = new Map<string,Map<string,boolean>|null>()

    let map_ID_INSTANCES = new Map<string,boolean>()
    map_ID_INSTANCES.set('i0',true)
    map_ID_INSTANCES.set('i1',true)

    let map_ID_ROYAUMES = new Map<string,boolean>()
    map_ID_ROYAUMES.set('l0r0',true)
    map_ID_ROYAUMES.set('l0r1',true)
    map_ID_ROYAUMES.set('l1r0',true)
    map_ID_ROYAUMES.set('l1r1',true)

    let map_ID_PROTOCOLES = new Map<string,boolean>()
    map_ID_PROTOCOLES.set('saml',true)
    map_ID_PROTOCOLES.set('open',true)

    let map_ID_ENVS = new Map<string,boolean>()
    map_ID_ENVS.set('dev',true)
    map_ID_ENVS.set('recette',true)
    map_ID_ENVS.set('preproduction',true)
    map_ID_ENVS.set('prod',true)

    map.set(SearchEngine.ID_INSTANCES,map_ID_INSTANCES)
    map.set(SearchEngine.ID_ROYAUMES,map_ID_ROYAUMES)
    map.set(SearchEngine.ID_PROTOCOLES,map_ID_PROTOCOLES)
    map.set(SearchEngine.ID_ENVS, map_ID_ENVS)

    return map
}