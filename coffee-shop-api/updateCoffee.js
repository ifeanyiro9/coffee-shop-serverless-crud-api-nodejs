const AWS = require('aws-sdk');
const dynamoDb = new AWS.DynamoDB.DocumentClient();

module.exports.handler = async (event) => {
  const requestBody = JSON.parse(event.body);
  const { order_id, new_status, customer_name } = requestBody;

  const params = {
    TableName: 'process.env.COFFEE_ORDERS_TABLE',
    Key: {
      OrderId: order_id,
      CustomerName: customer_name
    },
    UpdateExpression: 'SET OrderStatus = :status',
    ExpressionAttributeValues: {
      ':status': new_status
    }
  };

  try {
    await dynamoDb.update(params).promise();
    return {
      statusCode: 200,
      body: JSON.stringify({ message: 'Order status updated successfully!', OrderId: order_id })
    };
  } catch (error) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: `Could not update order: ${error.message}` })
    };
  }
};