import { Client, Environment } from "square";

import checkOrderItemsForCubeInventory from "./checkOrderItemsForCubeInventory.mjs";

export const handler = async (event, context, callback) => {
  let responseObject;
  let squareClient;

  try {
    const data = await JSON.parse(event.body);
    console.log(data);
    // const orderNumber = data.order_number;
    // const lineItems = data.line_items;
    // console.log(`Received webhook for creation of order #${orderNumber}`);
    // if (!squareClient)
    //   squareClient = new Client({
    //     accessToken: process.env.SQUARE_ACCESS_TOKEN,
    //     environment: Environment.Production,
    //   });
    // checkOrderItemsForCubeInventory(lineItems, squareClient, orderNumber);
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
