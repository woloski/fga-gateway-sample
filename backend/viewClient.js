'use strict';

import { backendGet } from './utils.js';

export default (fga, backend, clientId) => 
    async (req, partyId) => backendGet(req, backend, `api/v2/clients/${clientId}`);
