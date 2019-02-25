'use strict';

import { AuthorizationError } from '../errors.js';

export async function listObjects(fga, subject, predicate, objectType) {

    const matches = await fga.deduce({
        subject:   { id: subject},
        predicate: { subPropertyOf: predicate },
        object:    { subClassOf: objectType }
    });

    console.log(matches);

    return matches.flatMap(match => Object.keys(match).filter(key => key !== 'id').map(key => match[key]))

}

export async function hasPermission(fga, subject, predicate, objectType) {

    const matches = await fga.deduce({
        subject:   { id: subject},
        predicate: { subPropertyOf: predicate },
        object:    { id: objectType }
    });

    return matches.length > 0;

}

/**
 * returns an async function which verifies the specified partyId has the requested predicate on the object.
 */

export const verifyPermission = (fga, predicate, object) =>

    async ({ partyId }) => {

        const authzResult = await hasPermission(fga, partyId, predicate, object);

        if (authzResult !== true)
            throw new AuthorizationError("authorization failed");

        return {
            hasPermission: authzResult,
            partyId
        }

    };
