

export class AppError extends Error {

    constructor(statusCode, ...args) {
        super(...args);
        this.statusCode = statusCode;
    }

    sendError(res) {
        res.status(this.statusCode);
        res.contentType("application/json");
        res.send({ 
            error: { 
                message: this.message
            }
        });
    }

}

export class AuthorizationError extends AppError {

    constructor(...args) {
        super(401, ...args);
    }

}



export const sendError = (res, defaultStatus = 500, defaultMessage = "unspecified error") => (err) => {
    if (err instanceof AppError) {
        return err.sendError(res);
    }
    console.warn("unexpected error", err);
    res.status(defaultStatus);
    res.contentType("application/json");
    res.send({ error: { message: defaultMessage } });
};
