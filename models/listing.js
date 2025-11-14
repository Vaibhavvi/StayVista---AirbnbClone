const mongoose = require('mongoose');
const review = require('./review');
const Schema = mongoose.Schema;

// ✅ Sub-schema for image
const imageSchema = new Schema({
  filename: {
    type: String,
    default: "listingimage"
  },
  url: {
    type: String,
    default:
      "https://media.istockphoto.com/id/520836422/photo/tropical-sunrise.jpg?s=2048x2048&w=is&k=20&c=XqjI07ld_2QdbKHW1KKu1NP5U-xetMcZ8kvKQhPLtLE=",
    set: (v) =>
      v === ""
        ? "https://media.istockphoto.com/id/520836422/photo/tropical-sunrise.jpg?s=2048x2048&w=is&k=20&c=XqjI07ld_2QdbKHW1KKu1NP5U-xetMcZ8kvKQhPLtLE="
        : v,
  },
});

// ✅ Main Listing Schema
const listingSchema = new Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    required: true,
    trim: true
  },
  image: {
    type: imageSchema, // ✅ use the sub-schema correctly
    default: () => ({}) // ensures default image values apply
  },
  price: {
    type: Number,
    required: true,
    min: [0, "Price must be positive"]
  },
  location: {
    type: String,
    required: true,
    trim: true
  },
  country: {
    type: String,
    required: true,
    trim: true
  },
  reviews: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: "Review"
  }],
  owner: {
    type : Schema.Types.ObjectId,
    ref : 'User',
    required: true
  }
});

listingSchema.post("findOneAndDelete", async(listing) => {
    await review.deleteMany({ _id: { $in: listing.reviews } });
});

// ✅ Create model
const Listing = mongoose.model('Listing', listingSchema);
module.exports = Listing;
