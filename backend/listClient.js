'use strict';

import { backendGet, paginate, clampRange, skipFirst, maxItems, filterItems } from './utils.js';
import { listObjects } from '../fga/deduce.js';


// generates a function which returns the specified page number, always size 100 for us. we adapt
// the client pages as needed.
const fetchClientsPage = (req, backend) => 
    (pageNumber) => backendGet(req, backend, `api/v2/clients?per_page=100&page=${pageNumber}&include_totals=true`);


/**
 * returns a list of the clients which this viewer is allowed to view.
 * 
 * the backend returns pagenated responses, and many may not be visible to
 * the viewer, so we need to continue to fetch from the backend to adjust
 * the pagenated results.
 * 
 * while fetching, we merge each discovered client with FGA facts, to ensure
 * any created or modified outside of the HTTP gateway are synchronized. this
 * is not be ideal when there is a large query to change ratio, so can be
 * disabled and rely only on manual synchronization somehow.
 * 
 */

export default (fga, backend, clientId) => 
    async (req, {partyId}) => {

        // page number to fetch, min is 0.
        const page = Math.max(0, ('page' in req.query) ? parseInt(req.page) : 0);

        // number per page to fetch, default to 50 max 100.
        const per_page = clampRange(1, 100)(('per_page' in req.query) ? parseInt(req.per_page) : 50);

        // fetch the IDs of the Client resources which the viewer is allowed to view.
        const allowedToView = await listObjects(fga, partyId, "canView", "Client");

        // fetch the clients from the Auth0 backend.
        const results = [];

        // skip over the first amount to skip
        const iterator = maxItems(per_page)(
            skipFirst((page * per_page))(
                // only include clients which the viewer has permission to access.
                filterItems(client => allowedToView.includes(client.id))(
                    // source of the clients from the backend.
                    paginate(fetchClientsPage(req, backend))
                )
            )
        );

        for await (const client of iterator) {
            results.push(client);
        }

        return {
            status: 200,
            body: results
        }

    }


