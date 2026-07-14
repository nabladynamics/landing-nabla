export type ContactPayload = {
  name: string;
  email: string;
  company: string;
  message: string;
};

/**
 * Posts the form to the Resend-backed route handler (app/api/contact).
 * NEXT_PUBLIC_CONTACT_ENDPOINT overrides the target if the form ever needs
 * to bypass the built-in handler (e.g. Formspree).
 */
export async function submitContact(payload: ContactPayload): Promise<void> {
  const endpoint = process.env.NEXT_PUBLIC_CONTACT_ENDPOINT ?? "/api/contact";

  const response = await fetch(endpoint, {
    method: "POST",
    headers: { "Content-Type": "application/json", Accept: "application/json" },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    throw new Error(`Contact endpoint responded with ${response.status}`);
  }
}
