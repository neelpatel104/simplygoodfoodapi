/**
 * @file db.js 
 * @purpose This file contains helpers functions for database operations
 */
const mongoose = require('mongoose');

/**
 * Connects the database with the connection string in the .env file
 * @returns the mongoose connection object
 */
module.exports.connectDatabase = () => {
    return mongoose.connect(process.env.DB_URL);
}