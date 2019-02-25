'use strict';

export default (fga, backend) => 
    async (partyId) => {
        return {
            status: 200,
            body: {
                operation: 'createClient',
                partyId,
            }
        }
    };
