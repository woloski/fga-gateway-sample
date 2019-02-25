'use strict';


export default (fga, backend, clientId) => 
    async (partyId) => {
        return {
            status: 200,
            body: {
                operation: 'updateClient',
                partyId,
                clientId,
            }
        }
    };    
