const express = require("express");
const router = express.Router({ mergeParams: true }); 
const wrapAsync = require("../utils/wrapAsync.js");
const ExpressError = require("../utils/ExpessError.js");
const Review = require("../models/review.js");
const Listing = require("../models/listing.js");

/* ------------------ Create Review ------------------ */
router.post("/", wrapAsync(async (req, res) => {
  const { id } = req.params;
  const listing = await Listing.findById(id);

  if (!listing) throw new ExpressError(404, "Listing not found");

  const review = new Review(req.body.review);
  listing.reviews.push(review);

  await review.save();
  await listing.save();

  req.flash("success", "Review added successfully!");
  res.redirect(`/listings/${id}`);
}));

/* ------------------ Delete Review ------------------ */
router.delete("/:reviewId", wrapAsync(async (req, res) => {
  const { id, reviewId } = req.params;

  await Review.findByIdAndDelete(reviewId);
  await Listing.findByIdAndUpdate(id, { $pull: { reviews: reviewId } });

  req.flash("success", "Review deleted successfully!");
  res.redirect(`/listings/${id}`);
}));

module.exports = router;
