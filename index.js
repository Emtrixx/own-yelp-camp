if(process.env.NODE_ENV !== "production") {
    require('dotenv').config();
}

const express = require("express");
const app = express();
const mongoose = require("mongoose");
const session = require('express-session');
const flash = require('connect-flash');
const path = require("path");
const methodOverride = require("method-override");
const ejsMate = require("ejs-mate");
const ExpressError = require('./utils/ExpressError');

const campgroundRoutes = require('./routes/campgrounds');
const reviewRoutes = require('./routes/reviews');
const userRoutes = require('./routes/users');

const passport = require("passport");
const LocalStrategy = require('passport-local');
const User = require('./models/user');

mongoose.connect("mongodb://localhost:27017/yelp-camp", { 
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useFindAndModify: false,
    useCreateIndex: true
})
    .then(() => {
        console.log("Connected to mongodb");
    }).catch(() => {
        console.log("ERROR - Could not connect to mongodb");
    })

app.engine('ejs', ejsMate);
app.set("views", path.join(__dirname,"views"));
app.set("view engine","ejs");

app.use(express.static(__dirname+"/public"));
app.use(methodOverride("_method"));
app.use(express.urlencoded({extended: true}));
app.use(express.json());

const sessionConfig = {
    secret: 'secretKey',
    resave: false,
    saveUninitialized: true,
    cookie: {
        expires: Date.now() + 1000 * 60 * 60 * 24 * 7,
        maxAge: 1000 * 60 * 60 * 24 * 7
    }
}
app.use(session(sessionConfig));
app.use(flash());

app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());


app.use((req, res, next) => {
    res.locals.currentUser = req.user;
    res.locals.success = req.flash('success');
    res.locals.error = req.flash('error');
    next();
})

app.use('/', userRoutes);
app.use('/campgrounds', campgroundRoutes);
app.use('/campgrounds/:id/reviews', reviewRoutes);

app.get("/", (req,res) => {
    res.render("home")
})

app.all('*', (req,res,next) => {
    // res.status(404).render("notFound");
    next(new ExpressError('Not Found', 404));
})

app.use((err,req,res,next) => {
    const { message = 'Something went wrong', statusCode = 500, stack} = err;
    res.status(statusCode).render('error', {message, stack});
})

app.listen("3000", () => {
    console.log("Listening to 3000");
})