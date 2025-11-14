const express = require("express");
const passport = require("passport");
const User = require("../models/user");
const router = express.Router();
const { saveRedirectUrl } = require("../middleware");

// ---------- Register (GET) ----------
router.get("/register", (req, res) => {
  res.render("users/signup", { title: "Sign Up" });
});

// ---------- Register (POST) ----------
router.post("/register", async (req, res, next) => {
  try {
    const { username, email, password } = req.body;
    const user = new User({ username, email });

    const registeredUser = await User.register(user, password); // hashes password
    req.login(registeredUser, (err) => { // auto-login after signup
      if (err) return next(err);
      req.flash("success", `Welcome, ${username}! Your account was created.`);
      res.redirect("/"); // redirect wherever you like
    });
  } catch (err) {
    req.flash("error", err.message);
    res.redirect("/register");
  }
});

// ---------- Login (GET) ----------
router.get("/login", (req, res) => {
  res.render("users/login.ejs", { title: "Login" });
});

// ---------- Login (POST) ----------
router.post("/login", saveRedirectUrl,
  passport.authenticate("local", {
    failureRedirect: "/login",
    failureFlash: true
  }),
  (req, res) => {
    req.flash("success", `Welcome back, ${req.user.username}!`);
    res.redirect(res.locals.redirectUrl || "/");
  }
);

// ---------- Logout ----------
router.get("/logout", (req, res, next) => {
  req.logout((err) => {
    if (err) return next(err);
    req.flash("success", "Logged out successfully.");
    res.redirect("/");
  });
});

module.exports = router;
