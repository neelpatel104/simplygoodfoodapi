/**
 * @file    foodItemController.js 
 * @purpose This file contains router resolver functions for food item endpoints.
 */

// Model Import 
const { FoodItem } = require('../models/foodItem');
const { User } = require('../models/user');


// Controller Import 
const uc = require('../controllers/userController');

// HTTP Status Enums 
const { STATUS } = require('../config');

/**
 * Returns all the food items in the system
 * @returns {FoodItem[]} data: List of all foodItems currently stored in the system or 
 *                       error: Error with proper status and message
 */
module.exports.getFoodItems = async () => {
    try {
        let foodItems = await FoodItem.aggregate([
           {
            // Populate the seller fields in every food item
               "$lookup": {
                   from: "users",
                   let: { seller: "$seller"},
                   pipeline: [
                       {
                           "$match": { 
                                "$expr": { 
                                    "$eq": [
                                        "$email","$$seller"
                                    ]
                                } 
                            }
                       }, 
                       {
                           "$project": 
                           { 
                               "name": 1, 
                               "email": 1,
                               "address": 1,
                           }
                       }
                   ], 
                   as: "seller"
               }
           }
        ]);
        return {
            status: STATUS.OK,
            data: foodItems
        };
    } catch (error){
        throw {
            status: error.status || STATUS.SERVER_ERROR,
            message: error.message || "Internal Server Error"
        }
    }
}

/**
 * 
 * @param {String} email: email of the seller for whome the food items are requested
 * @returns {FoodItem[]} data: List of all food items for the seller or
 *                       error: Error with proper status and message
 */
module.exports.getFoodItemsBySeller = async (email) => {
    try {
            await uc.getUserByEmail(email);
            try {
                let foodItems = await FoodItem.find({seller: email})
                return {
                    status: STATUS.OK,
                    data: foodItems
                }
            } catch (error){
                throw {
                    status: error.status || STATUS.SERVER_ERROR,
                    message: error.message || "Internal Server Error!"
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
 * Returns all Food Items with the same name as the parameter
 * @param {String} name: name of the food items to retrieve
 * @returns {FoodItem[]} data: Food Items with the same name as the parameter or 
 *                       error: Error with proper status and message
 */
module.exports.getFoodItemsByName = async (name) => {
    try {
        let foundItem = await FoodItem.find({name});
        if (foundItem.length == 0){
            throw {
                status: STATUS.NOT_FOUND,
                message: `Food Item ${name} does not exist!`
            }
        } else {
            return {
                status: STATUS.OK,
                data: foundItem
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
 * Checks whether a good item with the given name exists for a seller with the given email
 * @param {String} email: email of the seller to get the food items for
 * @param {String} name: name of the food item to check for 
 * @returns {Boolean} true: if food item exists for the seller, false: if not, or 
 *                    error: Error with proper status and message
 */
module.exports.foodItemExistsForSeller = async (email, name) => {
    try {
        let foodItems = await this.getFoodItemsBySeller(email);
        return foodItems.data.find(item => item.name === name)
    } catch (error){
        console.log(error)
        throw {
            status: error.status || STATUS.SERVER_ERROR,
            message: error.message || "Internal Server Error!"
        }
    }
}

/**
 * Adds the given food item for the user with the given email
 * @param {String} email: email of the user for whome to add the given food item fod
 * @param {FoodItem} foodItem: Food Item to add for the user with the given email. Must be a Food Item Schema {@link ./models/foodItem.js}
 * @returns {User, FoodItem} data: The newly added food item and the updated user or 
 *                           error: Error with proper status and message
 */
module.exports.addFoodItem = async (email, foodItem) => {
    try {
        if (await this.foodItemExistsForSeller(email, foodItem.name)){
            throw {
                status: STATUS.DUPLICATE,
                message: `Item ${foodItem.name} already exists for ${email}!`
            }
        } else {
            foodItem.seller = email;
            try {
                let newItem = await new FoodItem(foodItem).save();
                // After adding the new food item, push the id of it to the foodItems array in the user document
                let updatedUser = await User.findOneAndUpdate({email}, { $push: { foodItems: newItem._id }}, {
                    new: true
                });

                return {
                   status: STATUS.CREATED_SUCCESSFULLY,
                   data: {
                       updatedUser, 
                       newItem
                   }
                }              
            } catch (error){
                console.log(error)
                throw {
                    status: STATUS.BAD_REQUEST,
                    message: Object.values(error.errors)[0].properties.message
                }
            }
        }
    } catch (error) {
        throw {
            status: error.status || STATUS.SERVER_ERROR,
            message: error.message || "Internal Server Error!"
        }
    }
}

/**
 * Edits a food item in the database with the given name with the given seller
 * @param {String} email: email of user whose food item will be edited
 * @param {FoodItem} foodItem: The updated food item to replace the existing one with. Must be a Food Item Schema. {@link ./models/foodItem.js}
 * @returns {FoodItem} data: The newly updated food item or 
 *                     error: Error with proper status and message
 */
module.exports.editFoodItem = async (email, foodItem) => {
    if (foodItem.seller){
        throw {
            status: STATUS.BAD_REQUEST,
            message: "Cannot edit food items with seller field. Remove the seller field from request body!"
        }
    }
    try {
        await new FoodItem(foodItem).validate();
        let foodItemExists = await this.foodItemExistsForSeller(email, foodItem.name);
        if (foodItemExists){
            console.log("Food item does exist");
            let updatedFoodItem = await FoodItem.findOneAndUpdate({seller: email, name: foodItem.name}, foodItem, {
                new: true
            });
            return {
                status: STATUS.OK,
                data: updatedFoodItem
            };
        } else {
            throw {
                status: STATUS.NOT_FOUND,
                message: `Item ${foodItem.name} does not exist for user ${email}`
            }
        }
    } catch (error){
        console.log(error.message)
        throw {
            status: error.status || STATUS.BAD_REQUEST,
            message: error.message ||  Object.values(error.errors)[0].properties.message
        }

    }
}

/**
 * Deleted a food item with the given name for the seller with the given email
 * @param {String} email: email of the seller for whome to delete a food item for
 * @param {String} name: name of the food item to delete for the seller with the given name
 * @returns {FoodItem, User} data: The newly deleted food item and the updated user or 
 *                           error: Error with proper status and message
 */
module.exports.deleteFoodItem = async (email, name) => {
    try {
        let foodItemExists = await this.foodItemExistsForSeller(email, name);
        if (!foodItemExists){
            throw {
                status: STATUS.NOT_FOUND,
                message: `Item ${name} does not exist for user ${email}`
            }
        } else {
            let deletedFoodItem = await FoodItem.findOneAndDelete({seller: email, name})
            let updatedUser = await User.findOneAndUpdate({email}, {
                "$pull": {
                    "foodItems": deletedFoodItem._id
                }
            }, {
                new: true
            })

            return {
                status: STATUS.OK,
                data: {
                    deletedFoodItem, 
                    updatedUser
                }
            }
        }
    } catch (error){
        throw {
            status: error.status || STATUS.BAD_REQUEST,
            message: error.message ||  "Internal Server Error!"
        }
    }
}