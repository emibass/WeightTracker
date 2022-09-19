const LocalStrategy = require("passport-local").Strategy;
const bcrypt = require("bcrypt");

require('dotenv').config();
var AWS = require('aws-sdk');

AWS.config.update({
    region: process.env.aws_default_region,
    accessKeyId: process.env.aws_access_key_id,
    secretAccessKey: process.env.aws_secret_access_key
});


const dynamoClient = new AWS.DynamoDB.DocumentClient();
const TABLE_NAME = "WeightTracker";

module.exports = function(passport){

    //used to serialize the user
    passport.serializeUser(function(user, done) {
        done(null, user.ID.S);
      });
    
      // used to deserialize the user
      passport.deserializeUser(function(ID, done) {
        dynamoClient.getItem({"TableName":TABLE_NAME,"Key": {"EMAIL":{"S":ID}}}, function(err,data){
          if (err){
            done(err,data);
          }
          done(err,{ "EMAIL": data.Item.ID.S, "PASSWORD": data.Item.PASSWORD.S});
        })
      });

      passport.use('local-signup', new LocalStrategy({
        // by default, local strategy uses username and password, we will override with email
        EMAIL : 'EMAIL',
        PASSWORD: 'PASSWORD',
        passReqToCallback : true // allows us to pass back the entire request to the callback
      },
      function(req, EMAIL, PASSWORD, done) {
        var params = {
          "TableName":TABLE_NAME,
          "IndexName":"email-index",
          "KeyConditions":{
            "EMAIL":{
              "ComparisonOperator":"EQ",
              "AttributeValueList":[{"S":EMAIL}]
            }
          }
        }
         // find a user whose email is the same as the forms email
    // we are checking to see if the user trying to login already exists
    dynamoClient.query(params, function(err,data){
        // if there are any errors, return the error
        if (err){
          return done(err);
        }
  
        // check to see if theres already a user with that email
        if (data.Items.length > 0) {
          return done(null, false, req.flash('signupMessage', 'That email is already taken.'));
        } else {
  
          var params = {
            "TableName":TABLE_NAME,
            "Item" : {
            //   "ID":{"S":(Math.floor(Math.random() * 4294967296)).toString()},
              "ID":{"S":EMAIL},
              "PASSWORD":{"S":bcrypt.hashSync(PASSWORD)}
            }
          }
          dynamoClient.putItem(params, function(err,data){
            if (err){
              return done(null, false, req.flash('signupMessage', "Apologies, please try again now. ("+err+")"));
            }else{
              return done(null, params.Item);
            }
          })
  
        }
  
      });
  
    }));
    // =========================================================================
  // LOCAL LOGIN =============================================================
  // =========================================================================
  // we are using named strategies since we have one for login and one for signup
  // by default, if there was no name, it would just be called 'local'

  passport.use('local-login', new LocalStrategy({
    // by default, local strategy uses username and password, we will override with email
    EMAIL : 'EMAIL',
    PASSWORD : 'PASSWORD',
    passReqToCallback : true // allows us to pass back the entire request to the callback
  },
  function(req, EMAIL, PASSWORD, done) { // callback with email and password from our form
    var params = {
      "TableName":TABLE_NAME,
      "IndexName":"email-index",
      "KeyConditions":{
        "EMAIL":{
          "ComparisonOperator":"EQ",
          "AttributeValueList":[{"S":EMAIL}]
        }
      }
    }
    dynamoClient.query(params, function(err,data){
      if (err){
        return done(err);
      }
      if (data.Items.length == 0){
        return done(null, false, req.flash('loginMessage', 'No user found.')); // req.flash is the way to set flashdata using connect-flash
      }
      dynamoClient.getItem({"TableName":TABLE_NAME,"Key": {"EMAIL":data.Items[0]["ID"]}}, function(err,data){
        if (err){
          return done(err);
        }
        if (!bcrypt.compareSync(PASSWORD, data.Item.PASSWORD.S)){
          return done(null, false, req.flash('loginMessage', 'Oops! Wrong password.')); // create the loginMessage and save it to session as flashdata
        }else{
          return done(null, data.Item);
        }
      })
    });
  }));
};
