export type ContactPayload = {
  name: string;
  email: string;
  company: string;
  message: string;
};

/**
 * Frontend submission handler. Point NEXT_PUBLIC_CONTACT_ENDPOINT at a
 * Formspree form, a Resend-backed route handler or any custom API to start
 * receiving submissions; until then the payload is accepted locally so the
 * full UI flow can be exercised.
 */
export async function submitContact(payload: ContactPayload): Promise<void> {
  const endpoint = process.env.NEXT_PUBLIC_CONTACT_ENDPOINT;

  if (!endpoint) {
    await new Promise((resolve) => setTimeout(resolve, 800));
    return;
  }

  const response = await fetch(endpoint, {
    method: "POST",
    headers: { "Content-Type": "application/json", Accept: "application/json" },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    throw new Error(`Contact endpoint responded with ${response.status}`);
  }
}
