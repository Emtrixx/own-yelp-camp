const ExpressError = require('./ExpressError')

module.exports.validateData = schema => {
    return function (req,res,next) {
        const { error } = schema.validate(req.body);
        if (error) {
            const msg = error.details.map(err => err.message).join(',');
            throw new ExpressError(msg,400);
        } else {
            next();
        }
    }
}
