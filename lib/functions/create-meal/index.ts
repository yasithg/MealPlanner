import * as AWS from "aws-sdk";
const docClient3 = new AWS.DynamoDB.DocumentClient();


function getParams(body: { type: any; preparation: any; size: any; date: any; }, context: { awsRequestId: any; }) {
    return {
        TableName: process.env.TABLE_NAME || "",
        Item: {
            id: context.awsRequestId,
            type: body.type,
            preparation: body.preparation,
            size: body.size,
            date: body.date,
        },
    };
}

exports.createHandler = async (event: { body: any; }, context: any) => {
    try {
        const body = JSON.parse(event.body);
        // let params = "";
        const params = getParams(body, context);
        await docClient3.put(params).promise();
        return {
            statusCode: 200,
            body: JSON.stringify({
                type: body.type,
                preparation: body.preparation,
                size: body.size,
                date: body.date,
            }),
        };
    } catch (err) {
        return {
            statusCode: 500,
            body: JSON.stringify(err),
        };
    }
};