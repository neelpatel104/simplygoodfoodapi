/**
 * @file    foodItem.js
 * @purpose This file contains the schema for a Food Item. 
 */
const mongoose = require('mongoose');
const { Schema } = mongoose;

const FoodItemSchema = new Schema({
  name: {
    type: String, 
    required: [true, "Food Items must have a name"], 
    maxlength: 20
  }, 
  // Seller isn't required because the seller can be attached directly from the received JWT
  seller: {
    type: String,
  }, 
  price: {
    type: Number, 
    required: [true, "Food Item must have price field!"],
    min: [0.01, "Food item must cost atleast $0.01!"]
  }, 
  quantity: {
    type: Number, 
    required: [true, "Food Item must have quantity!"],
  }, 
  deliveryFee: {
    type: Number, 
    required: [true, "Food Must have a delivery fee. For pickup orders put $0.00!"]
  },
});

module.exports = { 
  FoodItem: mongoose.model('FoodItem', FoodItemSchema)
}
  
