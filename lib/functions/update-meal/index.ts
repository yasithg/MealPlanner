import * as AWS from "aws-sdk";
const docClient = new AWS.DynamoDB.DocumentClient();

function getParams(body: { type: any; preparation: any; size: any; date: any; }, id: any) {
    return {
        TableName: process.env.TABLE_NAME || "",
        Item: {
            id: id,
            type: body.type,
            preparation: body.preparation,
            size: body.size,
            date: body.date,
        },
    };
}

exports.updateHandler = async (event: { pathParameters: { id: any; }; body: string; }) => {
    try {
        const { id } = event.pathParameters;
        const body = JSON.parse(event.body);
        const params = getParams(body, id);
        // Create record if not exists, Otherwise update
        const data = await docClient.put(params).promise();
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