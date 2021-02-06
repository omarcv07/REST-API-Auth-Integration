const express = require('express');

const User = require('../models/auth/user.model.js');
const AuthController = require('../controllers/auth.js');
const { verifyUser } = require('../passport/index.js');

const userRouter = express.Router();

// GET users listing.
//  Add this function as the second parameter to make user to login if it wants to see the users * authenticate.verifyUser *
userRouter.get('/', (req, res, next) => {
  User.find({}).then((users) => {
    res.statusCode = 200;
    res.setHeader('Content-Type', 'application/json');
    res.json(users)
  }, (err) => next(err))
  .catch((err) => next(err));
});

// Sign up an account 
userRouter.post('/signup', AuthController.signup);

// Log in an account 
userRouter.post('/login', AuthController.login);

// Request refresh token 
userRouter.post('/token', verifyUser, AuthController.generateRefreshToken);

// Log out an account 
userRouter.get('/logout', verifyUser, AuthController.logout);

module.exports = userRouter;
