import crypto from "crypto";

export default async function transferToCube(
  squareClient,
  squareItemId,
  quantity
) {
  try {
    const response = await squareClient.inventoryApi.batchChangeInventory({
      idempotencyKey: crypto.randomUUID(),
      changes: [
        {
          transfer: {
            catalogObjectId: squareItemId,
            quantity,
            fromLocationId: process.env.SQUARE_ALII_LOCATION_ID,
            toLocationId: process.env.SQUARE_CUBE_LOCATION_ID,
            state: "IN_STOCK",
          },
        },
      ],
    });
    console.log(response.result);
    console.log("Transfer successful!");
  } catch (error) {
    console.log(error);
  }
}
