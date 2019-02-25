import { sendError } from './errors.js';

/**
 * forward a preauthorized request to the real backend with our escalated permissions.
 * 
 * apply any response handlers which may be needed to update fga.
 * 
 */

export default (req, res, dispatcher) =>
    async (...args) => {
        try {
            const answer = await dispatcher(req, ...args);
            res.status(answer.status);
            res.send(answer.body);
        }
        catch (e) {
            console.log("error", e.message);
            sendError(res)(e);
        }
    }

