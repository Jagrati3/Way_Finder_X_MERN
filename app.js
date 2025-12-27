// Import required packages
const express = require("express");
// Initialize express app
const app = express();

const mongoose = require("mongoose");

const Listing = require("./models/listing.js");

const path = require("path");
const methodOverride = require("method-override");

// >>>require utils folder >> ExpressError and wrapAsync
const wrapAsync = require("./utils/wrapAsync.js");
const ExpressError = require("./utils/ExpressError.js");
// require review model 
const Review = require("./models/review.js");
// using ejs mate
const ejsMate = require("ejs-mate");

const session = require("express-session");
const flash = require("connect-flash");


// using the passport local for authentication
const passport = require("passport");
const LocalStrategy = require("passport-local");
// require user
const User = require("./models/user.js");


// const listings = require("./routes/listing.js");
// const reviews = require("./routes/reviews.js");
// const userRouter = require("./routes/user.js");

// Middleware (to handle JSON data)
// app.use(express.json());

// joi schema validation 
// https://joi.dev/api/?v=17.13.3
const { listingSchema, reviewSchema } = require("./schema.js");
// MongoDB URL
const MONGO_URL = "mongodb://127.0.0.1:27017/WonderLustDB";

// Connect to MongoDB
main()
  .then(() => {
    console.log("✅ MongoDB connected successfully");
  })
  .catch((err) => {
    console.log("❌ MongoDB connection failed:", err);
  });

// Async function to connect MongoDB
async function main() {
  await mongoose.connect(MONGO_URL);
}

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.use(express.urlencoded({ extended: true }));
app.use(methodOverride("_method"));
app.engine("ejs", ejsMate);
// use static files like style.css
app.use(express.static(path.join(__dirname, "/public")));



// Basic route
app.get("/", (req, res) => {
  res.send("Hello, Jagrati ! WayfinderX server is running 🚀");
});

const sessionOptions = {
  secret: "mysecretcode",
  resave: false,
  saveUninitialized: true,
  cookie: {
    httpOnly: true,
    expires: Date.now() + 7 * 24 * 60 * 60 * 1000,
    maxAge: 7 * 24 * 60 * 60 * 1000,
  }
};

app.use(session(sessionOptions));
app.use(flash());

// --------------------------------------
// Passport Authentication Setup
// --------------------------------------
app.use(passport.initialize());
app.use(passport.session());

passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

// Global middleware
app.use((req, res, next) => {
  res.locals.success = req.flash("success");
  res.locals.error = req.flash("error");
  next();
});


// create a user 

app.get("/demouser", async (req, res) => {
  let fakeUser = new User({
    email: "jagrati@gmail.com",
    username: "Jagrati_Jinny"
  });
  // password = abcd
  let registeredUser = await User.register(fakeUser, "abcd");
  res.send(registeredUser);
});



// validation for listing
const validateListing = (req, res, next) => {
  let { error } = listingSchema.validate(req.body);
  if (error) {
    let errMsg = error.details.map((el) => el.message).join(",");
    throw new ExpressError(400, errMsg);
  } else {
    next();

  }
};

// validation for review 
const validateReview = (req, res, next) => {
  let { error } = reviewSchema.validate(req.body);
  if (error) {
    let errMsg = error.details.map((el) => el.message).join(",");
    throw new ExpressError(400, errMsg);
  } else {
    next();

  }
};

//Index Route
app.get("/listings", wrapAsync(async (req, res) => {
  const allListings = await Listing.find({});
  res.render("listings/index.ejs", { allListings });
}));

//New Route
app.get("/listings/new", (req, res) => {
  res.render("listings/new.ejs");
});


// ........................
// about page 
app.get("/listings/about", (req, res) => {
  // You can pass dynamic data here if needed
  res.render("listings/about", {
    title: "About Me",
    name: "Your Name",
    role: "Frontend Developer / Creator",
    bio:
      "I'm a computer science student building web projects using HTML, CSS, JavaScript, Node.js and MongoDB. I enjoy solving problems and learning new web technologies.",
    skills: ["HTML", "CSS", "JavaScript", "Node.js", "Express", "MongoDB", "EJS"],
    email: "your.email@example.com",
    linkedin: "https://www.linkedin.com/in/yourprofile",
    github: "https://github.com/jagrati3"
  });
});

// .........................

// Show Route

app.get("/listings/:id", wrapAsync(async (req, res) => {
  let { id } = req.params;

  const listing = await Listing.findById(id)
    .populate({
      path: "reviews",
      populate: { path: "author" }
    });

  if (!listing) {
    req.flash("error", "Listing not found!");
    return res.redirect("/listings");
  }

  res.render("listings/show.ejs", {
    listing,
    currUser: req.user   // VERY IMPORTANT
  });
}));


//Create Route
app.post(
  "/listings", validateListing,
  wrapAsync(async (req, res, next) => {
    // joi schema validation 
    let result = listingSchema.validate(req.body);
    console.log(result);
    const newListing = new Listing(req.body.listing);
    await newListing.save();
    res.redirect("/listings");
  })
);

//Edit Route
app.get("/listings/:id/edit", wrapAsync(async (req, res) => {
  let { id } = req.params;
  const listing = await Listing.findById(id);
  res.render("listings/edit.ejs", { listing });
}));

//Update Route
app.put("/listings/:id", wrapAsync(async (req, res) => {
  let { id } = req.params;
  await Listing.findByIdAndUpdate(id, { ...req.body.listing });
res.redirect(`/listings/${id}`);
}));

//Delete Route
app.delete("/listings/:id", wrapAsync(async (req, res) => {
  let { id } = req.params;
  let deletedListing = await Listing.findByIdAndDelete(id);
  console.log(deletedListing);
  res.redirect("/listings");
}));


// review form 
// POST route
app.post("/listings/:id/reviews", validateReview, wrapAsync(async (req, res) => {
  let listing = await Listing.findById(req.params.id);

  let newReview = new Review(req.body.review);

  listing.reviews.push(newReview);

  await newReview.save();
  await listing.save();

res.redirect(`/listings/${listing._id}`);
}));


// review delete route
// DELETE Review Route
app.delete("/listings/:id/reviews/:reviewId", wrapAsync(async (req, res) => {
  const { id, reviewId } = req.params;

  // Remove review reference from listing
  await Listing.findByIdAndUpdate(id, { $pull: { reviews: reviewId } });

  // Delete review from Review collection
  await Review.findByIdAndDelete(reviewId);

res.redirect(`/listings/${id}`);
}));


// app.get("/testListing", async (req, res) => {
//   let sampleListing = new Listing({
//     title: "My New Villa",
//     description: "By the beach",
//     price: 1200,
//     location: "Calangute, Goa",
//     country: "India",
//   });

//   await sampleListing.save();
//   console.log("sample was saved");
//   res.send("successful testing");
// });


// Handle ALL unmatched routes (404)
app.use((req, res, next) => {
  next(new ExpressError(404, "Page Not Found!"));
});
// http://localhost:8080/listings/new/xyx
// Page not Found!
// ................................
// Error Handler
app.use((err, req, res, next) => {
  let { statusCode = 500, message = "Something went wrong!" } = err;
  // res.status(statusCode).send(message);
  err.statusCode = statusCode;
  err.message = message;
  res.status(statusCode).render("error", { err });

});

// http://localhost:8080/listings/xyz
// Cast to ObjectId failed for value "xyz" (type string) at path "_id" for model "Listing"



app.get('/signup', (req, res) => {
  res.render('signup'); // Points to your signup.ejs
});

app.get('/login', (req, res) => {
  res.render('login'); // Points to your login.ejs
});

app.post('/signup', async (req, res) => {
  try {
    const { username, email, password } = req.body;

    const user = new User({ username, email });

    const registeredUser = await User.register(user, password); // auto hash

    req.flash("success", "Account created. Please log in.");
    res.redirect('/login');

  } catch (e) {
    req.flash("error", e.message);
    res.redirect('/signup');
  }
});


app.post('/login',
  passport.authenticate("local", {
    failureRedirect: "/login",
    failureFlash: true
  }),
  (req, res) => {
    req.flash("success", "Welcome back!");
    res.redirect("/listings");
  });


// Run server on port 8080
app.listen(8080, () => {
  console.log("✅ Server started on port: 8080");
});