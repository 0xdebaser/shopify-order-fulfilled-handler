import { Client, Environment } from "square";

import customerHandler from "./customerHandler.mjs";
import doesItemHaveNecessaryCubeInventory from "./doesItemHaveNecessaryCubeInventory.mjs";
import transferToCube from "./transferToCube.mjs";

export default async function createSquareOrderFromShopifyOrder(data) {
  let squareClient;

  try {
    console.log(data);
    const newOrder = { order: {} };
    const newOrderData = newOrder.order;

    if (!squareClient)
      squareClient = new Client({
        accessToken: process.env.SQUARE_ACCESS_TOKEN,
        environment: Environment.Production,
      });

    // extract new order data from Shopify order
    newOrderData.location = process.env.SQUARE_CUBE_LOCATION_ID;
    newOrderData.source = { name: "shopify-fulfillment-handler" };
    newOrderData.customerId = await customerHandler(data, squareClient);

    // add items to order by looping through line items
    newOrderData.line_items = [];
    data.line_items.forEach((lineItem) => {
      const { sku } = lineItem; // Shopify sku == Square item id
      const inStockAtCube = doesItemHaveNecessaryCubeInventory(
        squareClient,
        sku,
        lineItem.quantity
      );
      if (!inStockAtCube) transferToCube(squareClient, sku, lineItem.quantity);
    });
  } catch (error) {
    console.log(error);
  }
}
