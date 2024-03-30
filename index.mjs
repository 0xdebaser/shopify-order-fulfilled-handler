import { Client, Environment } from "square";

import sendAlertEmail from "./sendAlertEmail.mjs";

export const handler = async (event, context, callback) => {
  let responseObject;
  let squareClient;

  try {
    const data = await JSON.parse(event.body);
    const orderNumber = data.order_number;
    const lineItems = data.lineItems;
    console.log(`Recieved webhook for creation of order #${orderNumber}`);
    if (!squareClient)
      squareClient = new Client({
        accessToken: process.env.SQUARE_ACCESS_TOKEN,
        environment: Environment.Production,
      });
    const alertItems = [];
    lineItems.forEach((lineItem) =>
      alertItems.push({
        name: lineItem.name,
        sku: lineItem.sku,
      })
    );
    await sendAlertEmail(orderNumber, alertItems);
    responseObject = {
      result: "success",
    };
  } catch (error) {
    console.log("Unexpected error occurred: ", error);
    responseObject = {
      result: "failure",
      message: error.message,
    };
  }
  const response = {
    statusCode: 200,
    headers: {
      "Content-Type": "application/json",
      "Access-Control-Allow-Origin": "*",
    },
    body: JSON.stringify(responseObject),
  };
  callback(null, response);
};
