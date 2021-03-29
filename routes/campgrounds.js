const Express = require('express');
const router = Express.Router();
const Campground = require("../models/campground.js");
const campgrounds = require("../controllers/campgrounds");
const asyncWrapper = require('../utils/asyncWrapper');
const { campgroundSchema } = require('../schemas');
const { validateData } = require("../utils/validateData");
const { isLoggedIn } = require('../utils/isLoggedIn');
const isAuthor = require('../utils/isAuthor');
const multer  = require('multer')
const { storage } = require('../cloudinary/index');
const upload = multer({ storage })

router.route('/')
    .get( asyncWrapper(campgrounds.index))
    .post( isLoggedIn, upload.array("image"), validateData(campgroundSchema), asyncWrapper(campgrounds.createNew))

router.get("/new", isLoggedIn, (req,res) => {
    res.render("campgrounds/new");
})
router.route("/:id")
    .get( asyncWrapper(campgrounds.show))
    .put( isLoggedIn, isAuthor(Campground), upload.array("image"), validateData(campgroundSchema), asyncWrapper(campgrounds.update))
    .delete( isLoggedIn, asyncWrapper(campgrounds.delete))

router.get("/:id/edit", isLoggedIn, isAuthor(Campground), asyncWrapper(campgrounds.getEditForm))

module.exports = router;