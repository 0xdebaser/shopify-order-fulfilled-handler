import { Client, Environment } from "square";

export const handler = async (event, context, callback) => {
  let responseObject;
  let squareClient;

  try {
    const data = await JSON.parse(event.body);
    console.log(data);
    if (!squareClient)
      squareClient = new Client({
        accessToken: process.env.SQUARE_ACCESS_TOKEN,
        environment: Environment.Production,
      });
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
