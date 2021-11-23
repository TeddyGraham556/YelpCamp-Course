if (process.env.NODE_ENV !== "production") {
  require("dotenv").config();
}

const express = require("express");
const mongoose = require("mongoose");
const methodOverride = require("method-override");
const ejsMate = require("ejs-mate");
const catchAsync = require("./utils/catchAsync");
const ExpressError = require("./utils/ExpressError");
const session = require("express-session");
const path = require("path");
const flash = require("connect-flash");
const mongoSanitize = require("express-mongo-sanitize");
const MongoStore = require("connect-mongo");
const LocalStrategy = require("passport-local");
const User = require("./models/user");

const userRoutes = require("./routes/user");
const campgroundsRoutes = require("./routes/campgroundRoutes");
const reviewsRoutes = require("./routes/reviews");

const passport = require("passport");
//const MongoStore = require('connect-mongo');

//********************************************************
// ******* Start Mongo DB Connection *******
//********************************************************
const dbUrl = process.env.DB_URL || "mongodb://localhost:27017/yelp-camp";
//"mongodb://localhost:27017/yelp-camp"
//connect to mongo db
mongoose.connect(dbUrl, {
  useNewUrlParser: true,
  //useCreateIndex: true,
  useUnifiedTopology: true,
});

//Error handeling on the mongo db
const db = mongoose.connection;
db.on("error", console.error.bind(console, "connection error:"));
db.once("open", () => {
  console.log("Database connected");
});
//********************************************************
// ******* End Mongo DB Connection *******
//********************************************************

const app = express();
app.engine("ejs", ejsMate);
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

//This line allows us to see data in the browser
//We can pull in data from mongo and view data this way
app.use(express.urlencoded({ extended: true }));
app.use(methodOverride("_method"));
app.use(express.static(path.join(__dirname, "public")));
app.use(
  mongoSanitize({
    replaceWith: "_",
  })
);

// const store = MongoStore.create({
//     url: dbUrl,
//     secret: 'thisshouldbeabettersecret',
//     touchAfter: 14 * 60 * 60
// })

const secret = process.env.SECRET || "thisshouldbeabettersecret";

const store = MongoStore.create({
  mongoUrl: dbUrl,
  touchAfter: 24 * 60 * 60,
  secret,
  // crypto: {
  //     secret: 'squirrel'
  // }
});

//Setting values such as secret,resave and saveUninitialized will get rid of the Deprecated message in the console
//We set expires in date now and that it expires in one week from today and max age is the maximum it can be set to. No longer than one year.
//httpOnly keeps data being revieled to 3rd party *Security*
store.on("error", function (e) {
  console.log("Session Store Error:", e);
});

const sessionConfig = {
  //setting this to session so it's not easier for a hacker to write a script to find the session ID this in the developer tools
  store,
  name: "session",
  secret,
  resave: false,
  saveUninitialized: true,
  cookie: {
    httpOnly: true,
    //secure: true,
    expires: Date.now() + 1000 * 60 * 60 * 24 * 7,
    maxAge: 1000 * 60 * 60 * 24 * 7,
  },
};

// app.use(session({
//     secret: 'foo',
//     store: MongoStore.create(options)
// }));

app.use(session(sessionConfig));
app.use(flash());

app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));

passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.use((req, res, next) => {
  res.locals.currentUser = req.user;
  res.locals.success = req.flash("success");
  res.locals.error = req.flash("error");
  next();
});

app.use("/", userRoutes);
app.use("/campgrounds", campgroundsRoutes);
app.use("/campgrounds/:id/reviews", reviewsRoutes);

app.get("/", (req, res) => {
  res.render("home");
});

app.all("*", (req, res, next) => {
  next(new ExpressError("Page Was Not Found!!", 404));
  console.log(res);
});

//Adding this got rid of the following error:
//Cast to ObjectId failed for value "n" (type string) at path "_id" for model "campground"
//Why would that make a difference?
app.use((err, req, res, next) => {
  const { statusCode = 500 } = err;
  if (!err.message) err.message = "Oh No, Something Went Wrong!";
  res.status(statusCode).render("error", { err });
});

//The port is automatically added from Heroku
const port = process.env.PORT || 8080;
app.listen(port, () => {
  console.log(`Listening on ${port}`);
});
