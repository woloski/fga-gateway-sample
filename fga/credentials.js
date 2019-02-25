
/**
 * extracts and verifies the token or credential provided in the incoming request, returning
 * the FGA party ID which will be used to authorize permissions.
 * 
 * if authorization fails, then an exception should be thrown.
 * 
 * @param {*} req 
 */

export async function validateClientCredentials(req) {    
    return {
        partyId: 'alice'
    };
}