export class ErreurMetier extends Error{

    constructor(message, statusCode = 400) {
        super(message);
        this.name = "ErreurMetier";
        this.statusCode = statusCode;
        this.isErreurMetier = true;

        Error.captureStackTrace(this, this.constructor);
    };
};