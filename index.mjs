// This lambda function queries Square the inventory quantities for a given array of ids.

import { Client, Environment, ApiError } from "square";

export const handler = async (event, context, callback) => {
  let responseObject;
  let client;

  try {
    if (!client)
      client = new Client({
        accessToken: process.env.SQUARE_ACCESS_TOKEN,
        environment: Environment.Production,
      });
    const { inventoryApi } = client;

    const data = await JSON.parse(event.body);
    const ids = data.ids;

    const res = await inventoryApi.batchRetrieveInventoryCounts({
      catalogObjectIds: ids,
    });
    const { counts } = res.result;
    responseObject = {
      result: "success",
      counts,
    };
  } catch (error) {
    if (error instanceof ApiError) {
      error.result.errors.forEach(function (e) {
        console.log(e.category);
        console.log(e.code);
        console.log(e.detail);
      });
    } else {
      console.log("Unexpected error occurred: ", error);
    }
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
