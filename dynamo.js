require('dotenv').config();
var AWS = require('aws-sdk');

AWS.config.update({
    region: process.env.aws_default_region,
    accessKeyId: process.env.aws_access_key_id,
    secretAccessKey: process.env.aws_secret_access_key
});


const dynamoClient = new AWS.DynamoDB.DocumentClient();
const TABLE_NAME = "WeightTracker";

const getUsers = async () => {
    const params = {
        TableName: TABLE_NAME,
    };
    const users  = await dynamoClient.scan(params).promise();
    return users;
};

// getUsers();

const addOrUpdateUser = async (user) => {
    const params = {
        TableName: TABLE_NAME,
        Item: user
    }
    return await dynamoClient.put(params).promise();
};


// addOrUpdateUser(user1);

 const getUserByID = async (ID) => {
    const params = {
        TableName: TABLE_NAME,
        Key: {
            ID
        }
    };
    const userByID = await dynamoClient.get(params).promise();
    return userByID;
 };

 const deleteUser = async (ID) => {
    const params = {
        TableName: TABLE_NAME,
        Key: {
            ID
        }
    };
    return await dynamoClient.delete(params).promise();
 };

 module.exports = {
    dynamoClient,
    getUsers,
    getUserByID,
    addOrUpdateUser,
    deleteUser
 };