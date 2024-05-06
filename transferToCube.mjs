import crypto from "crypto";

import sendAlertEmail from "./sendAlertEmail.mjs";

export default async function transferToCube(
  squareClient,
  squareItemId,
  quantity,
  shopifyOrderNumber,
  itemName
) {
  try {
    const response = await squareClient.inventoryApi.batchChangeInventory({
      idempotencyKey: crypto.randomUUID(),
      changes: [
        {
          type: "TRANSFER",
          transfer: {
            catalogObjectId: squareItemId,
            quantity: quantity.toString(),
            fromLocationId: process.env.SQUARE_ALII_LOCATION_ID,
            toLocationId: process.env.SQUARE_CUBE_LOCATION_ID,
            state: "IN_STOCK",
            occurredAt: new Date().toISOString(),
          },
        },
      ],
    });
    console.log(response.result);
    sendAlertEmail(shopifyOrderNumber, [
      { name: itemName, sku: squareItemId, quantity },
    ]);
  } catch (error) {
    console.log(error);
  }
}
