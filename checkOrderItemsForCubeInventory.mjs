import doesItemHaveNecessaryCubeInventory from "./doesItemHaveNecessaryCubeInventory.mjs";
import sendAlertEmail from "./sendAlertEmail.mjs";

export default async function checkOrderItemsForCubeInventory(
  lineItems,
  squareClient,
  orderNumber
) {
  const alertItems = [];
  const promises = lineItems.map(async (lineItem) => {
    if (lineItem.sku) {
      // console.log(`Checking ${lineItem.name}. Need ${lineItem.quantity}.`);
      const sufficientCubeInventory = await doesItemHaveNecessaryCubeInventory(
        squareClient,
        lineItem.sku,
        lineItem.quantity
      );
      if (!sufficientCubeInventory) {
        alertItems.push({
          name: lineItem.name,
          sku: lineItem.sku,
        });
      }
    }
  });
  await Promise.all(promises);
  if (alertItems.length) {
    await sendAlertEmail(orderNumber, alertItems);
  } else {
    console.log(`No alert triggered for Order #${orderNumber}`);
  }
}
