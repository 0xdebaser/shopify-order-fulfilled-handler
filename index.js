// This lambda function queries Square for all inventory items with a low stock alert and returns the variant ids for all matches

import { Client, Environment, ApiError } from "square";

const client = new Client({
  accessToken: process.env.SQUARE_ACCESS_TOKEN,
  environment: Environment.Production,
});

const { catalogApi } = client;

export const handler = async (event, context, callback) => {
  let responseObject;

  try {
    const res = await catalogApi.searchCatalogItems({
      stockLevels: ["LOW"],
    });
    const { matchedVariationIds } = res;
    responseObject = {
      result: "success",
      ids: matchedVariationIds,
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
