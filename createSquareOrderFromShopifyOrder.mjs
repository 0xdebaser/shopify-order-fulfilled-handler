import { Client, Environment } from "square";
import "dotenv/config";

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
    const toTransfer = [];
    for (const lineItem of data.line_items) {
      const { sku } = lineItem; // Shopify sku == Square item id
      // Check to make sure that there is sufficient inventory at the Cube.
      // If not, transfer inventory from Alii to the Cube.
      if (sku) {
        const inStockAtCube = await doesItemHaveNecessaryCubeInventory(
          squareClient,
          sku,
          lineItem.quantity.toString()
        );
        if (!inStockAtCube) {
          console.log(`Insufficient quantity for SKU ${sku}`);
          // transferToCube(
          //   squareClient,
          //   sku,
          //   lineItem.quantity,
          //   data.order_number.toString(),
          //   lineItem.name
          // );
          toTransfer.push({
            sku,
            quantity: lineItem.quantity,
            orderNumber: data.order_number.toString(),
            name: lineItem.name,
          });
        }
      }
      const lineItemObj = {
        quantity: lineItem.quantity.toString(),
        basePriceMoney: {
          amount: Math.round(parseFloat(lineItem.price) * 100),
          currency: "USD",
        },
      };
      if (sku) lineItemObj.catalogObjectId = sku;
      else lineItemObj.name = lineItem.name;
      newOrderData.lineItems.push(lineItemObj);
    }

    // Add in shipping as line item
    const shippingLineItem = {
      name: "Shipping",
      quantity: "1",
      basePriceMoney: {
        amount: data.shipping_lines[0].price
          ? Math.round(parseFloat(data.shipping_lines[0].price) * 100)
          : "0",
        currency: "USD",
      },
    };
    newOrderData.lineItems.push(shippingLineItem);

    // Add in tax - currently only supports HI GET
    if (data.tax_lines.length) {
      newOrderData.taxes = [
        {
          uid: "hawaii-get",
          name: "Hawaii GET",
          scope: "LINE_ITEM",
          percentage: "4.712",
          type: "ADDITIVE",
        },
      ];
      for (const lineItem of newOrderData.lineItems) {
        if (lineItem.name != "Shipping")
          lineItem.appliedTaxes = [{ taxUid: "hawaii-get" }];
      }
    }

    // Add in fulfillment state (for Square Dashboard purposes)
    newOrderData.fulfillments = [{ type: "SHIPMENT", state: "PROPOSED" }];
    newOrderData.fulfillments[0].shipmentDetails = {
      recipient: { customerId: newOrderData.customerId },
    };

    // Create new order in Square
    const response = await squareClient.ordersApi.createOrder({
      order: newOrderData,
      idempotencyKey: data.id.toString(), // Using Shopify order id as idempotency key to prevent dup orders
    });
    const orderId = response.result.order.id;
    console.log(`New Square Order created: ${orderId}`);
    const orderTotal = response.result.order.totalMoney.amount;

    // Pay for order
    const response1 = await squareClient.paymentsApi.createPayment({
      idempotencyKey: crypto.randomUUID(),
      sourceId: "EXTERNAL",
      externalDetails: {
        source: "Shopify",
        type: "EXTERNAL",
      },
      amountMoney: {
        amount: orderTotal,
        currency: "USD",
      },
      orderId,
      locationId: newOrderData.locationId,
    });

    //console.log(response1.result);
    const paymentId = response1.result.payment.id;
    console.log(`Order paid for with payment ${paymentId}`);

    // Handle any items that need to be transferred
    if (toTransfer.length) {
      for (const item of toTransfer) {
        transferToCube(
          squareClient,
          item.sku,
          item.quantity,
          item.orderNumber,
          item.name
        );
      }
    }

    return true;

    // Attach payment to order
    const response2 = await squareClient.ordersApi.payOrder(orderId, {
      idempotencyKey: crypto.randomUUID(),
      paymentIds: [paymentId],
    });
    console.log(response2.result);
    return true;
  } catch (error) {
    console.log(error);
    return false;
  }
}
