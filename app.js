//jshint version 6

const express = require("express");
const bodyParser = require("body-parser");
const path = require("path");
const router = express.Router();
const {dynamoClient, getUsers, getUserByID, addOrUpdateUser, deleteUser} = require("./dynamo");
const ejs = require("ejs");


const app = express();
app.set('view engine', 'ejs');

app.use(express.static("public"));
app.use(bodyParser.urlencoded({extended: true}));


app.get("/", function(req, res){
    res.render("signin");
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
    res.render("signup");
}

});

app.get("/signup", function (req, res){
    res.render("signup");
});


app.post("/signup", async (req, res) => {
    const newUser = {
        PASSWORD: req.body.PASSWORD,
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
    res.sendFile(path.join(__dirname + "/index.html"));
  
}});



app.use("/", router);

const port = process.env.PORT || 3000;

app.listen(3000, function(){
    console.log("Server running on port 3000");
});

