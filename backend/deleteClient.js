'use strict';

export default (fga, backend, clientId) => 
    async (partyId) => {
        return {
            status: 200,
            body: {
                operation: 'deleteClient',
                partyId,
                clientId,
            }
        }
    };