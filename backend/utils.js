'use strict';

import fetch from 'node-fetch';

export async function backendGet(req, backend, path) {
    const url = `${backend.location}/${path}`;
    const res = await fetch(
        url,
        { 
            headers: { 
                Accept: 'application/json',
                'X-Forwarded-For': req.connection.remoteAddress,
                Authorization: `Bearer ${backend.auth.access_token}`,
                'User-Agent': req.headers['user-agent'],
            }
        }
    );
    return {
        status: res.status,
        body: await res.json()
    }
}


export async function * fetchIterable(initialState, nextGenerator) {
    let [ state, next ] = nextGenerator(initialState, null);
    while (next) {
        const response = await next;
        yield response;
        const more = nextGenerator(state, response);
        if (!more) {
            break;
        }
        [ state, next ] = more;
    }
}

export async function * paginate(nextGenerator) {


    // fetch the clients from the Auth0 backend.
    const pages = fetchIterable(
        0, 
        (currentPage, prev) => currentPage > 4 ? null : [ currentPage + 1, nextGenerator(currentPage) ]);

    for await (const { status, body } of pages) {

        if (status != 200) {
            throw new AppError(500, "backend error");
        }

        if ((!('clients' in body)) || (!(Array.isArray(body.clients))) || body.clients.length == 0) {
            return;
        }

        for (const client of body.clients) {
            yield client;
        }

        if (body.start + body.limit > body.total) {
            // no point in tyrying more.
            return;
        }

    }
            
}



export const clampRange = (min, max) => (value) => Math.min(Math.max(value, min), max);

// generator which skips over items. we can't actually skip on the backend as we need to filter them
// to see which the viewer would see.
export const skipFirst = (skip) => 
    async function * (generator) {
        let retrieved = 0;
        for await (const item of generator) {
            if (++retrieved > skip) {
                yield item;
            }
        }
    };

// generator which skips over items. we can't actually skip on the backend as we need to filter them
// to see which the viewer would see.
export const maxItems = (limit) => 
    async function * (generator) {
        let retrieved = 0;
        for await (const item of generator) {
            yield item;
            if (++retrieved > limit) {
                return;
            }
        }
    };    

// filters out any items not matching.
export const filterItems = (predicate) => 
    async function * (generator) {
        for await (const item of generator) {
            if (predicate(item)) {
                yield item;
            }
        }
    };