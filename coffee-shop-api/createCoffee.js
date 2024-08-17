constAWS = require('aws-sdk');
const dynamoDb = newAWS.DynamoDB.DocumentClient();
const { v4: uuidv4 } = require('uuid');

module.exports.handler = async (event) => {
  const requestBody = JSON.parse(event.body);
  const customerName = requestBody.customer_name;
  const coffeeBlend = requestBody.coffee_blend;
  const orderId = uuidv4();

  const params = {
    TableName: 'CoffeeOrders',
    Item: {
      OrderId: orderId,
      CustomerName: customerName,
      CoffeeBlend: coffeeBlend,
      OrderStatus: 'Pending'
    }
  };

  try {
    await dynamoDb.put(params).promise();
    return {
      statusCode: 200,
      body: JSON.stringify({ message: 'Order created successfully!', OrderId: orderId })
    };
  } catch (error) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: `Could not create order: ${error.message}` })
    };
  }
};