const express = require("express")
const router = express.Router()
const catchAsync = require('../utils/catchAsync')
const Campground = require('../models/campground');
const { isLoggedIn, isAuthor, validateCampground } = require('../middleware')
const campgrounds = require('../controllers/campground')
const multer = require('multer');
const { register } = require("../controllers/user");
const { storage } = require('../cloudinary/index')
const upload = multer({ storage });





//All of the campgrounds.index, campgrounds.renderNewForm etc.... is stored in the controllers folder under campground
//catchAsync function is stored under utils folder
//isLoggedIn, validateCampground, isAuthor is under middleware.js file in root directory
router.get('/', catchAsync(campgrounds.index));




router.post('/', isLoggedIn, upload.array('image'), validateCampground, catchAsync(campgrounds.newCamp));

router.get('/new', isLoggedIn, campgrounds.renderNewForm)

router.get('/:id', catchAsync(campgrounds.showCamp));

router.get('/:id/edit', isLoggedIn, isAuthor, catchAsync(campgrounds.editCampGet));

router.put('/:id', isLoggedIn, isAuthor, upload.array('image'), validateCampground, catchAsync(campgrounds.updateCampPut));

router.delete('/:id', isLoggedIn, isAuthor, catchAsync(campgrounds.deleteCampDelete));


module.exports = router;