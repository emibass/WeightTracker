//jshint version 6

const express = require("express");
const bodyParser = require("body-parser");
const path = require("path");
const router = express.Router();
const {dynamoClient, getUsers, getUserByID, addOrUpdateUser, deleteUser} = require("./dynamo");
const { userInfo } = require("os");


const app = express();
const TABLE_NAME = "WeightTracker";

app.use(express.static("public"));
app.use(bodyParser.urlencoded({extended: true}));


app.get("/", function(req, res){
    res.sendFile(path.join(__dirname + "/signin.html"));
});

app.post("/", async (req, res) => {
    const email = req.body.EMAIL;
    const password = req.body.PASSWORD;
try{
    const user = await getUserByID(email);
    if (user.Item.PASSWORD == password){
        console.log(" you're clear to enter. welcome to pizza planet")
        res.sendFile(path.join(__dirname + "/index.html"));
    } else {
        console.log("wrong password");
        res.send("wrong password");
    };
} catch (err) {
    console.error(err);
    res.sendFile(path.join(__dirname + "/signup.html"));
}

});

app.get("/signup", function (req, res){
    res.sendFile(path.join(__dirname + "/signup.html"));
});


app.post("/signup", function (req, res){
    const newUser = {
        PASSWORD: req.body.PASSWORD,
        ID: req.body.EMAIL
    }
if (getUserByID(newUser.ID) === {}){
addOrUpdateUser(newUser);
res.sendFile(path.join(__dirname + "/index.html"));
} else {
    res.send("You already have an account - go to Sign In")
    console.log("user already exists");
}

});



app.use("/", router);

const port = process.env.PORT || 3000;

app.listen(3000, function(){
    console.log("Server running on port 3000");
});

