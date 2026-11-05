# Events by Luwa

Static website published from `main` at the repository root through GitHub Pages.
The custom domain is `https://eventsbyluwa.com`; keep `CNAME` in the publishing branch.

## Contact flows

- `assets/contact.js` contains public contact details and a shared FormSubmit client.
- Enquiries reset only after the provider confirms acceptance. Rejections, invalid responses,
  network failures, and timeouts keep the visitor's details and offer WhatsApp/email links.
- Booking requests validate every field. The visitor must press Send inside WhatsApp;
  opening a chat does not send a message. The email copy reports its own result.
- There is no subscription form, customer database, or private dashboard on this site.
- Email acceptance is not proof of inbox delivery. The owner must activate FormSubmit if
  prompted and confirm a real enquiry arrives before client handover. Test the Spam folder too.
- Do not put email-service API keys, passwords, customer records, or private analytics reports
  in this repository. `owner-guide.html` and `analytics.html` are publicly accessible reference pages.

## Checks

No npm dependencies are needed for the static validation and transport/cache tests:

```sh
node scripts/check-site.js
node --test tests/contact.test.cjs tests/sw.test.cjs
```

The Check website workflow runs these checks on pushes and pull requests.

For browser interaction checks:

```sh
python -m pip install playwright
python -m playwright install chromium
python tests/browser_smoke.py
```

The browser checks mock every form request and never send email. Set `LUWA_BROWSER_PATH`
to an existing Chromium executable when appropriate.

## Content and offline behavior

Gallery photos live in `assets/gallery/<category>/`. The existing gallery workflow optimises
uploads and regenerates `gallery.json`. Team photos are separate from the public event gallery.
The service worker caches only successful same-origin GET requests. It does not intercept
FormSubmit or other third-party services, and shows an offline page for uncached navigation.
Version shared CSS/JS URLs when publishing changes and update the service-worker cache version.

Analytics is disabled until a real measurement ID is supplied. No live traffic numbers are invented.
