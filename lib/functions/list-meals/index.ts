import * as AWS from "aws-sdk";
const docClient = new AWS.DynamoDB.DocumentClient();

exports.listHandler = async (event: any) => {
    try {
        const params = {
            TableName: process.env.TABLE_NAME || "",
        };
        const data = await docClient.scan(params).promise();
        return {
            statusCode: 200,
            body: JSON.stringify(data),
        };
    } catch (err) {
        return {
            statusCode: 500,
            body: JSON.stringify(err),
        };
    }
};