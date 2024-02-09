const SQUARE_LOCATION_ID = "11808909";

export default async function updateShopifyInventory(
  client,
  shopifyObjectId,
  newInventory
) {
  // First get Shopify's inventory id for the item
  // Check first to see if it's a variant.
  let inventory_id;
  const response_0 = await client.get(`variants/${shopifyObjectId}.json`);
  if (response_0.ok) {
    const body = await response_0.json();
    console.log(body);
    inventory_id = body.variant.inventory_item_id;
    console.log(inventory_id);
  } else {
    // If it's not a variant it's a standalone product
    const response_1 = await client.get(`products/${shopifyObjectId}.json`);
    if (response_1.ok) {
      console.log("response_1 ok");
      const body = await response_1.json();
      if (body.product.variants.length == 1) {
        inventory_id = body.product.variants[0].inventory_item_id;
      } else {
        //There's a problem with the id because it's for a product with multiple variants
      }
    }
  }
  // If there's an inventory id, update it's inventory
  if (inventory_id) {
    const response_2 = await client.post("inventory_levels/set.json", {
      data: {
        inventory_item_id: inventory_id,
        available: newInventory,
        location_id: SQUARE_LOCATION_ID,
      },
    });
    if (response_2.ok) {
      console.log("success!");
    } else console.log(response_2);
  }
}
