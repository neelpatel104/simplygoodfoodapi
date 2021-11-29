/**
 * @file    jwt.js
 * @purpose This file contains helper functions that are used as a middleware 
 *          to generate, intercept and verify JSON Web Tokens
 * 
 */


// Library Imports 
const jwt = require('jsonwebtoken');
const fs = require('fs');

// Controller Import
const uc = require('../../controllers/userController');

// HTTP Status Enums
const {STATUS} = require('../../config');


class JWTHelper{

    constructor(){}

    /**
     * Generates an access token 
     * @param {JSON} body: Data to encrypt in the token
     * @returns {JSON} data: a JSON Web Token containing the provided date
     */
    generateAccessToken(body){
        let access_key = fs.readFileSync(process.env.ACCESS_TOKEN_KEY);
        return {
            status: STATUS.OK, 
            data: jwt.sign(JSON.stringify(body), access_key)
        }
    }

    /**
     * Verifies the access token provided in the Web Request Authorization Header
     * @param {Request} req:  Web Request
     * @param {Response} res:  Web Response
     * @param {NextFunction} next: The Next function to call
     */
    async verifyAccessToken(req, res, next){
        if (!req.headers['authorization']) res.status(401).send('No Authorization Found!');
        else {
            // Retrieve the token from authorization header
            let headerToken = req.headers['authorization'].split(' ')[1];
            try {
                let access_key = fs.readFileSync(process.env.ACCESS_TOKEN_KEY, {encoding: 'utf-8', flag: 'r'});
                let token = jwt.verify(headerToken, access_key)
                // Check if the requestor is a genuine user or not
                await uc.getUserByEmail(token.email);
                // If the requestor is genuine, attach the data in request, and call the next function in the chain
                req.user = token;
                next();
            } catch (error){
                if (error instanceof jwt.JsonWebTokenError) res.status(401).send("Invalid JWT");
                else if (error.status == STATUS.NOT_FOUND){
                    res.status(error.status).send("The account from which the request was made does not exist in the system!")
                }
            }
        }
    }
}

module.exports = new JWTHelper();