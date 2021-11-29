/**
 * @file orderRouter.js
 * @purpose This file exports the router that services requests for order endpoints
 */

// Library Import 
const express = require('express');

// Controller Import 
const oc = require('../controllers/orderController');

// Helper Import 
const jwt = require('../helpers/jwt/jwt');

// HTTP Status Enums
const {STATUS} = require('../config');

// Get the express router
const router = express.Router();

/**
 * Get all orders 
 * @param {Request} req: No data needed for request 
 * @param {Response<Order[]>} res: List of all orders in the database or 
 *                          error: Error with proper status and message
 */
router.get('/', async (req, res) => {
    if (req.user.role != 'admin'){
        res.status(STATUS.UNAUTHORIZED).send("User must be an admin to view every order!");
    } else {
        try{
            let response = await oc.getOrders();
            res.status(response.status).send(response.data);
        } catch (error) {
            res.status(error.status).send(error.message);
        }  
    }
})

/**
 * Get orders for which either the buyer or the seller has the given email. 
 * @param {Request} req: Request must contain an email in the url param 
 * @param {Response<Order>} res: Order for which has either the seller or the buyer has the given email or 
 *                        error: Error with proper status and message
 */
router.get('/:email', async (req, res) => {
    if (req.params.email != req.user.email && req.user.role != 'admin'){
        res.status(STATUS.UNAUTHORIZED).send("User cannot retrieve orders for other users")
    } else {
        try {
            let response = await oc.getOrdersForUser(req.params.email);
            res.status(response.status).send(response.data);
        } catch (error){
            console.log(error);
            res.status(error.status).send(error.message);
        }
    }
})

/**
 * Add order with the given details. 
 * @param {Request} req: Request must contain an order object in the body. {@link ../models/order.js}
 * @param {Response<Order>} res: The newly added Order or 
 *                        error: Error with proper status and message
 */
router.post('/',jwt.verifyAccessToken, async (req, res)=>{
    if (req.user.role != 'buyer' && req.user.role != 'admin'){
        res.status(STATUS.UNAUTHORIZED).send("User must be an admin or a buyer to create an order!")
    } else {
        try {
            let response = await oc.addOrder(req.body);
            res.status(response.status).send(response.data);
        } catch (error){
            res.status(error.status).send(error.message);
        }
    }
})

/**
 * Change the status of the order with the new status 
 * @param {Request} req: Request must contain the order id and status in the body 
 * @param {Response<Order>} res: The newly changed order or 
 *                        error: Error with proper status and message
 */
router.patch('/status', jwt.verifyAccessToken, async(req,res)=>{
    if (req.user.role != 'seller' && req.user.role != 'admin'){
        res.status(STATUS.UNAUTHORIZED).send("User must be an admin or a seller to create an order!")
    } else {
        try {
            let response = await oc.changeOrderStatus(req.body._id, req.body.status);
            res.status(response.status).send(response.data);
        } catch (error){
            res.status(error.status).send(error.message);
        }
    }
})


module.exports = router;
