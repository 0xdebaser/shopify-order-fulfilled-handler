import createSquareOrderFromShopifyOrder from "./createSquareOrderFromShopifyOrder.mjs";
import { testDataWithoutTax } from "./testData.mjs";

const TEST_MODE = false;

export const handler = async (event, context, callback) => {
  let responseObject;

  try {
    const data = TEST_MODE ? testDataWithoutTax : await JSON.parse(event.body);
    createSquareOrderFromShopifyOrder(data);
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
  if (!TEST_MODE) callback(null, response);
  console.log("Sent response.");
};

if (TEST_MODE) handler(null, null, null);
