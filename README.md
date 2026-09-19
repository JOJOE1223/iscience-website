# IScience website

This is the local Version 1 site for **IScience**, an emerging Western Cape agricultural-science and technical-development business.

## Current pages

- Home: `/`
- About: `/about/`
- Contact: `/contact/`
- Feed Cost Calculator: `/calculator/`

This existing static site is configured for GitHub Pages in `JOJOE1223/iscience-website`, with `iscience.co.za` as the canonical custom domain. See [deployment notes](docs/github-pages-deployment.md) for current rollout status, DNS instructions and verification evidence.

## Technology and structure

The site uses semantic HTML, shared CSS, and minimal vanilla JavaScript.

- `index.html` — Home content and homepage sections.
- `about/index.html` — About page content.
- `contact/index.html` — Contact page content.
- `calculator/index.html` — Feed cost calculator interface and scientific/legal guardrail.
- `calculator/calculator-engine.js` — Pure calculations, validation, warnings and display formatting.
- `calculator/calculator-state.js` — Ingredient add, remove, example and reset state operations.
- `calculator/calculator.js` — Browser rendering, events and automatic recalculation.
- `styles.css` — Shared dark-blue/light-blue design system, responsive layout and focus states.
- `script.js` — Accessible mobile navigation behavior.
- `assets/iscience-logo.png` — Supplied official logo asset.
- `serve.mjs` — Small Node.js local preview server.
- `tests/site-smoke.mjs` — Local structural and claim-safety smoke checks.
- `tests/calculator-engine.test.mjs` — Calculation and validation unit tests.
- `tests/calculator-ui.test.mjs` — Ingredient collection interaction-state tests.

## Feed cost calculator

The calculator uses the entered inclusion percentages exactly and never normalises them. Ingredient contribution is `(inclusion / 100) × price per tonne`. Total production cost adds ingredient, manufacturing, transport and other costs. Suggested selling price uses gross margin as a percentage of selling price: `production cost / (1 - margin / 100)`.

The example data demonstrates costing behavior only. The calculator does not formulate diets, assess nutrition or provide ingredient recommendations.

Navigation is defined in each page header and footer. To add a future page, create its directory and `index.html`, link it only after it contains substantive content, and reuse the shared stylesheet/script.

## Preview locally

From this directory, run:

```powershell
node serve.mjs
```

Then open [http://localhost:4173/](http://localhost:4173/). Keep the server running while testing direct page URLs such as `/about/` and `/contact/`.

Run the structural checks with:

```powershell
node tests/site-smoke.mjs
```

Run the calculation and interaction-state tests with:

```powershell
node --test tests/calculator-engine.test.mjs tests/calculator-ui.test.mjs
```

Run JavaScript syntax checks with:

```powershell
node --check calculator/calculator-engine.js
node --check calculator/calculator-state.js
node --check calculator/calculator.js
```

## Brand and contact rules

Use the visible business name exactly as `IScience`. The supplied logo is the canonical brand asset and must not be stretched, recoloured or redesigned.

`info@iscience.co.za` is currently shown as pending mailbox activation, so the local site does not publish a functioning `mailto:` CTA and does not include a fake contact form. Enable the normal email link only after the mailbox is confirmed operational.

## Future roadmap

Expertise, Research & Innovation, Products, Resources, and News/Updates are future areas rather than published pages. The Home page currently contains meaningful Expertise and Research & Innovation sections, so those navigation items link to real homepage sections instead of empty pages.

## Static deployment

The site has no build step or backend. Deploy it by preserving the directory structure and publishing the static files through a host such as GitHub Pages, Cloudflare Pages or Netlify.

GitHub Pages publishes through `.github/workflows/pages.yml` on pushes to `main` or a manual workflow dispatch. The workflow runs the existing checks and copies only the public HTML, CSS, JavaScript, logo and page directories into the Pages artifact. No bundler or redesign is involved; local notes, tests and development tools are not part of the website artifact. GitHub Pages settings must use GitHub Actions as the publishing source and `iscience.co.za` as the custom domain.

Keep MX, SPF, DKIM, DMARC and other email records unchanged when connecting the website. The `www` CNAME must target `jojoe1223.github.io`, matching the publishing GitHub account. Enable Enforce HTTPS after GitHub provisions the custom-domain certificate. Verify `/`, `/about/`, `/contact/`, `/calculator/`, modules, styles and the logo after deployment.
