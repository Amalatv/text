const jwt = require("jsonwebtoken");
const catchAsync = require("../utils/catchAsync");
const AppError = require("../utils/appError");
const Users = require("../model/userModel");

const isAuthenticated = catchAsync(async (req, res, next) => {
  const token = req.cookies.token || req.headers.authorization?.split("")[1];

  if (!token) {
    return next(
      new AppError("You are not logged in. Please login to access ", 401)
    );
  }

  const decoded = jwt.verify(token, process.env.JWT_SECRET);

  const currentUser = await Users.findById(decoded.id);

  if (!currentUser) {
    return next(
      new AppError("The user belonging to this token does not exist", 401)
    );
  }

  req.user = currentUser;
  next();

  
});


module.exports = isAuthenticated;