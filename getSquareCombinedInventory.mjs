export default async function getSquareCombinedInventory(
  { inventoryApi },
  catalogObjectId
) {
  try {
    const response = await inventoryApi.retrieveInventoryCount(catalogObjectId);
    const { counts } = response.result;
    let totalCount = 0;
    counts.forEach((count) => {
      if (count.state === "IN_STOCK") totalCount += parseInt(count.quantity);
    });
    return totalCount;
  } catch (error) {
    console.log(error);
    return -99;
  }
}
