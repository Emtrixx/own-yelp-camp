const { schema } = require("../models/campground.js");
const Campground = require("../models/campground.js");

module.exports = schema => {
    return async (req, res, next) => {
        const { id, reviewId } = req.params;
        let data;
        if(reviewId) {
            data = await schema.findById(reviewId);
        } else {
            data = await schema.findById(id);
        }
        if (!data.author.equals(req.user._id)) {
            req.flash('error', "You don't have permission to do that!");
            return res.redirect("/campgrounds/" + id);
        }
        next()
    }
}