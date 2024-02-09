// This lambda function queries Square the inventory quantities for a given array of ids.

export const handler = async (event, context, callback) => {
  let responseObject;

  try {
    const data = await JSON.parse(event.body);
    const inventory_counts = data.data.object.inventory_counts;
    const changedIds = new Set();
    inventory_counts.array.forEach((count) => {
      changedIds.add(count.catalogObjectId);
    });
    for (const id of changedIds) {
      console.log(id);
    }
    responseObject = {
      result: "success",
    };
  } catch (error) {
    console.log("Unexpected error occurred: ", error);
    responseObject = {
      result: "failure",
      message: error.message,
    };
  }
  const response = {
    statusCode: 200,
    headers: {
      "Content-Type": "application/json",
      "Access-Control-Allow-Origin": "*",
    },
    body: JSON.stringify(responseObject),
  };
  callback(null, response);
};
