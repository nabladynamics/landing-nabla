import { NextResponse } from "next/server";

const RESEND_ENDPOINT = "https://api.resend.com/emails";
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function field(value: unknown, maxLength: number): string {
  return typeof value === "string" ? value.trim().slice(0, maxLength) : "";
}

export async function POST(request: Request) {
  const apiKey = process.env.RESEND_API_KEY;
  const to = process.env.CONTACT_TO_EMAIL;
  if (!apiKey || !to) {
    return NextResponse.json(
      { error: "Contact endpoint is not configured." },
      { status: 503 },
    );
  }

  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  const name = field(body.name, 200);
  const email = field(body.email, 320);
  const company = field(body.company, 200);
  const message = field(body.message, 5000);

  if (!name || !message || !EMAIL_PATTERN.test(email)) {
    return NextResponse.json(
      { error: "Missing or invalid fields." },
      { status: 400 },
    );
  }

  const text = [
    `Name: ${name}`,
    `Email: ${email}`,
    company ? `Company: ${company}` : null,
    "",
    message,
  ]
    .filter((line) => line !== null)
    .join("\n");

  const response = await fetch(RESEND_ENDPOINT, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from:
        process.env.CONTACT_FROM_EMAIL ??
        "Nabla AI website <onboarding@resend.dev>",
      to: [to],
      reply_to: email,
      subject: `New website enquiry from ${name}${company ? ` (${company})` : ""}`,
      text,
    }),
  });

  if (!response.ok) {
    console.error(
      `Resend request failed (${response.status}):`,
      await response.text(),
    );
    return NextResponse.json(
      { error: "Email delivery failed." },
      { status: 502 },
    );
  }

  return NextResponse.json({ ok: true });
}
