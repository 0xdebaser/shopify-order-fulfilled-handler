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
    newOrderData.referenceId = `Shopify Order: ${data.id}`;
    newOrderData.newOrderData.customerId = await customerHandler(
      data,
      squareClient
    );

    // add items to order by looping through line items
    newOrderData.lineItems = [];
    data.lineItems.forEach((lineItem) => {
      const { sku } = lineItem; // Shopify sku == Square item id
      // Check to make sure that there is sufficient inventory at the Cube.
      // If not, transfer inventory from Alii to the Cube.
      if (sku) {
        const inStockAtCube = doesItemHaveNecessaryCubeInventory(
          squareClient,
          sku,
          lineItem.quantity
        );
        if (!inStockAtCube)
          transferToCube(squareClient, sku, lineItem.quantity);
      }
      const lineItemObj = {
        name: lineItem.name,
        quantity: lineItem.quantity,
        basePriceMoney: {
          amount: parseFloat(lineItem.price) * 100,
          currency: "USD",
        },
      };
      if (sku) lineItemObj.catalogObjectId = sku;
      newOrderData.lineItems.push(lineItemObj);
    });

    // Add in shipping as line item
    const shippingLineItem = {
      name: "Shipping",
      quantity: 1,
      basePriceMoney: {
        amount: data.shipping_lines[0].price
          ? parseFloat(data.shipping_lines[0].price) * 100
          : "0",
        currency: "USD",
      },
    };
    newOrderData.lineItems.push(shippingLineItem);

    // Create new order in Square
    const response = await squareClient.ordersApi.createOrder({
      order: newOrderData,
    });
    console.log(`New Square Order created: ${response.result.order.id}`);
  } catch (error) {
    console.log(error);
  }
}
