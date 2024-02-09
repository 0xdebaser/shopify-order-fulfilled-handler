import { createAdminRestApiClient } from "@shopify/admin-api-client";
import { Client, Environment } from "square";

import getShopifyId from "./getShopifyId.mjs";
import getSquareCombinedInventory from "./getSquareCombinedInventory.mjs";
import updateShopifyInventory from "./updateShopifyInventory.mjs";

export const handler = async (event, context, callback) => {
  let responseObject;
  let squareClient;
  let shopifyClient;

  try {
    const data = await JSON.parse(event.body);
    // Get the square variant ids for any items whose inventory count changed
    const inventory_counts = data.data.object.inventory_counts;
    const changedIds = [];
    inventory_counts.forEach((count) => {
      changedIds.push(count.catalogObjectId);
    });
    // Check the changed square ids to see if they have associated Shopify ids
    if (!squareClient)
      squareClient = new Client({
        accessToken: process.env.SQUARE_ACCESS_TOKEN,
        environment: Environment.Production,
      });
    for (const id of changedIds) {
      const shopifyId = await getShopifyId(squareClient, id);
      // If there's an associated Shopify id, get the combined square inventory and update the Shopify inventory
      if (shopifyId) {
        const combinedInventory = await getSquareCombinedInventory(
          squareClient,
          id
        );
        if (combinedInventory !== -99) {
          if (!shopifyClient) {
            shopifyClient = createAdminRestApiClient({
              storeDomain: "runbig.myshopify.com",
              apiVersion: "2023-04",
              accessToken: process.env.SHOPIFY_ACCESS_TOKEN,
            });
          }
          updateShopifyInventory(shopifyClient, shopifyId, combinedInventory);
        }
      }
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
  callback(null, response);
};
