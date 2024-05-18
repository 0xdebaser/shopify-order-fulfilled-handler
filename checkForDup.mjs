import { readFileSync } from "fs";

export default async function checkForDups(shopifyOrderId) {
  const handledOrders = readFileSync("handledOrders.dat")
    .toString()
    .split("\n");
  for (const handledOrder of handledOrders) {
    console.log(handledOrder.trim());
    if (handledOrder.trim() == shopifyOrderId.toString()) return false;
  }
  return true;
}
