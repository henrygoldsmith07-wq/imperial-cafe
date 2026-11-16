# imperial-cafe

Independent zero-dependency static site for Henry Goldsmith. Open index.html via any static server. No build or paid services required.

## Functional scope
The form prepares a visible call note locally. Nothing is sent or booked; the note can be copied or read out over the phone. No payments, confirmed bookings, delivery promises or invented prices.

## Verify locally
Run `node verify.js` in the project root. It needs only Node.js — no install, build or network — and checks file presence, HTML/CSP/metadata integrity, CSS integrity and the form flow against a small DOM stub.

## Before owner launch
Confirm contact details, hours, service/menu content and accessibility needs with the owner. Independent web sources corroborate the address, phone number and Facebook page, but the newest found is dated 2023; no source confirms the cafe is still trading or that the owner authorises this site.

Search indexing is blocked deliberately. At approved launch, remove BOTH the `robots.txt` `Disallow: /` line and the `<meta name="robots" content="noindex,nofollow">` tag — while robots.txt blocks crawling, Google cannot read the noindex tag. Also replace the candidate GitHub Pages canonical, Open Graph and JSON-LD URLs with the real deployment URL, add a `Sitemap:` line to robots.txt, then submit and validate sitemap.xml. No merchant checkout is configured.

## Security and privacy
No third-party scripts, fonts, trackers or card handling. JavaScript is self-hosted and a restrictive content security policy blocks remote scripts, connections, frames, fonts, workers and media. Form input is inserted as text only. Nothing is stored or sent; visit details stay in the current tab. External links use `rel="noopener noreferrer"`.

Prepared 15 November 2026.

## Verification — 15 November 2026
Browser checks: 375px, 390px, 768px and 1440px widths; no horizontal overflow. Form flows exercised without sending an email or calling. All local assets, scripts, JSON-LD, single h1 and external-link protections checked. Not tested: live telephone ownership, owner acceptance, live checkout, Safari/Firefox, Lighthouse, formal WCAG certification or Google Rich Results.

## Verification — 16 November 2026
Code cleanup only: removed an unreachable name-validation branch and unused theme CSS, and made the date bounds use one consistent Europe/London calendar. Node DOM-stub checks passed for date bounds, generated note text, blank/whitespace name, out-of-range date and the honeypot. Browser, device, cross-browser, Lighthouse and WCAG checks from 15 November were not repeated after this change.

## Verification and research — 16 November 2026 (second pass)
Evidence-backed changes: tightened the CSP to `default-src 'none'` with explicit self-only sources and no unused `data:` allowance; added an explicit referrer policy; gave the dark planning panel a light focus outline (the old accent ring measured 1.44:1 against it); enlarged small link targets and added bottom scroll padding so the mobile action bar cannot obscure focus; removed redundant focus handling on the live status region; corrected stale README claims about email links and localStorage.

Checks re-run: static invariants (IDs, anchors, CSP, JSON-LD, external-link protections, CSS integrity) and the Node DOM-stub form harness — all passed. Text contrast was computed numerically and passes AA; the focus-ring fix addresses a measured failure. Still not done: browser, screen-reader, 320px/400% zoom, cross-browser, Lighthouse and formal WCAG testing. Research notes and the full report are in `research_notes/` and `reports/` beside this clone.

## Browser verification — 16 November 2026 (third pass)
Ran the page over a local HTTP server in Chromium. No console or CSP errors; the form produced the expected note end to end (name, enquiry, date and notes) with `role="status"` and no forced focus. The Copy note button was tested on both paths: a successful write shows "Note copied" and passes the exact note; a denied write selects the note text for the visitor and shows "Note selected — copy the highlighted text" (device-neutral, since phone users have no Ctrl key). Lighthouse scores: Accessibility **100**, Best Practices **100**, SEO **80**. The only SEO failure is the robots.txt audit, caused by the deliberate `Disallow: /` that blocks all crawling before owner launch — expected, and deliberately not changed. A screenshot was unavailable because no desktop window was visible, and no viewport-emulation tool was available, so 320px/400% zoom and mobile appearance remain unverified.

## Mobile layout fix — 16 November 2026 (fourth pass)
Measured the page in same-width iframes at 320, 375, 390 and 768px: no horizontal overflow and no text clipping in any element. That testing exposed a real bug — a global rule hid the first link in every `<nav>`, so the fixed mobile action bar showed only "Plan your visit" and omitted "Call the cafe". Scoped the rule to `header nav` in `style.css`; both actions now render at 320–390px (48px tall, no overflow), while the header navigation still collapses as intended. The `scroll-padding-bottom:100px` fix was confirmed active at mobile widths.

## Final tidy — 16 November 2026 (fifth pass)
Gave `404.html` the same strict content security policy as the main page, linked the previously orphaned `site.webmanifest` from `index.html`, and renamed the manifest to "Imperial Cafe". Browser reload confirmed the manifest resolves, the script still runs and the console is clean. A repeat Lighthouse run timed out, so the previously recorded scores stand; no new score is claimed after these cosmetic/metadata changes.

## Independent review fixes — 16 November 2026 (sixth pass)
Browser checks of the error paths confirmed the blank-name and honeypot behaviour, and that native date constraints (not custom code) reject out-of-range dates — so the unreachable custom date message was removed. A fresh-eyes review caught a regression from the earlier focus fix: the light outline had been applied to the whole dark planning panel, including the light form inside it, hiding focus on the form controls. It is now scoped to a dedicated `.planning-call` link, verified in the browser (light ring on that link, dark ring on `#name`). `verify.js` now also asserts that `app.js` is actually linked and that the light ring is not applied to the whole panel.

## Design detail — 16 November 2026
The three enquiry types are a set of options, not a sequence, so the list is now an unordered list without the decorative 01/02/03 markers; the CSS grid was simplified to match. Rendered desktop and mobile screenshots were reviewed, and `verify.js` guards the semantics against regression. A further Lighthouse re-run timed out, so no new score is claimed for this cosmetic change.

A final review also made the copy-denied instruction device-neutral (touch users have no Ctrl key) and tightened `verify.js`: it now checks `manifest-src` in the CSP and requires the indexing block in `robots.txt` and the `noindex` meta tag to be consistent — both present before launch, both removed after — so a half-completed launch is caught without the verifier failing once the block is lifted.

## Mobile section navigation — 16 November 2026
At widths up to 760px the header collapses to the call link, so a compact second nav under the header now links directly to "Your visit" and "Find us". It is hidden by default and shown only at mobile widths; a 375px screenshot confirmed both links render, and `verify.js` guards their presence and breakpoints. The bottom action bar keeps Call and Plan.

## Fresh audit — 16 November 2026
A headless anchor probe at ~1100px measured `#services` landing 50px below the viewport with `scroll-padding-top: 96px` on a static header — an offset with no fixed element to clear. The obsolete top padding was removed; `verify.js` guards against its return. Mobile bottom padding, needed for the fixed action bar, is unchanged.

axe-core (WCAG 2.0/2.1/2.2 A and AA plus best-practice rules) was run against the rendered page in Chromium: **0 site violations**, 41 passing rules, 0 incomplete. The single reported "region" finding belonged to the temporary audit output element, not the site. The 404 page now uses the same stylesheet, theme, header and branded actions as the main site; rendered checks at 1100px and 375px confirmed it. Edge headless rendering was checked at 800px and 375px and matched Chrome — header, section nav, hero, buttons and fixed action bar all render correctly with no overflow. A fresh Lighthouse 12.6.1 audit was run locally from a copied installation: desktop (1350px) and mobile (412px) both scored **Accessibility 100**, **Best Practices 100**, **SEO 58**. The only SEO failures are `is-crawlable` and `robots-txt`, caused by the deliberate pre-launch `noindex` and `Disallow: /`; they are expected until the owner approves launch and are not code defects. A later re-run after the 404 styling change returned the same scores.

Reflow and screen-reader semantics were checked with headless Chrome via puppeteer and the DevTools accessibility tree: at 320, 375 and 1280 CSS pixels both the main page and the 404 page had zero horizontal overflow, and no interactive element lacked an accessible name. The date control is exposed as role `Date` named "Preferred day". Live screen-reader announcement and manual 400% zoom still need a human, but the underlying markup and reflow checks pass.
