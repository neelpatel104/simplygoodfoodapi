/**
 * @file    config.js
 * @purpose This file contains all the necessary Enums for the entire project
 */

// Enums for HTTP Statuses
const STATUS = {
    OK: 200, 
    CREATED_SUCCESSFULLY: 201, 
    BAD_REQUEST: 400,
    UNAUTHENTICATED: 401,
    UNAUTHORIZED: 403, 
    NOT_FOUND: 404, 
    DUPLICATE: 409,
    SERVER_ERROR: 500
}

// Enums for logging
const REQUESTS = ["GET", "POST", "PUT", "DELETE"]
const COLORS = ["\x1b[32m","\x1b[35m","\x1b[33m", "\x1b[31m", '\x1b[1m','\x1b[0m']

// Enums for user roles
const ROLES = ["admin", "buyer", "seller"]

// Enums for types of orders
const ORDER_TYPE=["pickup", "delivery"]

// Enums for order completion
const ORDER_STATUS = ["pending", "fulfilled"]

module.exports = {STATUS, ROLES, ORDER_TYPE, REQUESTS, COLORS, ORDER_STATUS};