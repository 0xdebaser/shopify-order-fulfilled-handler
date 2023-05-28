// This lambda function queries Square the inventory quantities for a given array of ids.

import { Client, Environment, ApiError } from "square";

export const handler = async (event, context, callback) => {
  let responseObject;
  let client;
  let countsArray = [];

  async function getInventory(ids, prevCursor = null) {
    const queryParams = {
      catalogObjectIds: ids,
    };
    if (prevCursor) queryParams.cursor = prevCursor;
    const res = await inventoryApi.batchRetrieveInventoryCounts(queryParams);
    const { counts, cursor } = res.result;
    countsArray = [...countsArray, ...counts];
    if (cursor) {
      getInventory(ids, cursor);
    } else {
      return countsArray;
    }
  }

  try {
    if (!client)
      client = new Client({
        accessToken: process.env.SQUARE_ACCESS_TOKEN,
        environment: Environment.Production,
      });
    const { inventoryApi } = client;
    const data = await JSON.parse(event.body);
    const ids = data.ids;
    const counts = await getInventory(ids);
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
