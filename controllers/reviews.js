const Review = require("../models/review");
const Campground = require("../models/campground.js");

module.exports.create = async(req,res) => {
    const { id } = req.params;
    const campground = await Campground.findById(id);
    const review = new Review(req.body.review);
    review.author = req.user.id;
    await review.save();
    campground.reviews.push(review);
    await campground.save();
    req.flash('success','Sucessfully posted review!');
    res.redirect(`/campgrounds/${id}`);
}

module.exports.delete = async(req,res) => {
    const { id, reviewId } = req.params;
    await Campground.findByIdAndUpdate(id,{$pull:{reviews: reviewId}});
    await Review.findByIdAndDelete(reviewId);
    req.flash('success','Sucessfully deleted review!')
    res.redirect('/campgrounds/'+id);
}