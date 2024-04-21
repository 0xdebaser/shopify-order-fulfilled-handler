import createSquareOrderFromShopifyOrder from "./createSquareOrderFromShopifyOrder.mjs";

export const handler = async (event, context, callback) => {
  let responseObject;

  try {
    const data = await JSON.parse(event.body);
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
  callback(null, response);
};
