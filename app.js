//jshint version 6

const express = require("express");
const bodyParser = require("body-parser");
const path = require("path");
const router = express.Router();
const {dynamoClient, getUsers, getUserByID, addOrUpdateUser, deleteUser} = require("./dynamo");
const ejs = require("ejs");
const session = require("express-session");
const passport = require("passport");
const bcrypt = require("bcrypt");

const initializePassport = require("./passport-config");

const app = express();
app.set('view engine', 'ejs');

app.use(express.static("public"));
app.use(bodyParser.urlencoded({extended: true}));

// app.use(session({
//     secret: 'no to zobaczmy czy bedzie dzialac',
//     resave: false,
//     saveUninitialized: false
//   }));

// app.use(passport.initialize());
// app.use(passport.session());

app.get("/", function(req, res){
    res.render("index");
});

//render signin (login) page
app.get("/signin", function (req, res){
    res.render("sigin");
});

app.post("/signin", async (req, res) => {
    const email = req.body.EMAIL;
    const password = req.body.PASSWORD;
try{
    const user = await getUserByID(email);
    if (user.Item.PASSWORD == password){
        console.log(" you're clear to enter. welcome to pizza planet")
        res.render("index");
    } else {
        console.log("wrong password");
        res.send("wrong password");
    };
} catch (err) {
    console.error(err);
    res.render("signup");
}

});


//render signup (register) page
app.get("/signup", function (req, res){
    res.render("signup");
});

//creating new users with email and password
app.post("/signup", async (req, res) => {
    const newUser = {
        PASSWORD:  bcrypt.hash(req.body.PASSWORD, 10),
        ID: req.body.EMAIL
    }

try{
   const userSigningUp =  await getUserByID(newUser.ID);

if (userSigningUp.Item.ID == newUser.ID){
    console.log("user already exists");
    res.send("you already have an account. go to sign in") 
} 
} catch (err) {
    console.error("new user added");
    addOrUpdateUser(newUser);
    res.render("index");
  
}});



app.use("/", router);

const port = process.env.PORT || 3000;

app.listen(3000, function(){
    console.log("Server running on port 3000");
});

