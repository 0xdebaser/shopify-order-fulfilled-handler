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
    newOrderData.locationId = process.env.SQUARE_CUBE_LOCATION_ID;
    newOrderData.source = { name: "shopify-fulfillment-handler" };
    newOrderData.referenceId = `Shopify Order: ${data.id}`;
    newOrderData.customerId = await customerHandler(data, squareClient);

    // add items to order by looping through line items
    newOrderData.lineItems = [];
    data.line_items.forEach((lineItem) => {
      const { sku } = lineItem; // Shopify sku == Square item id
      // Check to make sure that there is sufficient inventory at the Cube.
      // If not, transfer inventory from Alii to the Cube.
      if (sku) {
        const inStockAtCube = doesItemHaveNecessaryCubeInventory(
          squareClient,
          sku,
          lineItem.quantity.toString()
        );
        if (!inStockAtCube)
          transferToCube(squareClient, sku, lineItem.quantity);
      }
      const lineItemObj = {
        quantity: lineItem.quantity.toString(),
        basePriceMoney: {
          amount: parseFloat(lineItem.price) * 100,
          currency: "USD",
        },
      };
      if (sku) lineItemObj.catalogObjectId = sku;
      else lineItemObj.name = lineItem.name;
      newOrderData.lineItems.push(lineItemObj);
    });

    // Add in shipping as line item
    const shippingLineItem = {
      name: "Shipping",
      quantity: "1",
      basePriceMoney: {
        amount: data.shipping_lines[0].price
          ? parseFloat(data.shipping_lines[0].price) * 100
          : "0",
        currency: "USD",
      },
    };
    newOrderData.lineItems.push(shippingLineItem);

    // Add in fulfillment state (for Square Dashboard purposes)
    newOrderData.fulfillments = [{ type: "SHIPMENT", state: "OPEN" }];

    // Create new order in Square
    const response = await squareClient.ordersApi.createOrder({
      order: newOrderData,
    });
    console.log(`New Square Order created: ${response.result.order.id}`);

    // Pay for the order
  } catch (error) {
    console.log(error);
  }
}
