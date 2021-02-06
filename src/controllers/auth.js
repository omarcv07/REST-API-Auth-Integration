const User = require('../models/auth/user.model.js');
const passport = require('passport');
const Token = require('../models/auth/token.model.js');
const jwt = require('jsonwebtoken');

exports.signup = (req, res) => {
    User.register(new User({ username: req.body.username }),
        req.body.password, (err, user) => {
        if (err) {
            res.statusCode = 500;
            res.setHeader('Content-Type', 'application/json');
            res.json({ err: err });
        } else {
            if (req.body.firstname) {
                user.firstname = req.body.firstname.trim();
            }
            if (req.body.lastname) {
                user.lastname = req.body.lastname.trim();
            }
            user.save((err, user) => {
                if (err) {
                    res.statusCode = 500;
                    res.setHeader('Content-Type', 'application/json');
                    res.json({ err: err });
                    return;
                }

                passport.authenticate('local')(req, res, () => {
                    res.statusCode = 200;
                    res.setHeader('Content-Type', 'application/json');
                    res.json({ success: true, status: 'Registration Successful' });
                });
            });
        }
    });
}

exports.login = (req, res, next) => {
    passport.authenticate('local', async (err, user, info) => {
        if (err) { 
            return next(err); 
        }
        
        if (!user) { 
            res.statusCode = 404;
            res.setHeader('Content-Type', 'application/json');
            return res.json({ err: 'Your authentication information is incorrect. Please try again.' });
        }

        const accessToken = await user.createAccessToken({ _id: user._id });
        const refreshToken = await user.createRefreshToken({ _id: user._id });

        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/json');
        res.json({ success: true, token: accessToken, status: `Welcome back ${user.username}! You are successfully logged in!`, refreshToken: refreshToken });
    })(req, res, next);
}

exports.generateRefreshToken = (req, res) => {
    passport.authenticate('local', async (err, user, info) => {
        try {
            //get refreshToken
            const { refreshToken } = req.body;
            //send error if no refreshToken is sent
            if (!refreshToken) {
                return res.status(403).json({ error: "Access denied,token missing!" });
            } else {
                //query for the token to check if it is valid:
                const tokenDoc = await Token.findOne({ token: refreshToken });
                //send error if no token found:
                if (!tokenDoc) {
                return res.status(401).json({ error: "Token expired!" });
                } else {
                    //extract payload from refresh token and generate a new access token and send it
                    const payload = await jwt.verify(tokenDoc.token, process.env.REFRESH_TOKEN_SECRET);

                    if(payload) {
                        const accessToken = await user.createAccessToken({ _id: user._id });
                        const newRefreshedToken = await user.createRefreshToken({ _id: user._id });
                        console.log(user._id)
                        return res.status (200).json({ token: accessToken, refreshToken: newRefreshedToken  });
                    }
                }
            }
        } catch (error) {
        console.error(error);
        return res.status(500).json({ error: "Internal Server Error!" });
        }
    })(req, res);
};

exports.logout = (req, res, next) => {
    if (req.session) {
        req.session.destroy();
        res.clearCookie('session-id', { httpOnly: true, path:"/" });
        res.redirect('/');
    } else {
        let err = new Error('Your are not logged in!');
        err.status = 403;
        next(err);
    }
}