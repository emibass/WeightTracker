const LocalStrategy = require("passport-local").Strategy;
require('dotenv').config();
const {getUserByID} = require("./dynamo");
var AWS = require('aws-sdk');
const { getUserByID } = require("./dynamo");
const bcrypt = require("bcrypt");


AWS.config.update({
    region: process.env.aws_default_region,
    accessKeyId: process.env.aws_access_key_id,
    secretAccessKey: process.env.aws_secret_access_key
});


const dynamoClient = new AWS.DynamoDB.DocumentClient();
const TABLE_NAME = "WeightTracker";

function initialize(passport){
    const authenticateUser = (email, password, done) => {
        const user = getUserByID(email);

        if (user == null) {
            return done (null, false, {message: "No user with that email"})
        }

    }

    passport.use(new LocalStrategy ({usernameField: "EMAIL", passwordField: "PASSWORD"}), 
    authenticateUser)
    passport.serializeUser((user, done) => { })
    passport.deserializeUser((ID, done) => { })

}