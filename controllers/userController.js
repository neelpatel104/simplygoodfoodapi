/**
 * @file userController.js 
 * @purpose This file contains route resolver functions for user endpoits. 
 */


// Model Imports 
const { User } = require('../models/user');
const { FoodItem } = require('../models/foodItem');

// HTTP Status Enums
const { STATUS } = require('../config');

/**
 * Returns all the user currently stored in the system
 * @returns {User[]} data: List of all users currently stored in the system or 
 *                    error: Error with proper status and message
 */
 module.exports.getUsers = async () => {
    try {
        let users = await User.find({}).populate('foodItems', '-seller');
        return {
            status: STATUS.OK,
            data: users
        };
    } catch (error){
        throw {
            status: error.status || STATUS.SERVER_ERROR,
            message: error.message || "Internal Server Error!"
        }
    }
}

/**
 * Returns the user with the given email ony projecting the given fields
 * @param {String} email: email of the user to retrieve
 * @param {String} fields: a string containing all the fields to show when returning the user
 * @returns {User} data: The user with the given email or 
 *                 error: Error with proper status and message
 */
 module.exports.getUserByEmail = async (email, fields) => {
    try {
        let foundUser = await User.findOne({email}, fields);
        if (!foundUser){
            throw {
                status: STATUS.NOT_FOUND,
                message: `User ${email} does not exist!`
            }
        } else {
            return {
                status: STATUS.OK,
                data: foundUser
            }
        }
    } catch (error){
        throw {
            status: error.status || STATUS.SERVER_ERROR,
            message: error.message || "Internal Server Error!"
        }
    }
}

/**
 * Adds a user with the given parameter
 * @param {User} user: User to add. Must be a User Schema. {@link ../models/user.js} 
 * @returns {User} data: The newly added user or 
 *                  error: Error with proper status and message
 */
 module.exports.addUser = async (user, role) => {
    try {
        let foundUser = await this.getUserByEmail(user.email);
        if (foundUser){
            throw {
                status: STATUS.DUPLICATE,
                message: `User ${user.email} already exists!`
            }
        }
    } catch (error){
        if (error.status == STATUS.NOT_FOUND){
            try {
                user.role = role;
                let newUser = await new User(user).save()
                let response = await this.getUserByEmail(newUser.email, '-password');
                return response
            } catch (error){
                throw {
                    status: error.status || STATUS.BAD_REQUEST,
                    message: Object.values(error.errors)[0].properties.message || error.message || "Internal Server Error!"
                }
            }
        } else {
            throw {
                status: error.status || STATUS.SERVER_ERROR,
                message: error.message || "Internal Server Error!"
            }
        }
    }
}

/**
 * Deleted a user with the given email
 * @param {String} email: email of the user to delete
 * @returns {User, FoodItem} data: Deleted User and Deleted Food Items or 
 *                           error: Error with proper status and message
 */
module.exports.deleteUser = async (email) => {
   try {
        await this.getUserByEmail(email);
        let deletedFoodItems = await FoodItem.deleteMany({seller: email});
        let deletedUser = await User.deleteOne({email});
        return {
            status: STATUS.OK,
            data: {
                deletedUser, 
                deletedFoodItems
            }
        }
   } catch(error){
       throw {
           status: error.status || STATUS.SERVER_ERROR,
           message: error.message || "Internal Server Error!"
       }
   }
}