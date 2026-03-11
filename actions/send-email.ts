import { Resend } from "resend";
import React from "react";

type SendEmailOptions = {
  to: string | string[];
  subject: string;
  react: React.ReactElement | React.ReactNode; 
}

export async function sendEmail({ to, subject, react }: SendEmailOptions) {
  const resend = new Resend(process.env.RESEND_API_KEY || "");

  try {
    const data = await resend.emails.send({
      from: "Finance App <onboarding@resend.dev>",
      to,
      subject,
      react,
    });

    return { success: true, data };

  } catch (error) {
    console.error("Failed to send email:", error);
    return { success: false, error };
  }
}