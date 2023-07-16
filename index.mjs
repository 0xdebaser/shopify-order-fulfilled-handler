// This lambda function queries Square the inventory quantities for a given array of ids.

import { Client, Environment, ApiError } from "square";

export const handler = async (event, context, callback) => {
  let responseObject;
  let client;
  let countsArray = [];
  let calls = 1;

  try {
    if (!client)
      client = new Client({
        accessToken: process.env.SQUARE_ACCESS_TOKEN,
        environment: Environment.Production,
      });
    const { inventoryApi } = client;
    const data = await JSON.parse(event.body);
    const ids = data.ids;
    const subArraysNeeded = Math.ceil(ids.length / 1000);

    for (let i = 0; i < subArraysNeeded; i++) {
      let subArray;
      if (i === subArraysNeeded - 1) {
        subArray = ids.slice(1000 * i);
      } else subArray = ids.slice(1000 * i, 1000 * (i + 1));

      console.log(
        `running subarray #${i} (${0 + 1000 * i}-${
          i === subArraysNeeded - 1 ? null : 1000 * (i + 1)
        })`
      );

      console.log(subArray);

      console.log(`API call #${calls}`);
      calls++;
      const res = await inventoryApi.batchRetrieveInventoryCounts({
        catalogObjectIds: subArray,
        limit: 1000,
      });
      let { counts, cursor } = res.result;
      counts.forEach((count) => {
        countsArray.push(count);
      });

      while (cursor) {
        console.log(`API call #${calls}`);
        calls++;
        console.log("cursor:", cursor);
        const res = await inventoryApi.batchRetrieveInventoryCounts({
          cursor,
          catalogObjectIds: subArray,
          limit: 1000,
        });
        counts = res.result.counts;
        cursor = res.result.cursor;
        counts.forEach((count) => {
          countsArray.push(count);
        });
      }
    }

    responseObject = {
      result: "success",
      counts: countsArray,
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
