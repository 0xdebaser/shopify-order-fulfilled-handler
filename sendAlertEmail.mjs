import nodemailer from "nodemailer";
import "dotenv/config";

export default async function sendAlertEmail(orderNumber, alertItems) {
  try {
    const transporter = nodemailer.createTransport({
      host: "smtp.zoho.com",
      secure: true,
      port: 465,
      auth: {
        user: "alerts@runbig.co",
        pass: process.env.ZOHO_MAIL_PASSWORD,
      },
    });
    let alertItemsList = "<ul>";
    alertItems.forEach(
      (alertItem) =>
        (alertItemsList += `<li>${alertItem.name} (${alertItem.sku}) Quantity: ${alertItem.quantity}</li>`)
    );
    alertItemsList += "</ul>";
    const info = await transporter.sendMail({
      from: '"Auto Alerts 🙉" <alerts@runbig.co>',
      to: "shop@bigislandrunningcompany.com",
      subject: `Transfer Alert for Order #${orderNumber}`,
      html: `<h2>The following item in Order #${orderNumber} was not in stock at the Cube, so I transferred it from Alii Drive to the Cube for you:</h2> ${alertItemsList}`,
    });
    console.log(
      `Successfully sent transfer alert message for Order #${orderNumber}.`
    );
  } catch (error) {
    console.log(error);
  }
}
