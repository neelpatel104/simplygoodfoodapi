/**
 * @file orderController.js  
 * @purpose This file contains router resolver functions for order endpoints.
 */

// Model Import 
const { Order } = require('../models/order');
const { FoodItem } = require('../models/foodItem');

// Controller Import 
const uc = require('../controllers/userController');
const fic = require('../controllers/foodItemController');


// HTTP Status Enums  
const { STATUS } = require('../config');

/**
 * Returns all of the orders in the system 
 * @returns {Order[]} data: List of all orders currently stored in the system or 
 *                   error: Error with proper status and message 
 */
module.exports.getOrders = async () => { 
    try {
        let orders = await Order.aggregate([
            { 
                "$lookup": {
                    from: "users",
                    let: { seller: "$seller"},
                    pipeline: [{ "$match": { "$expr": { "$eq": [ "$email","$$seller" ]}}}, 
                        { "$project": { "name": 1, "email": 1, "address": 1, }}], 
                    as: "seller"
                },
            },
            {
                "$lookup": {
                    from: "users",
                    let: { buyer: "$buyer"},
                    pipeline: [{ "$match": { "$expr": { "$eq": [ "$email","$$buyer" ]}}}, 
                        { "$project": { "name": 1, "email": 1, "address": 1 }}], 
                    as: "buyer"
                }
            }
        ])
       
        return {
            status: STATUS.OK, 
            data: orders
        };
    } catch (error) {
        throw {
            status: error.status || STATUS.SERVER_ERROR, 
            message: error.message || "Internal Server Error!"
        }
    }
}

/**
 * Return all orders for which either the buyer or the seller has the given email 
 * @param {String} email: email of the user to find orders for  or 
 *                 error: Error with proper status and message
 */
module.exports.getOrdersForUser = async (email) => {
    try {
        await uc.getUserByEmail(email);
        let orders = await Order.aggregate([
            { 
                "$match": {
                    
                        "$or": [{seller: email}, {buyer: email}]
                    
                }
            }, 
            { 
                "$lookup": {
                    from: "users",
                    let: { seller: "$seller"},
                    pipeline: [{ "$match": { "$expr": { "$eq": [ "$email","$$seller" ]}}}, 
                        { "$project": { "name": 1, "email": 1, "address": 1, }}], 
                    as: "seller"
                },
            },
            {
                "$lookup": {
                    from: "users",
                    let: { buyer: "$buyer"},
                    pipeline: [{ "$match": { "$expr": { "$eq": [ "$email","$$buyer" ]}}}, 
                        { "$project": { "name": 1, "email": 1, "address": 1 }}], 
                    as: "buyer"
                }
            }
        ]);
        return {
            status: STATUS.OK, 
            data: orders
        }
    } catch (error){
        console.log(error)
        throw {
            status: error.status || STATUS.SERVER_ERROR, 
            message: error.message || "Internal Server Error!"
        }
    }
}

/**
 * Adds an order with given details       
 * @param {Order} order: Order to add. Must be a Order Schema. {@link ../models/order.js}
 * @returns {Order} data: The newly added order or 
 *                 error: Error with proper status and message
 */
module.exports.addOrder = async (order) => {
    try {
        for (const foodItemsPurchased of order.foodItems){
            let foodItem = await FoodItem.findById(foodItemsPurchased.foodItem);
            foodItemsPurchased.foodItemsPrice = parseFloat((foodItem.price * foodItemsPurchased.quantity).toFixed(2));
        }

        order.totalPrice = order.foodItems.reduce((accPrice, foodItem)=>{
            return accPrice + foodItem.foodItemsPrice
        }, 0);
        order.totalPrice += order.deliveryFee;
        order.address = order.type == "delivery" ? (await uc.getUserByEmail(order.buyer)).data.address : (await uc.getUserByEmail(order.seller)).data.address;
        order.date = new Date();
        order.status = "pending";
        let newOrder = await new Order(order).save();

        // Update quantities of food Items
        for(const item of newOrder.foodItems){
            let ogQuantity = (await FoodItem.findById(item.foodItem)).quantity;
            await FoodItem.findByIdAndUpdate(item.foodItem, {quantity: ogQuantity - item.quantity});
        }
        // Add address to new Order based on the type
        return {
            status: STATUS.OK,
            data: newOrder
        }
    } catch (error){
        throw {
            status: error.status || STATUS.SERVER_ERROR,
            message: error.message || "Internal Server Error!"
        }
    }
}

/**
 * Change the status of the order
 * @param {OrderID, Status} order id: order id, status : new status of the order
 * @returns {Order} data: The newly changed order or
 *                 error: Error with proper status and message 
 */
module.exports.changeOrderStatus = async(id, status) => {
    try {
        let changedOrder = await Order.findOneAndUpdate({_id: id}, {status});
        return {
            status: STATUS.OK, 
            data: changedOrder
        }
    } catch (error){
        throw {
            status: error.status || STATUS.SERVER_ERROR,
            message: error.message || "Internal Server Error!"
        }
    }
}
