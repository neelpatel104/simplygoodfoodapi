/**
 * @file    server.js 
 * @purpose This file is where the main server will be started from 
 */

// Library Imorts
const express = require('express');
const cors = require('cors');
const path = require('path');
const mongoose = require('mongoose');
const dotenv = require('dotenv');

// Router Imports
const userRouter = require('./routers/userRouter');
const foodItemsRouter = require('./routers/foodItemRouter');
const orderRouter = require('./routers/orderRouter');

// Helper Imports
const database = require('./helpers/db');
const jwt = require('./helpers/jwt/jwt');

// Enums For Logging
const {COLORS, REQUESTS} = require('./config');

// Initialize Libraries
const app = express();

// Set environment variables
dotenv.config({path: `./environments/.env.${process.env.NODE_ENV}`});

// Start Middlewares
app.use(cors({
    origin: process.env.ALLOWED_HOSTS,
    credentials: true,
}));
app.use(express.urlencoded({extended: true}));
app.use(express.json());
// Logging
app.use('/', (req, res, next) => {
    console.log(
        `[${new Date().toLocaleTimeString()}]`,
        `[${req.hostname}]`,
        COLORS[4],
        COLORS[REQUESTS.indexOf(req.method)],
        `[${req.method}]`,
        COLORS[5],
        `- ${req.url} - `,
        `PARAMS: ${JSON.stringify(req.params)} - `,
        `BODY: ${JSON.stringify(req.body)}`)
        next();
})
app.use('/users', userRouter);
app.use('/foodItems', jwt.verifyAccessToken, foodItemsRouter);
app.use('/orders', jwt.verifyAccessToken, orderRouter);
app.get('/', (req,res)=>{
    res.sendFile(path.join(__dirname, '/index.html'))
})
// Connect to Database and start the server
database.connectDatabase().then(()=>{
    const admin = new mongoose.mongo.Admin(mongoose.connection.db);
    admin.buildInfo((err, info)=>{
        console.log(`[${new Date().toLocaleTimeString()}] Using MongoDB Version: ${info.version}`);
        console.log(`[${new Date().toLocaleTimeString()}] Database Connected!`);
    })
   
    app.listen(process.env.PORT, (err)=>{
        if (err) console.log(err);
        console.log(`[${new Date().toLocaleTimeString()}] Server listening on ${process.env.PORT}`);
    })
}).catch(error => console.error(error));

