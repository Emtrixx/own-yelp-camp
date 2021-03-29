const express = require('express');
const router = express.Router({ mergeParams: true });
const Review = require("../models/review");
const reviews = require("../controllers/reviews");
const asyncWrapper = require('../utils/asyncWrapper');
const { reviewSchema } = require('../schemas');
const { validateData } = require("../utils/validateData");
const { isLoggedIn } = require('../utils/isLoggedIn');
const isAuthor = require('../utils/isAuthor');

router.post('/', isLoggedIn, validateData(reviewSchema), asyncWrapper(reviews.create))

router.delete('/:reviewId', isLoggedIn, isAuthor(Review), asyncWrapper(reviews.delete))

module.exports = router;