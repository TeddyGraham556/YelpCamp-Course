const Campground = require('../models/campground');
const mbxGeocoding = require('@mapbox/mapbox-sdk/services/geocoding');
const mapBoxToken = process.env.MAPBOX_TOKEN;
const geocoder = mbxGeocoding({ accessToken: mapBoxToken });
const { cloudinary } = require('../cloudinary');

module.exports.index = async (req, res) => {
    const campgrounds = await Campground.find({});
    res.render("campground/index", { campgrounds })
};


module.exports.renderNewForm = (req, res) => {
    res.render('campground/new')
}

module.exports.newCamp = async (req, res, next) => {
    const geoData = await geocoder.forwardGeocode({
        query: req.body.campground.location,
        limit: 1,
    }).send()
    const campground = new Campground(req.body.campground);
    campground.geometry = geoData.body.features[0].geometry
    campground.images = req.files.map(f => ({ url: f.path, filename: f.filename }))
    campground.author = req.user._id
    //console.log(images)
    await campground.save();
    // console.log(campground.geometry)
    //console.log(campground)
    req.flash('success', 'Successfully made a new campground')
    res.redirect(`/campgrounds/${campground._id}`)
}

module.exports.showCamp = async (req, res) => {
    //Nested .populate
    //First populating the review associated with the author
    //The last .populate('author') populates the one author
    const campground = await Campground.findById(req.params.id).populate({
        path: 'reviews',
        populate: {
            path: 'author',
        }
    }).populate('author');

    if (!campground) {
        req.flash('error', 'Cannot find this campground')
        return res.redirect('/campgrounds')
    }
    res.render('campground/show', { campground });
}


module.exports.editCampGet = async (req, res) => {
    const { id } = req.params;
    const campground = await Campground.findById(id)
    if (!campground) {
        req.flash('error', 'Cannot find this campground to edit!')
        return res.redirect('/campgrounds')
    }
    res.render('campground/edit', { campground });
}







module.exports.updateCampPut = async (req, res) => {
    const geoData = await geocoder.forwardGeocode({
        query: req.body.campground.location,
        limit: 1,
    }).send()
    const { id } = req.params;
    const campground = await Campground.findByIdAndUpdate(id, { ...req.body.campground })
    const imgs = req.files.map(f => ({ url: f.path, filename: f.filename }))
    campground.geometry = geoData.body.features[0].geometry

    // we can just push an array onto another array *this will just add the array*
    // we use the spread operator "..." to add the items in the array to the existing array
    campground.images.push(...imgs)

    if (req.body.deleteImages) {
        for (let filename of req.body.deleteImages) {
            await cloudinary.uploader.destroy(filename)
        }
        await campground.updateOne({ $pull: { images: { filename: { $in: req.body.deleteImages } } } })
    }

    await campground.save()
    console.log(campground.geometry)
    req.flash('success', 'Successfully updated campground')
    res.redirect(`/campgrounds/${campground._id}`)
}











module.exports.deleteCampDelete = async (req, res) => {
    const { id } = req.params;
    await Campground.findByIdAndDelete(id);
    req.flash('success', 'Successfully deleted Campground!!!!!!!!!!!!!')
    res.redirect('/campgrounds')
}