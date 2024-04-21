export default async function customerHandler(data, squareClient) {
  let squareCustomerId;
  try {
    const customer = data.customer;
    const response = await squareClient.customersApi.searchCustomers({
      query: {
        filter: {
          emailAddress: {
            exact: customer.email,
          },
        },
      },
    });
    console.log(response.result);
    // Is customer already in Square?
    if (response.result.hasOwnProperty("customers")) {
      squareCustomerId = response.result.customers[0].id;
      console.log(`Customer found. Returning id: ${squareCustomerId}`);
    } else {
      const response1 = await squareClient.customersApi.createCustomer({
        address: {
          addressLine1: customer.default_address.address1,
          addressLine2: customer.default_address.address2,
        },
        emailAddress: customer.email,
      });
      squareCustomerId = response1.result.customer.id;
      console.log(`New customer created. Returning ${squareCustomerId}`);
    }
    return squareCustomerId;
  } catch (error) {
    console.log(error);
    return false;
  }
}
