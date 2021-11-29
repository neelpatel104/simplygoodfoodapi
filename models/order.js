/**
 * @file    order.js
 * @purpose This file contains the schema for an Order.
 */
const mongoose = require("mongoose");
const { ORDER_TYPE, ORDER_STATUS } = require("../config");
const { Schema } = mongoose;

const FoodItemsPurchased = new Schema({
	foodItem: {
		type: mongoose.Schema.Types.ObjectId,
		ref: "FoodItem",
		required: [true, "All orders must have atleast 1 food item attached!"],
	},
	quantity: {
		type: Number,
		required: [true, "All food items must have a quantity purchased field!"]
	},
	// Calculated in the backend based on the price of item and quantity
	foodItemsPrice: {
		type: Number,
		required: [true, "All food items must have a total price!"]
	}
});

const OrderSchema = new Schema({
  seller: {
    type: String,
    required: [true, "All orders must have a seller attached"],
  },
  buyer: {
    type: String,
    required: [true, "All orders must have a buyer attached!"],
  },
  foodItems:[FoodItemsPurchased],
  address: {
    type: String,
    required: [true, "All orders must have an address!"]
  },
  type: {
    type: String,
    default: undefined,
    enum: {
      values: ORDER_TYPE,
      message: "{VALUE} is not a valid order type",
    },
    required: [true, "All orders must have an order type!"],
  },
  deliveryFee: {
	  type: Number, 
	  required: [true, "All orders must have a delivery fee! For pickup orders just put 0.00!"]
  },
  totalPrice: {
    type: Number,
    required: [true, "The order must have a total price!"],
  },
  status: {
    type: String,
    default: "pending",
    enum: {
      values: ORDER_STATUS,
      message: "{VALUE} is not a valid order type",
    },
    required: [true, "All orders must have a status!"],
  },
  date: {
    type: Date,
    required: [true, "All orders must have a date!"],
  },
});

module.exports = {
  Order: mongoose.model("Order", OrderSchema),
};
