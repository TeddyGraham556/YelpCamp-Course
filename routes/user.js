const express = require('express')
const router = express.Router();
const catchAsync = require('../utils/catchAsync')
const user = require('../controllers/user')
const passport = require('passport')




router.get('/register', user.register)

router.post('/register', catchAsync(user.registerPost))

router.get('/login', user.login)

router.post('/login', passport.authenticate('local', { failureFlash: true, failureRedirect: '/login' }), user.loginPost)

router.get('/logout', user.logout)

module.exports = router;