const CUBE_LOCATION_ID = "LNJD2ZA1J59D2";

export default async function doesItemHaveNecessaryCubeInventory(
  squareClient,
  squareItemId,
  neededQuantity
) {
  try {
    const response = await squareClient.inventoryApi.retrieveInventoryCount(
      squareItemId,
      CUBE_LOCATION_ID
    );
    const cubeInventory = response.result["counts"][0]["quantity"];
    console.log(
      `For ${squareItemId}, have ${cubeInventory} and need ${neededQuantity}. Returning ${
        neededQuantity <= cubeInventory
      }`
    );
    return neededQuantity <= cubeInventory;
  } catch (error) {
    console.log(error);
    return false;
  }
}
