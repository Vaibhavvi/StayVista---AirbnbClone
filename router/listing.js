const express = require("express");
const router = express.Router();
const wrapAsync = require('../utils/wrapAsync.js');
const ExpessError = require('../utils/ExpessError.js');
const mongoose = require("mongoose");
const Listing = require('../models/listing.js');
const { isLoggedIn, isOwner } = require('../middleware.js');

/* ------------------ ADD NEW LISTING ------------------ */
router.get('/addListing', isLoggedIn, (req, res) => {
    res.render('listings/addListing');
});

// Handle Add Form Submission
router.post('/addListing', isLoggedIn, wrapAsync(async (req, res) => {
    const { title, description, price, location, country, image } = req.body;

    const newListing = new Listing({
        title,
        description,
        price,
        location,
        country,
        image: { url: image && image.trim() !== "" ? image : undefined }
    });
    newListing.owner = req.user._id;
    await newListing.save();
    req.flash("success", "New listing added successfully!");
    res.redirect('/listings');
}));

/* ------------------ READ ALL ------------------ */
router.get("/", wrapAsync(async (req, res) => {
    const allListings = await Listing.find({});
    res.render("listings/index.ejs", {
        title: "StayVista | All Listings",
        listings: allListings
    });
}));

/* ------------------ READ ------------------ */
router.get("/:id", wrapAsync(async (req, res, next) => {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
        throw new ExpessError(400, "Invalid listing ID");
    }

    const listing = await Listing.findById(id).populate('reviews').populate('owner');
    if (!listing) {
        req.flash("error", "Listing not found!");
        return res.redirect("/listings");
    }

    res.render("listings/show.ejs", { listing, CurrentUser: req.user });
}));

/* ------------------ UPDATE ------------------ */
// Show Edit Form
router.get("/:id/edit", isLoggedIn, isOwner, wrapAsync(async (req, res) => {
    const { id } = req.params;
    const listing = await Listing.findById(id);
    if (!listing) {
        req.flash("error", "Listing not found!");
        return res.redirect("/listings");
    }
    res.render("listings/edit.ejs", { listing });
}));

// Handle Edit Form Submission

router.put("/:id", wrapAsync(async (req, res) => {
    const { id } = req.params;
    const { title, description, price, location, country, image } = req.body;

    const updatedListing = await Listing.findByIdAndUpdate(
        id,
        { title, description, price, location, country, image: { url: image || "" } },
        { new: true, runValidators: true }
    );

    if (!updatedListing) {
        req.flash("error", "Listing not found!");
        return res.redirect("/listings");
    }

    req.flash("success", "Listing updated successfully!");
    res.redirect(`/listings/${id}`);
}));

/* ------------------ DELETE ------------------ */
router.delete("/:id", isLoggedIn, isOwner, wrapAsync(async (req, res) => {
    const { id } = req.params;
    const deletedListing = await Listing.findByIdAndDelete(id);
    if (!deletedListing) {
        req.flash("error", "Listing not found!");
        return res.redirect("/listings");
    }

    req.flash("success", "Listing deleted successfully!");
    res.redirect("/listings");
}));

module.exports = router;
