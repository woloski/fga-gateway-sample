'use strict';

import express from 'express';
import compression from 'compression';

import { validateClientCredentials } from './fga/credentials.js';
import { createClient as createFgaContext } from './fga/client.js';
import { verifyPermission } from './fga/deduce.js';
import { listClient, createClient, viewClient, updateClient, deleteClient } from './backend.js';
import { sendError } from './errors.js';
import forwardRequest from './forwardRequest.js';

import config from './config.js';

const app = express()
const port = config.port;

app.use(compression());


const backend = { ...config.backend };
const fga = createFgaContext({ ...config.fga });


//// frontend client path bindings.

app.get('/clients', 
    (req, res) => validateClientCredentials(req)
        .then(forwardRequest(req, res, listClient(fga, backend)))
        .catch(sendError(res))
);

app.post('/clients', 
    (req, res) => validateClientCredentials(req)
        .then(verifyPermission(fga, "canAdd", "Client"))
        .then(forwardRequest(req, res, createClient(fga, backend)))
        .catch(sendError(res))
);

app.get('/clients/:clientId', 
    (req, res) => validateClientCredentials(req)
        .then(verifyPermission(fga, "canView", req.params.clientId))
        .then(forwardRequest(req, res, viewClient(fga, backend, req.params.clientId)))
        .catch(sendError(res))
);

app.put('/clients/:clientId', 
    (req, res) => validateClientCredentials(req)
        .then(verifyPermission(fga, "canModify", req.params.clientId))
        .then(forwardRequest(req, res, updateClient(fga, backend, req.params.clientId)))
        .catch(sendError(res))
);

app.delete('/clients/:clientId', 
    (req, res) => validateClientCredentials(req)
        .then(verifyPermission(fga, "canDelete", req.params.clientId))
        .then(forwardRequest(req, res, deleteClient(fga, backend, req.params.clientId)))
        .catch(sendError(res))
);

app.get('*', (req, res) => {
    res.status(404);
    res.send();
});

app.listen(port, () => console.log(`demo fga gateway listening on port ${port}!`))

