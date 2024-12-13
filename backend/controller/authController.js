const Users = require("../model/userModel");
const AppError = require("../utils/appError");
const catchAsync = require("../utils/catchAsync");
const sendEmail = require("../utils/email");
const generateOTP = require("../utils/generateOTP");
const jwt = require("jsonwebtoken");

const signToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN,
  });
};

const createSendToken = (user, statusCode, res, message) => {
  const token = signToken(user._id);

  const cookieOptions = {
    expires: new Date(
      Date.now() + process.env.JWT_COOKIE_EXPIRES_IN * 24 * 60 * 60 * 1000
    ),
    httpOnly: true,
    secure: process.env.NODE_ENV === "production", //only secure in production//
    sameSite: process.env.NODE_ENV === "production" ? "none" : "Lax",
  };

  res.cookie("token", token, cookieOptions);

  user.password = undefined;
  user.passwordConfirm = undefined;
  user.otp = undefined;

  res.status(statusCode).json({
    status: "success",
    message,
    token,
    data: {
      user,
    },
  });
};

//signup//

exports.signup = catchAsync(async (req, res, next) => {
  const { username, email, password, passwordConfirm } = req.body;

  const existingUser = await Users.findOne({ email });

  if (existingUser) return next(new AppError("Email already registered", 400));

  const otp = generateOTP();

  const otpExpires = Date.now() + 24 * 60 * 60 * 1000;

  const newUser = await Users.create({
    username,
    email,
    password,
    passwordConfirm,
    otp,
    otpExpires,
  });

  try {
    await sendEmail({
      email: newUser.email,
      subject: "Email verification",
      html: `<h1>Your otp for email verification is here ${otp}</h1>`,
    });

    createSendToken(newUser, 201, res, "Registration successful");
  } catch (error) {
    await Users.findByIdAndDelete(newUser._id);
    console.log(error);
    return next(
      new AppError("Error sending the email. Please try again later.", 500)
    );
  }
});

//signup end//

//verify user//

exports.verifyAccount = catchAsync(async (req, res, next) => {
  const { otp } = req.body;

  if (!otp) {
    return next(new AppError("Otp is missing", 400));
  }

  const user = req.user;

  if (user.otp !== otp) {
    return next(new AppError("Invalid OTP", 400));
  }

  if (Date.now() > user.otpExpires) {
    return next(new AppError("Otp has expired. Please request a new OTP", 400));
  }

  user.isVerified = true;
  user.otp = undefined;
  user.otpExpires = undefined;

  await user.save({ validateBeforeSave: false });

  createSendToken(user, 200, res, "Email has been verified.");
});

exports.resendOTP = catchAsync(async (req, res, next) => {
  const { email } = req.user;

  if (!email) {
    return next(new AppError("Email is required to resend OTP", 400));
  }

  const user = await Users.findOne({ email });

  if (!user) {
    return next(new AppError("User not Found", 404));
  }

  if (user.isVerified) {
    return next(new AppError("This account is already verified", 400));
  }

  const newOtp = generateOTP();
  user.otp = newOtp;
  user.otpExpires = Date.now() + 24 * 60 * 60 * 1000;

  await user.save({ validateBeforeSave: false });

  try {
    await sendEmail({
      email: user.email,
      subject: "Resend otp for email verification",
      html: `<h1>Your New otp is : ${newOtp} </h1>`,
    });

    res.status(200).json({
      status: "success",
      message: "A new otp has sent to your email",
    });
  } catch (error) {
    user.otp = undefined;
    user.otpExpires = undefined;
    await user.save({ validateBeforeSave: false });
    return next(
      new AppError(
        "There is an error in sending the email ! Please try again",
        500
      )
    );
  }
});
//verify user end//

//login //

exports.login = catchAsync(async (req, res, next) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return next(new AppError("Please provide email and password", 400));
  }

  const user = await Users.findOne({ email }).select("+password");

  //compare the password saved in the database//

  if (!user || !(await user.correctPassword(password, user.password))) {
    return next(new AppError("Incorrect Email or Password", 401));
  }

  createSendToken(user, 200, res, "Login Successfully");
});
//login end//

//logout functionality//

exports.logout = catchAsync(async (req, res, next) => {
  res.cookie("token", "loggeout", {
    expires: new Date(Date.now() + 10 * 1000),
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
  });

  res.status(200).json({
    status: "success",
    message: "Logged out successfully",
  });
});

//logout end//

//forgot password//

exports.forgetPassword = catchAsync(async (req, res, next) => {
  const { email } = req.body;

  const user = await Users.findOne({ email });

  if (!user) {
    return next(new AppError("No user found", 404));
  }

  const otp = generateOTP();

  user.resetPasswordOTP = otp;
  user.resetPasswordOTPExpires = Date.now() + 10 * 60 * 1000; //5 minutes

  await user.save({ validateBeforeSave: false });

  try {
    await sendEmail({
      email: user.email,
      subject: "Your password Reset Otp (valid only in 5 minutes) ",
      html: `<h1>Your Password Reset otp is : ${otp} </h1>`,
    });

    res.status(200).json({
      status: "success",
      message: "Password reset Otp is send to your email",
    });
  } catch (error) {
    user.resetPasswordOTP = undefined;
    user.resetPasswordOTPExpires = undefined;
    await user.save({ validateBeforeSave: false });

    return next(
      AppError("There is an error sending the email. Please try again later")
    );
  }
});

//forgot password end//

//reset password//

exports.resetPassword = catchAsync(async (req, res, next) => {
  const { email, otp, password, passwordConfirm } = req.body;

  console.log({ email, otp, now: Date.now() });

  const user = await Users.findOne({
    email,
    resetPasswordOTP: otp,
    resetPasswordOTPExpires: { $gt: Date.now() },
  });

  if (!user) {
    return next(new AppError("No user Found", 400));
  }

  user.password = password;
  user.passwordConfirm = passwordConfirm;
  user.resetPasswordOTP = undefined;
  user.resetPasswordOTPExpires = undefined;

  await user.save();

  createSendToken(user, 200, res, "Password reset successfully");
});
//reset password end//
