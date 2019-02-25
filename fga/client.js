import fetch from 'node-fetch';
import { parse as parseContentType } from 'content-type';

var options = {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: '{"client_id":"wJpivGSqy80UiFd9lY06rAEzy1ReXLtP","client_secret":"moobqagbQKRt2Z6xTXOc_HYDuGFR2ttc1v0Sxv63IiVj0yyqoEcGFH3PgFHCX2Nt","audience":"https://api.fga.run","grant_type":"client_credentials"}'
};

async function refreshToken(ctx) {
    ctx.auth = await (await fetch('https://login.fga.run/oauth/token', options)).json();
    console.log(ctx.auth.access_token)
}

const contentTypeOf = (res, defaultValue) => {
  const headerValue = res.headers.get('content-type');
  if (!headerValue) {
    return defaultValue;
  }
  return parseContentType(headerValue).type;
};


async function handleBody(res) {
    switch (contentTypeOf(res, "")) {
        case 'application/json': return await res.json();
        default: return res.text();
    }
}

export async function projectPost(ctx, path, body) {

    const url = `https://api.fga.run/projects/${ctx.projectName}/${path}`;

    console.log(url);

    const res = await fetch(
        url,
        {
            method: 'POST',
            body: JSON.stringify(body),
            headers: {
                'content-type': 'application/json',
                'authorization': `Bearer ${ctx.auth.access_token}`
            }
        }
    );

    const responseBody = await handleBody(res);

    return { 
        status: res.status,
        body: responseBody
    };

}


export async function paths(ctx, opts) {
    const res = (await projectPost(ctx, 'query:paths', opts));
    if (res.status >= 300) {
        throw new Error(`unexpected HTTP ${res.status} response from FGA path query: ${res.body}`);
    }
    return res.body;
}

export async function deduce(ctx, opts) {
    const res = (await projectPost(ctx, 'deduce:simple', opts));
    if (res.status >= 300) {
        throw new Error(`unexpected HTTP ${res.status} response from FGA simple decuce: ${res.body}`);
    }
    return res.body;
}

export function createClient(ctx) {
    // refreshToken(ctx);
    return {
        paths:  (opts) => paths(ctx, opts),
        deduce: (opts) => deduce(ctx, opts),
    };
}