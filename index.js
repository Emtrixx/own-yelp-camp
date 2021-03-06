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
const mongoSanitize = require('express-mongo-sanitize');
const helmet = require('helmet');

const campgroundRoutes = require('./routes/campgrounds');
const reviewRoutes = require('./routes/reviews');
const userRoutes = require('./routes/users');

const passport = require("passport");
const LocalStrategy = require('passport-local');
const User = require('./models/user');

const MongoStore = require('connect-mongo');

//const dbUrl = process.env.DB_URL;
const dbUrl = process.env.DB_URL || "mongodb://localhost:27017/yelp-camp"
mongoose.connect(dbUrl, { 
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
app.use(mongoSanitize({
    replaceWith: '_'
  }))
app.use(helmet());

const scriptSrcUrls = [
    "https://stackpath.bootstrapcdn.com/",
    "https://api.tiles.mapbox.com/",
    "https://api.mapbox.com/",
    "https://kit.fontawesome.com/",
    "https://cdnjs.cloudflare.com/",
    "https://cdn.jsdelivr.net",
];
const styleSrcUrls = [
    "https://kit-free.fontawesome.com/",
    "https://stackpath.bootstrapcdn.com/",
    "https://api.mapbox.com/",
    "https://api.tiles.mapbox.com/",
    "https://fonts.googleapis.com/",
    "https://use.fontawesome.com/",
];
const connectSrcUrls = [
    "https://api.mapbox.com/",
    "https://a.tiles.mapbox.com/",
    "https://b.tiles.mapbox.com/",
    "https://events.mapbox.com/",
];
const fontSrcUrls = [];
app.use(
    helmet.contentSecurityPolicy({
        directives: {
            defaultSrc: [],
            connectSrc: ["'self'", ...connectSrcUrls],
            scriptSrc: ["'unsafe-inline'", "'self'", ...scriptSrcUrls],
            styleSrc: ["'self'", "'unsafe-inline'", ...styleSrcUrls],
            workerSrc: ["'self'", "blob:"],
            objectSrc: [],
            imgSrc: [
                "'self'",
                "blob:",
                "data:",
                `https://res.cloudinary.com/${process.env.CLOUDINARY_CLOUD_NAME}/`, //SHOULD MATCH YOUR CLOUDINARY ACCOUNT! 
                "https://images.unsplash.com/",
            ],
            fontSrc: ["'self'", ...fontSrcUrls],
        },
    })
);

const secret = process.env.SECRET || "developmentsecret"

const store = MongoStore.create({
    mongoUrl: dbUrl,
    touchAfter: 24 * 60 * 60,
    crypto: {
        secret: secret
    }
});

store.on('error', function(e) {
    console.log('Session Store ERROR', e)
})

const sessionConfig = {
    store,
    name: 'session',
    secret: secret,
    resave: false,
    saveUninitialized: true,
    cookie: {
        httpOnly: true,
        // secure: true,
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


const port = process.env.PORT || 3000
app.listen(port, () => {
    console.log("Server started on port "+port);
})