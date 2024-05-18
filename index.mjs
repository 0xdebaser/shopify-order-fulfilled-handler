import { appendFileSync } from "fs";

import createSquareOrderFromShopifyOrder from "./createSquareOrderFromShopifyOrder.mjs";
import checkForDups from "./checkForDup.mjs";
// import { testDataWithoutTax, testDataWithTax } from "./testData.mjs";

const TEST_MODE = false;

export const handler = async (event, context, callback) => {
  let responseObject;

  try {
    const data = TEST_MODE ? testDataWithoutTax : await JSON.parse(event.body);
    let handle = await checkForDups(data.id);
    if (handle) {
      createSquareOrderFromShopifyOrder(data);
      appendFileSync("handledOrders.dat", data.id + "\n");
    } else {
      console.log("Duplicate order detected and rejected.");
    }
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
