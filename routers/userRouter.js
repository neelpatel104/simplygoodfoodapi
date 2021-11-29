/**
 * @file    foodItemsRouter.js
 * @purpose This files exports the router that services request for user endpoints
 */

// Library Imports
const express = require('express');
const bcrypt = require('bcrypt');

// Controller Import
const uc = require('../controllers/userController');

// Helper Import
const jwt = require('../helpers/jwt/jwt');

// HTTP Status Enums
const {STATUS} = require('../config');

// Get the express router
const router = express.Router();

/**
 * Get all users
 * @param {Request} req: No data needed for request
 * @param {Response<User[]>} res: List of all users in the database or
 *                           error: Error with proper status and message
 */
router.get('/', jwt.verifyAccessToken, async (req, res) => {
    // Only allow an admin to retrieve all users in the system
    if (req.user.role == 'admin'){
        try {
            let response = await uc.getUsers();
            res.status(response.status).send(response.data);
        } catch (error){
            res.status(error.status).send(error.message);
        }
    } else {
        res.status(STATUS.UNAUTHORIZED).send("Not Authorized!");
    }
})

/**
 * Get a user with the given email in the url param
 * @param {Request} req: Request must contain an email in the url param
 * @param {Response<User>} res: User with the given email or
 *                         error: Error with proper status and message
 */
router.get('/:email', jwt.verifyAccessToken, async (req, res)=>{
    let fields;
    // If requestor isn't an admin, remove password field.
    if (req.user.role !='admin'){
        fields = '-password -roles';
    }
    let email = req.params.email;
    try {
        let response = await uc.getUserByEmail(email, fields);
        res.status(response.status).send(response);
    } catch (error) {
        res.status(error.status).send(error.message)
    }
})

/**
 * Register a seller by using data in request body
 * @param {Request} req: Request must contain a body with User Schema {@link ../models/user.js}
 * @param {Response<User>} res: The newly added user or
 *                         error: Error with proper status and message
 */
router.post('/register/seller', async (req, res)=> {
    let newUser = req.body;
    if (!newUser.password){
        res.status(STATUS.BAD_REQUEST).send('User must have a password!');
    } else {
        // Generate a salt to hash the password
        const salt = await bcrypt.genSalt(10);
        // Attach the hashed password to the object and send it to be saved
        newUser.password =  await bcrypt.hash(newUser.password, salt);
        try {
            let response = await uc.addUser(newUser, 'seller');
            res.status(response.status).send(response.data);
        } catch (error){
            res.status(error.status).send(error.message);
        }
    }
})

/**
 * Register a buyer by using data in request body
 * @param {Request} req: Request must contain a body with User Schema {@link ../models/user.js}
 * @param {Response<User>} res: The newly added user or
 *                         error: Error with proper status and message
 */
router.post('/register/buyer', async (req, res)=> {
    let newUser = req.body;
    if (!newUser.password){
        res.status(STATUS.BAD_REQUEST).send('User must have a password!');
    } else {
        // Generate a salt to hash the password
        const salt = await bcrypt.genSalt(10);
        // Attach the hashed password to the object and send it to be saved
        newUser.password =  await bcrypt.hash(newUser.password, salt);
        try {
            let response = await uc.addUser(newUser, 'buyer');
            res.status(response.status).send(response.data);
        } catch (error){
            res.status(error.status).send(error.message);
        }
    }
})


/**
 * Login a user with credentials provided in the request body
 * @param {Request} req: Request must contain a body with user credentials. Ex. {email: example@something.com, password: somepassword}
 * @param {Response<String>} res: The login successful string or
 *                           error: Error with proper status and message
 */
router.post('/login', async (req,res)=> {
    let userCredentials = req.body;
    if (!(userCredentials.email && userCredentials.password)){
        res.status(STATUS.BAD_REQUEST).send("Email or Password missing!")
    } else {
        try {
            let response = await uc.getUserByEmail(userCredentials.email);
            try {
                let passwordCorrect = await bcrypt.compare(userCredentials.password, response.data.password);
                if (passwordCorrect){
                    response.data.password = undefined;
                    // Generate Token and send cookie with the token
                    let token = jwt.generateAccessToken(response.data);
                    res.status(token.status).cookie('token', token.data, {path:'/', secure: true, httpOnly: true, sameSite: "none"}).send({
                        message: "Login Successful!",
                        token: token.data,
                        response
                    });
                } else {
                    throw {
                        status: STATUS.UNAUTHENTICATED,
                        message: "Incorrect Credentials!"
                    }
                }
            } catch (error){
                throw {
                    status: error.status || STATUS.SERVER_ERROR,
                    message: error.message || "Internal Server Error"
                }
            }
        } catch (error){
            res.status(error.status).send(error.message);
        }
    }
})

/**
 * Delete a user with the given email in the url param
 * @param {Request} req: Request must contain an email in the url param
 * @param {Response<User>} res: The newly deleted user and attached food items or
 *                         error: Error with proper status and message
 */
router.delete('/:email', jwt.verifyAccessToken, async (req,res)=>{
    let email = req.params.email;
    // Only allow an admin to delete users
    if (req.user.role == 'admin'){
        try {
            let response = await uc.deleteUser(email);
            res.status(response.status).send(response.data);
        } catch (error){
            res.status(error.status).send(error.message);
        }
    } else {
        res.status(STATUS.UNAUTHORIZED).send("Only an admin can delete users")
    }
})


module.exports = router;
