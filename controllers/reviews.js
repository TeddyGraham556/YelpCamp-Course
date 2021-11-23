const Campground = require('../models/campground');
const Review = require('../models/review');




module.exports.reviewPost = async (req, res) => {
    const campground = await Campground.findById(req.params.id);
    const review = new Review(req.body.review)
    review.author = req.user._id
    campground.reviews.push(review);
    await review.save();
    await campground.save();
    req.flash('success', 'Created new review')
    res.redirect(`/campgrounds/${campground._id}`);
}

module.exports.reviewDelete = async (req, res) => {
    const { id, reviewId } = req.params;
    //We are using the $pull operator to find review id and update. 
    //lookuo $pull functionality for more info
    await Campground.findByIdAndUpdate(id, { $pull: { reviews: reviewId } })
    await Review.findByIdAndDelete(reviewId);
    req.flash('success', 'Successfully deleted review')
    res.redirect(`/campgrounds/${id}`)
}