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

    // Is customer already in Square?
    if (response.result.hasOwnProperty("customers")) {
      squareCustomerId = response.result.customers[0].id;
      console.log(`Customer found. Returning id: ${squareCustomerId}`);
    } else {
      // If not, make a new customer
      const response1 = await squareClient.customersApi.createCustomer({
        address: {
          addressLine1: customer.default_address.address1
            ? customer.default_address.address1
            : "",
          addressLine2: customer.default_address.address2
            ? customer.default_address.address2
            : "",
          country: customer.default_address.country_code
            ? customer.default_address.country_code
            : "",
          firstName: customer.default_address.first_name
            ? customer.default_address.first_name
            : "",
          lastName: customer.default_address.last_name
            ? customer.default_address.last_name
            : "",
          postalCode: customer.default_address.zip
            ? customer.default_address.zip
            : "",
          locality: customer.default_address.city
            ? customer.default_address.city
            : "",
          administrativeDistrictLevel1: customer.default_address.province
            ? customer.default_address.province
            : "",
        },
        emailAddress: customer.email ? customer.email : "",
        familyName: customer.last_name ? customer.last_name : "",
        givenName: customer.first_name ? customer.first_name : "",
        phoneNumber: customer.phone ? customer.phone : "",
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
