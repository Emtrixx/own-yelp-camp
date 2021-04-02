const Campground = require("../models/campground.js");
const {cloudinary} = require('../cloudinary');
const mbxGeocoding = require('@mapbox/mapbox-sdk/services/geocoding');
const mbxToken = process.env.MAPBOX_TOKEN;
const geocoder = mbxGeocoding({ accessToken : mbxToken });

module.exports.index = async (req, res) => {
    const campgrounds = await Campground.find();
    res.render("campgrounds/index", { campgrounds });
}

module.exports.createNew = async (req, res) => {
    const geoData = await geocoder.forwardGeocode({
        query: req.body.campground.location,
        limit: 1
    }).send()
    const newCamp = new Campground(req.body.campground);
    newCamp.geometry = geoData.body.features[0].geometry;
    newCamp.images = req.files.map(f => ({ url: f.path, filename: f.filename }));
    newCamp.author = req.user.id;
    await newCamp.save();
    req.flash('success', 'Successfully made a new campground!');
    res.redirect("/campgrounds/" + newCamp.id)
}

module.exports.show = async (req, res) => {
    const campground = await Campground.findById(req.params.id).populate({
        path: 'reviews',
        populate: {
            path: 'author'
        }
    }).populate('author');
    if (!campground) {
        req.flash('error', 'Could not find campground!');
        return res.redirect('/campgrounds');
    }
    res.render("campgrounds/show", { campground })
}

module.exports.update = async (req, res) => {
    const { id } = req.params;
    const campground = await Campground.findByIdAndUpdate(id, { ...req.body.campground })
    campground.images.push(...req.files.map(f => ({ url: f.path, filename: f.filename })));
    if(req.body.deleteImages){
        for(let filename of req.body.deleteImages) {
            await cloudinary.uploader.destroy(filename);
        }
        await campground.updateOne({ $pull: { images: { filename: { $in: req.body.deleteImages } } } });
    }
    const geoData = await geocoder.forwardGeocode({
        query: req.body.campground.location,
        limit: 1
    }).send()
    campground.geometry = geoData.body.features[0].geometry;
    await campground.save();
    req.flash('success', 'Sucessfully updated campground!');
    res.redirect("/campgrounds/" + id);
}

module.exports.delete = async (req, res) => {
    await Campground.findByIdAndDelete(req.params.id);
    req.flash('success', 'Sucessfully deleted campground!');
    res.redirect("/campgrounds");
}

module.exports.getEditForm = async (req, res) => {
    const campground = await Campground.findById(req.params.id);
    if (!campground) {
        req.flash('error', 'Could not find campground!');
        return res.redirect('/campgrounds');
    }
    res.render("campgrounds/edit", { campground })
}