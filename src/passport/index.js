const passport = require('passport');
const localStrategy = require('passport-local');
const User = require('../models/auth/user.model.js');
const jwtStrategy = require('passport-jwt');
const extractJwt = require('passport-jwt');

const LocalStrategy = localStrategy.Strategy
const JwtStrategy = jwtStrategy.Strategy
const ExtractJwt = extractJwt.ExtractJwt

exports.local = passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

const opts = {};
opts.jwtFromRequest = ExtractJwt.fromAuthHeaderAsBearerToken();
opts.secretOrKey = process.env.ACCESS_TOKEN_SECRET;

exports.jwtPassport = passport.use(new JwtStrategy(opts,
    (jwt_payload, done) => {
        console.log('JWT payload: ', jwt_payload);
        User.findOne({ _id: jwt_payload }, (err, user) => {
            const expirationDate = new Date(jwt_payload.exp * 1000)
            if (err) {
                return done(err, false);
            } else if (expirationDate < new Date()) {
                return done(null, false);
            } else if (user) {
                return done(null, user);
            } else {
                return done(null, false);
            }
        });
    }));

// User must login to continue looking more
exports.verifyUser = passport.authenticate('jwt', { session: false });

// User must be admin to continue looking more
exports.verifyAdmin = (req, res, next) => {
    if (req.user.admin) {
        next()
    } else {
        const err = new Error('You are not authorized to perform this operation');;
        err.status = 403;
        next(err);
    }
}