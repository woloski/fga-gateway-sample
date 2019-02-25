
const AUTH0_TOKEN = '...';
const FGA_TOKEN = '...';

export default {

    /**
     * port that the HTTP gateway listens on.
     */

    port: 3000,

    /**
     * configuration for backend requests that are forwarded to auth0 management API once the
     * incoming request has been authorized against FGA.
     */

    backend: {
        location: 'https://zourzouvillys.auth0.com',
        auth: {
            access_token: AUTH0_TOKEN,
        }
    },

    /** 
     * configuration for authenticating requests from clients.
     */

    client: {

        /** 
         * the issuers that we we trust for client requests. the subject is taken from this and used as the
         * principal in FGA.
         */

        trusted_issuers: [ 'https://login.fga.run' ],

        /**
         * the audience required in a bearer token.
         */

        audience: 'https://api.fga.run',

    },

    /**
     * configuration for communicating with FGA to authorize requests, query, and
     * update facts.
     */

    fga: { 
        projectName: 'my-test-project', 
        auth: {
            access_token: FGA_TOKEN
        }
    }

}