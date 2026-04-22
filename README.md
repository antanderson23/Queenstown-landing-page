# 26 Hallenstein Street, Queenstown — landing page

Static landing page for the Rosefern Homes release at 26 Hallenstein Street. Leads from the enquiry form post directly to MailerLite's embedded-form endpoint, so every submission lands in your MailerLite subscriber list with zero backend infrastructure.

## What's in here

```
index.html       the landing page
assets/          hero image, aerial map, logo, brochure PDF
netlify.toml     Netlify caching config (no functions, no build step)
```

## How the form works

The enquiry form in `index.html` submits to MailerLite directly:

```
POST https://assets.mailerlite.com/jsonp/1899431/forms/185481874614781884/subscribe
```

Account ID `1899431` and form ID `185481874614781884` are baked into the form's `action` attribute. Submission is intercepted by `https://groot.mailerlite.com/js/w/webforms.min.js`, which posts via JSONP and then calls `ml_webform_success_40289265()`. That function hides the form and shows the styled thank-you state.

All settings for this form (double opt-in on/off, welcome email, which group subscribers land in, GDPR consent text) live in the MailerLite dashboard under Forms → Embedded forms → the form you created. Change them there, no code changes needed.

## Fields captured

| Form label        | MailerLite key          | Notes                                  |
|-------------------|-------------------------|----------------------------------------|
| First name        | `fields[name]`          | Built-in MailerLite field              |
| Last name         | `fields[last_name]`     | Built-in MailerLite field              |
| Email             | `fields[email]`         | Built-in MailerLite field              |
| Phone             | `fields[phone]`         | Built-in MailerLite field              |
| I'm interested in | `fields[interest]`      | **Create as custom text field**        |
| Message           | `fields[message]`       | **Create as custom text field**        |

**Before launch: create `interest` and `message` as custom fields.** MailerLite → Subscribers → Fields → Add field → type Text → field key exactly `interest` (then again for `message`). If you skip this, MailerLite accepts the submission but silently drops those two values. Email, name, last_name and phone are built-in and need no setup.

## Deploy in four steps

1. Push this folder to a new GitHub repo.
2. In Netlify, New site → Import an existing project → pick the repo.
3. Deploy. No environment variables, no build settings to change.
4. Point your custom domain at the site once you're happy (see the earlier DNS/GoDaddy instructions).

## Verification checklist after deploy

- [ ] Hero image, aerial map and logo all load.
- [ ] Brochure PDF downloads on click.
- [ ] Submit a real test enquiry. The form should hide and the thank-you message should replace it in-place.
- [ ] MailerLite → Subscribers shows your test lead with name, last name, phone populated.
- [ ] If `interest` and `message` custom fields were created, confirm they're populated too.
- [ ] The test lead landed in the correct group (whichever group is wired up on the form in MailerLite).

## Debugging if a submission silently fails

Open the site, right-click the form, Inspect, and watch the Network tab when you submit. You'll see a request to `assets.mailerlite.com/.../subscribe`. Click it and check the response.

- `{"success": true, ...}` → lead saved. If it's not showing in MailerLite, check the form's status in MailerLite (pause vs active) and which group it feeds into.
- HTTP 422 or `success: false` with a validation message → usually an email already on the suppression list, or a reCAPTCHA flag. MailerLite returns the specific reason in the response body.

If you see CORS errors, confirm the form's `action` URL hasn't been mangled and the `ml-submit` hidden input is still present. Both are required for MailerLite to accept the request.

## Editing content

Text lives directly in `index.html`. Prices, unit table, agent contacts, and the walk-times list are all plain HTML. Grep for the section you want to change — for example searching "Units 1-3" finds the residences caption.

## Notes on the design

Built from the `landing.html` prototype in the Rosefern handoff bundle. Production changes vs the prototype:

- Stripped the Tweaks panel and the postMessage edit-mode bridge (prototype-only).
- Locked the accent colour to Olive (`#5a6346`), matching the prototype default.
- Swapped the placeholder form handler for a live MailerLite embedded form.
- Added meta tags for Open Graph / Twitter previews.
- Set cache headers so images are immutable and the HTML always revalidates.

## If you ever want to change the MailerLite form

Generate a new embedded form in MailerLite, copy the new account ID and form ID from the snippet, and update three places in `index.html`:

1. The form's `action=` URL.
2. The `fetch("...takel")` call at the bottom of the page (same URL shape).
3. The wrapper `<div id="mlb2-XXXXX">` and the matching `ml_webform_success_XXXXX()` function name.

MailerLite's IDs flow through these three spots; the rest of the form is ours.
