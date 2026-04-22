# 26 Hallenstein Street, Queenstown — landing page

Static landing page for the Rosefern Homes release at 26 Hallenstein Street. Leads from the enquiry form are posted to MailerLite via a small Netlify Function so every sign-up ends up in your subscriber database.

## What's in here

```
index.html                      the landing page
assets/                         hero image, aerial map, logo, brochure PDF
netlify/functions/subscribe.js  serverless handler that posts leads to MailerLite
netlify.toml                    Netlify build + function config
```

## Deploy in five steps

1. Push this folder to a new GitHub repo.
2. In Netlify, New site → Import an existing project → pick the repo.
3. Under Site settings → Environment variables, add:
   - `MAILERLITE_API_KEY` (MailerLite → Integrations → API → Developer API, "Classic API" key)
   - `MAILERLITE_GROUP_ID` (optional, but recommended — the Group you want these leads to land in)
4. Deploy. Netlify auto-detects the config, no build step.
5. Point your custom domain at the site once you're happy. The form calls `/.netlify/functions/subscribe`, which works on both the auto Netlify domain and your own.

## Getting the MailerLite Group ID

MailerLite → Subscribers → Groups → open the group. The URL will look like `https://dashboard.mailerlite.com/subscribers?group=123456789` — the number after `group=` is the ID. Paste it into the `MAILERLITE_GROUP_ID` env var in Netlify. If you skip it, subscribers land in the general list ungrouped.

## What gets captured

Each submission posts this to MailerLite:

- `email` → subscriber email
- `name` → MailerLite's built-in first name field
- `fields.last_name` → MailerLite's built-in last name field
- `fields.phone` → MailerLite's built-in phone field
- `fields.interest` → which residence type the lead chose from the dropdown
- `fields.message` → free-text message (optional)
- `fields.source` → "26 Hallenstein Street landing page" so you can segment by source later

If `interest`, `message` or `source` don't exist as custom fields in MailerLite yet, create them under Subscribers → Fields with those exact keys. Otherwise MailerLite silently drops them.

## Testing locally

```
npm i -g netlify-cli
netlify dev
```

`netlify dev` runs the static site and the function together at `http://localhost:8888`. Create a `.env` in the project root with your MailerLite key and group ID for local testing. It is already git-ignored.

## Verification checklist after deploy

- [ ] Hero image, aerial map and logo all load.
- [ ] Brochure PDF downloads on click.
- [ ] Submitting the form shows the success message in-place.
- [ ] MailerLite → Subscribers shows the test lead with the right group and custom fields populated.
- [ ] Check Netlify → Functions → `subscribe` logs for any 5xx responses.

## Editing content

Text lives directly in `index.html`. Prices, unit table, agent contacts, and the walk-times list are all plain HTML — grep for the section you want to change (for example "Units 1-3" finds the residences caption).

## Notes on the design

The page was built from the `landing.html` prototype in the Rosefern handoff bundle. Production changes vs the prototype:

- Stripped the Tweaks panel and the postMessage edit-mode bridge (prototype-only).
- Locked the accent colour to Olive (`#5a6346`), matching the prototype default.
- Replaced the local `onsubmit` handler with a fetch to the Netlify Function, plus a honeypot anti-spam field.
- Added meta tags for Open Graph / Twitter previews.
- Set cache headers so images are immutable and the HTML always revalidates.
