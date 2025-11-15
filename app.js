const express = require('express');
const app = express();
const mongoose = require('mongoose');
const path = require('path');
const ejsMate = require('ejs-mate');
const methodOverride = require('method-override');
const ExpessError = require('./utils/ExpessError.js');
const session = require("express-session");
const flash = require("connect-flash");
const listingRouter = require('./router/listing.js');
const reviewRouter = require('./router/review.js');
const userRouter = require('./router/user.js');
const passport = require('passport');
const LocalStrategy = require('passport-local');
const User = require('./models/user.js');
const MongoStore = require('connect-mongo');



/* ------------------ Middleware ------------------ */
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));
app.use(methodOverride('_method'));

app.engine('ejs', ejsMate);
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

/* ------------------ MongoDB Connection ------------------ */

if (process.env.NODE_ENV !== "production") {
  require('dotenv').config();
}

const MONGO_URL = process.env.ATLASDB_URL;

mongoose.connect(MONGO_URL, {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
  .then(() => console.log("✅ Connected to MongoDB"))
  .catch((err) => console.error("❌ Error connecting to MongoDB:", err));

/* ------------------ Passport + Flash + Session ------------------ */

const store = MongoStore.create({
  mongoUrl: MONGO_URL,
  crypto: {
    secret: process.env.SECRET_KEY,
  },
  touchAfter: 24 * 60 * 60 // time period in seconds
});

store.on("error", function (e) { {
  console.log("SESSION STORE ERROR", e);
} });

// ✅ Session Configuration

app.use(
  session({
    store,
    secret: process.env.SECRET_KEY,
    resave: false,
    saveUninitialized: true,
    cookie: {
      expires: Date.now() + 7 * 24 * 60 * 60 * 1000, // 7 Days
      maxAge: 7 * 24 * 60 * 60 * 1000,
      httpOnly: true,
    },
  })
);

// ✅ Use flash *after* session
app.use(flash());

app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));

passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());




// ✅ Flash & Current User Middleware
app.use((req, res, next) => {
  res.locals.success = req.flash("success");
  res.locals.error = req.flash("error");
  res.locals.currentUser = req.user; // Passport sets req.user
  next();
});

/* ------------------ Routes ------------------ */

// Home Route
app.get('/', (req, res) => {
  res.render('home.ejs', { title: "Wanderlust Home" });
});


// Listing Routes
app.use('/listings', listingRouter);

// Review Routes
app.use('/listings/:id/reviews', reviewRouter);

// User Routes
app.use('/', userRouter);


/* ------------------ 404 Handler ------------------ */
app.use((req, res, next) => {
  next(new ExpessError(404, "Page Not Found"));
});

/* ------------------ Central Error Handler ------------------ */
app.use((err, req, res, next) => {
  const { statusCode = 500 } = err;
  if (!err.message) err.message = "Something went wrong!";
  res.status(statusCode).render("error.ejs", { err });
});

/* ------------------ Server ------------------ */
const PORT = 8000;
app.listen(PORT, () => {
  console.log(`🚀 Server running at http://localhost:${PORT}`);
});
