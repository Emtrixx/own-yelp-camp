const User = require('../models/user');

module.exports.getRegister = (req,res) => {
    res.render('users/register');
}

module.exports.getLogin = (req,res) => {
    res.render('users/login');
}

module.exports.create = async(req,res,next) => {
    try{
        const { username, email, password } = req.body;
        const user = new User({ username, email });
        const regUser = await User.register(user, password);
        req.login(regUser, err => {
            if(err) return next(err);
            req.flash('success', 'Welcome to Yelp-Camp!');
            res.redirect('/campgrounds');
        })
    } catch(e) {
        req.flash('error', e.message);
        return res.redirect('/register');
    }
}

module.exports.login = (req,res) => {
    const redirectUrl = req.session.returnTo || "/campgrounds";
    delete req.session.returnTo;
    req.flash('success', 'Welcome Back!');
    res.redirect(redirectUrl);
}

module.exports.logout = (req,res) => {
    req.logout();
    req.flash('success','Successfully logged out!');
    res.redirect('/campgrounds');
}