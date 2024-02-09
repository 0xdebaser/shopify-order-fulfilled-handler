export default async function getSquareCombinedInventory(
  { inventoryApi },
  catalogObjectId
) {
  const response = await inventoryApi.retrieveInventoryCount(catalogObjectId);
  console.log(response.result);
}
