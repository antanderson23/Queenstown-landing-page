/**
 * Netlify Function: subscribe
 *
 * Accepts POST JSON from the enquiry form on index.html and subscribes
 * the lead to MailerLite via the v2 API. Optionally assigns them to a
 * group (MAILERLITE_GROUP_ID) so list segmentation works out of the box.
 *
 * Required environment variables (set in Netlify → Site settings → Environment):
 *   MAILERLITE_API_KEY   - classic API key from MailerLite (v2)
 *   MAILERLITE_GROUP_ID  - optional; if set, subscribers are added to this group
 *
 * Why v2 and not v3: v2 is simpler, has an unauthenticated-upsert-by-email
 * pattern, and accepts arbitrary custom fields without having to pre-create
 * them. For a single landing page this is the least-friction path; migrate
 * to v3 if you need advanced segmentation.
 */

const MAILERLITE_ENDPOINT = 'https://api.mailerlite.com/api/v2/subscribers';

const json = (statusCode, body) => ({
  statusCode,
  headers: {
    'Content-Type': 'application/json',
    'Cache-Control': 'no-store',
  },
  body: JSON.stringify(body),
});

const isEmail = (v) =>
  typeof v === 'string' && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.trim());

const clean = (v, max = 500) =>
  typeof v === 'string' ? v.trim().slice(0, max) : '';

exports.handler = async (event) => {
  if (event.httpMethod !== 'POST') {
    return json(405, { error: 'Method not allowed' });
  }

  const apiKey = process.env.MAILERLITE_API_KEY;
  if (!apiKey) {
    console.error('MAILERLITE_API_KEY is not set');
    return json(500, { error: 'Server is not configured' });
  }

  let payload;
  try {
    payload = JSON.parse(event.body || '{}');
  } catch (_) {
    return json(400, { error: 'Invalid JSON' });
  }

  const email = clean(payload.email, 200).toLowerCase();
  const firstName = clean(payload.first_name, 80);
  const lastName = clean(payload.last_name, 80);
  const phone = clean(payload.phone, 40);
  const interest = clean(payload.interest, 120);
  const message = clean(payload.message, 2000);
  const source = clean(payload.source, 120) || '26 Hallenstein Street landing page';

  if (!isEmail(email)) return json(400, { error: 'Invalid email' });
  if (!firstName || !lastName) return json(400, { error: 'Name required' });

  const body = {
    email,
    name: firstName,
    fields: {
      last_name: lastName,
      phone,
      interest,
      message,
      source,
    },
    resubscribe: 1,
  };

  const groupId = process.env.MAILERLITE_GROUP_ID;
  const endpoint = groupId
    ? `https://api.mailerlite.com/api/v2/groups/${encodeURIComponent(groupId)}/subscribers`
    : MAILERLITE_ENDPOINT;

  try {
    const res = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-MailerLite-ApiKey': apiKey,
      },
      body: JSON.stringify(body),
    });

    const text = await res.text();
    let data;
    try { data = JSON.parse(text); } catch (_) { data = { raw: text }; }

    if (!res.ok) {
      console.error('MailerLite error', res.status, data);
      // MailerLite returns 200 for most success states; anything else bubbles up.
      return json(502, { error: 'Subscriber could not be created', details: data });
    }

    return json(200, { ok: true });
  } catch (err) {
    console.error('Fetch failed', err);
    return json(502, { error: 'Upstream request failed' });
  }
};
