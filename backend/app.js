
// const dotenv = require('dotenv');
require("dotenv").config();

const express = require('express');
const cookieParser = require("cookie-parser");
const cors = require('cors');
const globalErrorHandler = require("./controller/errorController")
const userRouter = require('./routes/userRouters');
const AppError = require('./utils/appError');

const app = express();

app.use(cookieParser());
// dotenv.config();


// Middleware
app.use(cors(
    {
        origin: ["http://localhost:3001"],
        credentials: true,
    }
));

app.use(express.json());

//users api urls//
app.use('/api/users', userRouter)

app.all('*', (req, res, next) => {
    next(new AppError(`Can't find ${req.originalUrl} on this server`, 404))
});

app.use(globalErrorHandler)

module.exports = app;