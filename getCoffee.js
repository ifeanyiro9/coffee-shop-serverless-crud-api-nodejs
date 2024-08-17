constAWS = require('aws-sdk');
const dynamoDb = newAWS.DynamoDB.DocumentClient();

module.exports.handler = async () => {
  const params = {
    TableName: 'CoffeeOrders'
  };

  try {
    const result = await dynamoDb.scan(params).promise();
    return {
      statusCode: 200,
      body: JSON.stringify(result.Items)
    };
  } catch (error) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: `Could not retrieve orders: ${error.message}` })
    };
  }
};