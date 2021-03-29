const express = require('express');
const router = express.Router();
const users = require("../controllers/users");
const asyncWrapper = require('../utils/asyncWrapper');
const passport = require('passport');

router.route('/register')
    .get( users.getRegister)
    .post( asyncWrapper(users.create));

router.route('/login')
    .get( users.getLogin)
    .post( passport.authenticate('local', {failureFlash: true, failureRedirect: '/login'}), users.login)

router.get('/logout', users.logout)

module.exports = router;