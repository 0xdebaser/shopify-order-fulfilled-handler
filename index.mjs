// This lambda function queries Square the inventory quantities for a given array of ids.

import { Client, Environment, ApiError } from "square";
import CryptoJS from "crypto-js";

export const handler = async (event, context, callback) => {
  let responseObject;
  let client;

  try {
    // Square setup
    if (!client)
      client = new Client({
        accessToken: process.env.SQUARE_ACCESS_TOKEN,
        environment: Environment.Production,
      });
    const { customersApi } = client;

    // Get and decrypt email address
    const data = await JSON.parse(event.body);
    const encryptedEmailAddress = data.data;
    const bytes = CryptoJS.AES.decrypt(
      encryptedEmailAddress,
      process.env.DECRYPT_KEY
    );
    const emailAddress = bytes.toString(CryptoJS.enc.Utf8);

    // Create new customer with email address
    const _ = await customersApi.createCustomer({ emailAddress });

    responseObject = {
      result: "success",
    };
  } catch (error) {
    if (error instanceof ApiError) {
      error.result.errors.forEach(function (e) {
        console.log(e.category);
        console.log(e.code);
        console.log(e.detail);
      });
    } else {
      console.log("Unexpected error occurred: ", error);
    }
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
