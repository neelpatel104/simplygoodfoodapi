/**
 * @file    user.js
 * @purpose This file contains the schema for a User
 */

const mongoose = require('mongoose');
const {ROLES} = require('../config');
const { Schema } = mongoose;

const UserSchema = new Schema({
    name: {
        type: String, 
        required: [true, "User must have a name!"], 
        maxlength: 20
    }, 
    email: {
        type: String, 
        required: [true, "User must have an email!"], 
        unique: true, 
    },
    password: {
        type: String, 
        required: [true, "User must have a name!"], 
    },
    address: {
        type: String, 
        required: [true, "User must have an address!"]
    },
    role: {
        type: String,
        default: undefined, 
        enum: {
            values: ROLES,
            message: "{VALUE} is not a valid role!",
        },
        required: [true, "Users must have a role attribute!"]
    },
    foodItems: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'FoodItem'
        },
    ]
})

module.exports = { 
    User: mongoose.model('User', UserSchema )
  }