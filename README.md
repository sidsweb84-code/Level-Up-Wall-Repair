# Level Up Wall Repair

Static website for Level Up Wall Repair — a Brisbane wall & ceiling repair specialist.

## Stack

Plain HTML pages, styled with [Tailwind CSS](https://tailwindcss.com/) (compiled via the Tailwind CLI, not the CDN build), plus a small amount of vanilla JS. No framework, no build tool beyond Tailwind.

## Project structure

```
index.html         Home
about.html          About
services.html       Services
gallery.html        Project gallery (before/after photos)
reviews.html        Google reviews
contact.html         Contact / quote form
assets/
  css/
    input.css        Tailwind source — edit this
    style.css         Compiled output — do not edit directly, it's regenerated
  js/main.js         Site interactivity (mobile menu, forms, sliders, filters, etc.)
  img/               Photos and logo
.artifacts/          A merged single-file version of the whole site (not needed for deployment)
```

## Local setup

```bash
npm install
npm run watch   # rebuilds assets/css/style.css on every change while you edit
```

Then just open any `.html` file in a browser, or serve the folder with any static server, e.g.:

```bash
npx serve .
```

## Editing

- Page content/markup: edit the `.html` files directly.
- Styling: edit `assets/css/input.css` (custom classes) or use Tailwind utility classes directly in the HTML. Run `npm run build` (or keep `npm run watch` running) to regenerate `assets/css/style.css` — **that compiled file is generated, don't hand-edit it.**
- Interactivity: `assets/js/main.js`.
- Images: `assets/img/`.

## Deploying to Vercel

This is a static site — no server, no build step is required for Vercel to serve it, but if you change `input.css` you do need to run `npm run build` first and commit the updated `assets/css/style.css` (Vercel won't run the Tailwind build for you unless you configure a build command).

1. Push this repo to GitHub.
2. In Vercel: **Add New Project → Import** the repo.
3. Framework preset: **Other** (or leave auto-detected as a static site).
4. Build command: `npm run build` (optional, only needed if you want Vercel to compile Tailwind on every deploy — otherwise just make sure `assets/css/style.css` is committed and up to date).
5. Output directory: leave as the project root (`.`).
6. Deploy.

## Contact form

The contact form (`contact.html`) currently validates and shows loading/success/error states in the UI, but there is **no backend or email service wired up** — submissions are not actually sent anywhere yet. Connect it to a form service (e.g. Formspree, Resend, a serverless function) before relying on it for real leads.
