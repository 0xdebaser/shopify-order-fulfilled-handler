import nodemailer from "nodemailer";

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
        (alertItemsList += `<li>${alertItem.name} (${alertItem.sku})</li>`)
    );
    alertItemsList += "</ul>";
    const info = await transporter.sendMail({
      from: '"Auto Alerts 🙊" <alerts@runbig.co>',
      to: "shop@bigislandrunningcompany.com",
      subject: `Alert for Order #${orderNumber}`,
      html: `<h2>The following items in Order #${orderNumber} are not in stock at the Cube:</h2> ${alertItemsList}`,
    });
    console.log(`Successfully sent alert message for Order #${orderNumber}.`);
  } catch (error) {
    console.log(error);
  }
}
