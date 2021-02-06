const mongoose = require('mongoose');
const passportLocalMongoose = require('passport-local-mongoose')
const Token = require('./token.model.js');
const jwt = require('jsonwebtoken');

const Schema = mongoose.Schema;

const userSchema = new Schema({
    firstname: {
        type: String,
        default: ''
    },
    lastname: {
        type: String,
        default: ''
    },
    admin: {
        type: Boolean,
        default: false
    }
});

userSchema.methods = {
    createAccessToken: async (user) => {
        try {
            let accessToken = jwt.sign(
                user,
                process.env.ACCESS_TOKEN_SECRET,
                {
                    expiresIn: "10000000",
                }
            );
            return accessToken;
        } catch (error) {
            console.error(error);
            return;
        }
    },
    createRefreshToken: async (user) => {
        try {
            let refreshToken = jwt.sign(
                user,
                process.env.REFRESH_TOKEN_SECRET,
                {
                    expiresIn: "1m",
                }
            );

            await new Token({ token: refreshToken }).save();
            return refreshToken;
        } catch (error) {
            console.error(error);
            return;
        }
    },
};

userSchema.plugin(passportLocalMongoose);

const User = mongoose.model('User', userSchema);

module.exports = User;