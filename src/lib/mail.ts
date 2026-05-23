import nodemailer, { Transporter } from "nodemailer";

let transporter: Transporter | null = null;

function getTransporter(): Transporter {
  if (transporter) return transporter;

  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;
  if (!user || !pass) throw new Error("SMTP_USER and SMTP_PASS env vars are required");

  transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST || "smtp.gmail.com",
    port: Number(process.env.SMTP_PORT || 465),
    secure: (process.env.SMTP_SECURE ?? "true") === "true",
    auth: { user, pass },
  });
  return transporter;
}

export interface SendMailInput {
  to: string | string[];
  subject: string;
  html: string;
  text?: string;
  attachments?: { filename: string; content: Buffer | string; contentType?: string }[];
  /** Override From; defaults to SMTP_FROM or SMTP_USER */
  from?: string;
  replyTo?: string;
}

export async function sendMail(input: SendMailInput): Promise<void> {
  const from = input.from || process.env.SMTP_FROM || `Opsis Dalmatia <${process.env.SMTP_USER}>`;
  await getTransporter().sendMail({
    from,
    to: Array.isArray(input.to) ? input.to.join(",") : input.to,
    subject: input.subject,
    html: input.html,
    text: input.text,
    attachments: input.attachments,
    replyTo: input.replyTo,
  });
}
