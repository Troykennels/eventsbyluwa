# Events by Luwa

Static website published from `main` at the repository root through GitHub Pages.
The custom domain is `https://eventsbyluwa.com`; keep `CNAME` in the publishing branch.

## Contact flows

- `assets/contact.js` contains the client's public business email and WhatsApp number.
- Enquiry and booking forms prepare the entered details in WhatsApp or the visitor's email app.
  The visitor must press Send in that app. Opening a chat or draft is not delivery.
- There are no background email requests, paid services, access keys, or form-provider accounts.
- The site preserves entered details and displays clickable alternatives if an app does not open.
- With JavaScript disabled, the contact page provides direct WhatsApp and email links.
- There is no subscription form, customer database, or private dashboard on this site.
- Do not put passwords or customer records in this repository. `owner-guide.html` and
  `analytics.html` are publicly accessible reference pages.

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
third-party services, and shows an offline page for uncached navigation.
Version shared CSS/JS URLs when publishing changes and update the service-worker cache version.

Analytics is disabled until a real measurement ID is supplied. No live traffic numbers are invented.
