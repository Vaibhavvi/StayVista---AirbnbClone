const express = require('express');
const { default: mongoose } = require('mongoose');
const Schema = mongoose.Schema;

const reviewSchema = new Schema({
  comment: {
    type: String,
    required: true,
    trim: true
  },
  rating: {
    type: Number,
    required: true,
    min: 1,
    max: 5
  }
}, { timestamps: true }); // ✅ Automatically adds createdAt & updatedAt

module.exports = mongoose.model("Review", reviewSchema);
