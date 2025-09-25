import sgMail from "@sendgrid/mail";

import dotenv from "dotenv";

dotenv.config();

sgMail.setApiKey(process.env.SEND_GRID_API);

const fromEmail = process.env.FROM_EMAIL;

export const sendEmail = async (toEmail, subject, body) => {
  const msg = {
    to: toEmail,
    from: `TashHub <${fromEmail}>`,
    subject: subject,
    html: body,
  };

  try {
    await sgMail.send(msg);
    console.log("Email sent successfully");
    return true;
  } catch (error) {
    console.log(error);
    throw new Error("Failed to send email", error);
    return false;
  }
};