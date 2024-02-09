// This is the key for the shopify_id custom attribute in Square
const SQUARE_CUSTOM_ATTRIBUTE_KEY =
  "Square:08ab133c-881a-4ee5-9c96-2709ba641187";

export default async function getShopifyId(client, catalogObjectId) {
  try {
    const { catalogApi } = client;
    const response = await catalogApi.retrieveCatalogObject(catalogObjectId);
    const data = response.result.object;
    if (
      data.hasOwnProperty("customAttributeValues") &&
      data.customAttributeValues.hasOwnProperty(SQUARE_CUSTOM_ATTRIBUTE_KEY)
    ) {
      const shopifyId =
        data.customAttributeValues[SQUARE_CUSTOM_ATTRIBUTE_KEY].stringValue;
      return shopifyId;
    }
    return false;
  } catch (error) {
    console.log(error);
    return false;
  }
}
