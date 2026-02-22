# Relax Massage Egypt Landing

Static one-page landing with EN/AR switching, RTL support, and editable content via CMS.

## How content editing works

- Client edits content in CMS UI (`/admin`), not in code.
- Content source of truth is `content/site-content.json`.
- Frontend reads this JSON at runtime and renders:
  - bilingual text (EN/AR)
  - services list
  - services expandable details (full description, duration, price)
  - benefits list
  - testimonials list
  - about photo
  - WhatsApp/phone links

## Main files

- `page.html` - visual markup + hooks for dynamic content
- `page.css` - visual styles
- `js/site-config.js` - fallback runtime settings (used if CMS values are empty)
- `js/app.js` - content loading, i18n, RTL/LTR, dynamic lists, contacts, SEO, GA4
- `content/site-content.json` - editable site content in both languages
- `admin/index.html` - Decap CMS entry page
- `admin/config.yml` - CMS form schema
- `robots.txt` - crawler rules
- `sitemap.xml` - sitemap

## Required values to replace before production

- `content/site-content.json` -> `contacts.whatsapp`
- `content/site-content.json` -> `contacts.phone`
- `content/site-content.json` -> `settings.siteUrl`
- `content/site-content.json` -> `settings.ga4MeasurementId` (optional, can be empty)

`robots.txt` and `sitemap.xml` are now generated from `settings.siteUrl`
by `npm run sync:seo` (also executed in `npm run build`).

## Local run

Do not open with `file://`. Run through a local HTTP server.

```powershell
python -m http.server 8080
```

Open:

`http://localhost:8080/page.html`

CMS locally:

`http://localhost:8080/admin/`

In admin UI open the `Main Content` entry and use the preview pane (right side)
to see a rendered page layout. The preview has an internal EN/AR toggle.

Service expanded info is edited in:
`Main Content` -> `Services` -> `Items` -> each item:
`Description (Card Short)`, `Full Details (Expanded)`, `Duration (Expanded)`, `Price (Expanded)`.

## Full local CMS test (with save)

To test Decap save flow before deploy, run local backend proxy.

Terminal 1:

```powershell
python -m http.server 8080
```

Terminal 2:

```powershell
npm run cms:proxy
```

Then open:

`http://localhost:8080/admin/?local_backend=true`

Now you can edit and save content into `content/site-content.json` locally.

## Validation commands

Run these checks before every handoff:

```powershell
npm run check
```

What it verifies:

- `content/site-content.json` has required EN/AR fields and lists
- `page.html` still contains required functional hooks

To sync SEO files manually:

```powershell
npm run sync:seo
```

## CMS setup for Netlify

1. Deploy repository to Netlify.
2. Enable Identity in Netlify project settings.
3. Enable Git Gateway in Netlify Identity settings.
4. Invite the client user (email) to CMS.
5. Client logs into `/admin` and edits content.
6. Build command is already configured in `netlify.toml` (`npm run build`), so sitemap and robots are synced automatically on deploy.

## Moderator guide (for client/editor)

### 1. Login
1. Open `https://YOUR-DOMAIN/admin/`.
2. Enter email/password from Netlify Identity invitation.
3. Open collection: `Site Content`.
4. Open file: `Main Content`.

### 2. Preview usage
1. Use preview pane on the right side.
2. Use top preview switch to check `English` / `Arabic`.
3. In `Services` cards, click `View details` / `Hide details` button in preview to test expanded state.
4. If preview still looks old:
1. hard refresh (`Ctrl + F5`);
2. reopen in Incognito;
3. check URL is `/admin/` on deployed domain, not stale local tab.

### 3. What each editor block controls
1. `Site Settings`
1. `Site URL` - domain used for SEO URL, robots, sitemap.
2. `GA4 Measurement ID` - analytics ID (`G-...`), optional.
2. `Services`
1. `Details Button (Open/Close)` - button text on service cards.
2. Inside each `Item`:
1. `Description (Card Short)` - short text shown before expand.
2. `Full Details (Expanded)` - full procedure description.
3. `Duration (Expanded)` - procedure length.
4. `Price (Expanded)` - price text.
3. `Contact Links`
1. `WhatsApp URL` - full link format `https://wa.me/...`.
2. `Phone Number` - phone shown as click-to-call.
4. Other sections (`Hero`, `About`, `Benefits`, `Testimonials`, `Contact`, `Footer`) are bilingual EN/AR text blocks.

### 4. Safe publish flow
1. Edit EN text and matching AR text.
2. Check preview in both languages.
3. Click `Save`.
4. Click `Publish`.
5. Open public site and verify:
1. language switch;
2. services expand button;
3. WhatsApp/phone links;
4. updated text/price/duration.

### 5. Common mistakes to avoid
1. Do not remove Arabic values if English is changed.
2. Keep WhatsApp link in full URL format.
3. Do not paste phone with letters/symbol noise.
4. Do not clear `Site URL` in `Site Settings`.
5. If `GA4 Measurement ID` is unknown, leave it empty.

## Pre-delivery QA checklist

1. Open site and verify EN default + language toggle works.
2. Switch to AR and verify text + `dir=rtl`.
3. In admin, edit one field in EN and AR, publish/save, refresh site.
4. Add a service item, benefit item, testimonial item, verify render.
5. Upload About image, verify it appears on page.
6. Update WhatsApp and phone, verify CTA links.
7. Update `settings.siteUrl` in admin and verify generated `robots.txt` / `sitemap.xml` domain after build/deploy.
8. (Optional) set `settings.ga4MeasurementId` and verify GA4 script appears in page source.
9. Run `npm run check`.

## Visual handoff rule

When replacing visual layout in `page.html`/`page.css`, keep these attributes:

- `data-i18n`
- `data-action="toggle-language"`
- `data-contact="whatsapp"`
- `data-contact="phone"`
- `data-list="services"`
- `data-list="benefits"`
- `data-list="testimonials"`
- `data-about-image`
