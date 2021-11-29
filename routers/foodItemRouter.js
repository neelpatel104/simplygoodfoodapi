/**
 * @file    foodItemsRouter.js
 * @purpose This file exports the router that services requests for food item endpoints
 */

// Library Import
const express = require('express');

// Controller Import
const fic = require('../controllers/foodItemController');

// HTTP Status Enums
const {STATUS} = require('../config');


// Get the express router
const router = express.Router();

/**
 * Get all food Items
 * @param {Request} req: No data needed for request
 * @param {Response<FoodItem[]>} res: List of all Food Items in the database or 
 *                          error: Error with proper status and message
 */
router.get('/', async (req, res) => {
    try {
        let response = await fic.getFoodItems();
        res.status(response.status).send(response.data);
    } catch (error){
        res.status(error.status).send(error.message);
    }
})

/**
 * Get all food items for a particular seller with the given email in the url param
 * @param {Request} req: Request must contain an email in the url param
 * @param {Response<FoodItem[]>} res: List of all Food Items for a particular seller or
 *                          error: Error with proper status and message
 */
router.get('/seller/:email', async (req, res)=>{
    let email = req.params.email;

    try {
        let response = await fic.getFoodItemsBySeller(email);
        res.status(response.status).send(response.data);
    } catch (error){
        res.status(error.status).send(error.message);
    }
})

/**
 * Get all food items that have the given name in the url param
 * @param {Request} req: Request must contain a name in the url param 
 * @param {Response<FoodItem[]>} res: List of all Food Items with the given name or 
 *                   error: Error with proper status and message
 */
router.get('/food/:name', async (req, res)=>{
    let name = req.params.name;
    try {
        let response = await fic.getFoodItemsByName(name);
        res.status(response.status).send(response.data);
    } catch (error){
        res.status(error.status).send(error.message);
    }
})

/**
 * Adds a new food item by using data in request body
 * @param {Request} req: Request must contain a body with FoodItem Schema {@link ../models/foodItem.js}
 * @param {Response<FoodItem>} res: The newly added Food Item or 
*                    error: Error with proper status and message
 */
router.post('/', async (req, res)=> {
    // Only allow an admin or a seller to add food items
    if (req.user.role != 'admin' && req.user.role != 'seller'){
        res.status(STATUS.UNAUTHORIZED).send("User must be an admin or a seller to add Food Items!");
    } else {
        try {
            let response = await fic.addFoodItem(req.user.email, req.body);
            res.status(response.status).send(response.data);
        } catch (error){
            res.status(error.status).send(error.message);
        }
    }
})

/**
 * Edits an existing food item by using data  in request body
 * @param {Request} req: Request must contain a body with FoodItem Schema {@link ../models/foodItem.js}
 * @param {Response<FoodItem>} res: The newly updated Food Item or
 *                   error: Error with proper status and message
 */
router.put('/', async (req, res)=>{
    // Only allow an admin or a seller to edit food items
    if (req.user.role != 'admin' && req.user.role != 'seller'){
        res.status(STATUS.UNAUTHORIZED).send("User must be an admin or a seller to edit Food Items!");
    } else {
        try {
            let response = await fic.editFoodItem(req.user.email, req.body);
            res.status(response.status).send(response.data);
        } catch (error){
            res.status(error.status).send(error.message);
        }
    }
})

/**
 * Delets an existing food item by using the name in the url param
 * @param {Request} req: Request must contain a name in the url param
 * @param {Response<FoodItem>} res: The newly deleted Food Item or 
 *                   error: Error with proper status and message
 */
router.delete('/:name', async (req,res)=>{
    // Only allow an admin or a seller to delete food items
    if (req.user.role != 'admin' && req.user.role != 'seller'){
        res.status(STATUS.UNAUTHORIZED).send("User must be an admin or a seller to delete Food Items")
    } else {
        try {
            let response = await fic.deleteFoodItem(req.user.email, req.params.name);
            res.status(response.status).send(response.data);
        } catch (error) {
            res.status(error.status).send(error.message);
        }
    }
})

module.exports = router;


