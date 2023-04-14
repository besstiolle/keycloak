import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { parseLog } from '../routes/HydratationUtils';

describe('test Uploading fonctions', () => {
 
    it('must parsing log"', () => {
        
        let log = [
            "commit a98752bb7175b07b693273e45c90f41fc55a9857",
            "Author: LEGAVE Francoise <francoise.legave@groupama.com>",
            "",
            "    Creation GauthiqID saml: muthavas"
        ]
        
        let authorExpected = ["LEGAVE Francoise", "francoise.legave@groupama.com"]
        let messageExpected = "Creation GauthiqID saml: muthavas"
        let hashExpected = "a98752bb7175b07b693273e45c90f41fc55a9857"
          
        let result = parseLog(log)

        expect(result.author[0]).toBe(authorExpected[0])
        expect(result.author[1]).toBe(authorExpected[1])
        expect(result.message).toBe(messageExpected)
        expect(result.hash).toBe(hashExpected)

    }) 

    it('must parsing log with merge message"', () => {

    let log = ["commit b6024ded0b9e23baf42daa44d996e8e9aef4be17",
            "Merge: bb06cd6 2fd61a5",
            "Author: HELBERT Vincent <vincent.helbert@groupama.com>",
            "",
            "    Merge branch 'feature/societaire_dev2' into 'gitlab_clientid'",
        ]
        
        let authorExpected = ["HELBERT Vincent", "vincent.helbert@groupama.com"]
        let messageExpected = "Merge branch 'feature/societaire_dev2' into 'gitlab_clientid'"
        let hashExpected = "b6024ded0b9e23baf42daa44d996e8e9aef4be17"
          
        let result = parseLog(log)

        expect(result.author[0]).toBe(authorExpected[0])
        expect(result.author[1]).toBe(authorExpected[1])
        expect(result.message).toBe(messageExpected)
        expect(result.hash).toBe(hashExpected)
    }) 
})