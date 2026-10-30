# Meridian Press — Testing Checklist

Run through this before launch and after every catalogue change.

## Layout & responsiveness
- [ ] 375px mobile: header menu opens/closes, hero reads without sideways scroll, book cards stack, survey wizard thumb-friendly
- [ ] 768px tablet and 1440px desktop: grid alignment, section rhythm, no overflow
- [ ] Reduced-motion setting: no float/marquee/reveal animation
- [ ] Print stylesheet sanity on legal pages (optional)

## Navigation & links
- [ ] Header links: Home, Explore Books, Discover Your Interests, About, Contact
- [ ] Footer links incl. Privacy / Terms / Refunds / Cookie anchor `/privacy#cookies`
- [ ] Category cards → correct `/collections/*` page
- [ ] Book cards → correct `/books/*` page; "Back to all books" returns
- [ ] External buttons open new tabs only when URLs are configured

## Forms
- [ ] Survey: step gates block empty steps; "Other" requires a description; challenge requires ≥3 chars
- [ ] Survey: honeypot filled → success shown, **no** DB row (check `survey_responses`)
- [ ] Survey: submit without email → row stored, email `null`, no subscription created
- [ ] Survey: email + consent ticked → row stored **and** `survey` subscription created (pending)
- [ ] Survey: success message shows the exact thank-you copy
- [ ] Newsletter: consent box unticked → submit disabled; ticked + email → pending row + (if Resend configured) confirmation email
- [ ] `/confirm?token=` flips status to `confirmed`; `/unsubscribe?token=` flips to `unsubscribed`
- [ ] Guide: valid email → instant PDF download works (`/downloads/seven-questions-reader-guide.pdf`), email sent only if Resend configured
- [ ] Rate limiting: 9+ rapid submissions → 429 with friendly error
- [ ] Error copy renders on network failure (disable network in devtools and submit)

## Checkout & commerce
- [ ] In-development books show "Concept preview", no price, no fake buy button
- [ ] After setting `status='available'` + `price_cents` + `gumroad_url`: price renders, Gumroad button links to the correct product
- [ ] Clicking buy fires `purchase_cta_clicked` + `checkout_initiated` (see `/admin`), never `purchase_confirmed`
- [ ] Gumroad Ping (with `GUMROAD_SELLER_ID` set) writes `purchase_confirmed`; refund ping writes `refund_recorded`
- [ ] Amazon region buttons appear only for configured marketplaces
- [ ] UPI block renders only when `upi_pay_url` is set, labelled INR

## Analytics
- [ ] `/admin` requires token; exports download CSVs
- [ ] Dashboard numbers equal raw SQL counts from `analytics_events`
- [ ] Events contain no emails/names (spot-check `params` column)
- [ ] With `NEXT_PUBLIC_GA_ID` set: GA4 Realtime shows `page_view` + custom events
- [ ] UTM parameters persist across pages and appear on events

## SEO & accessibility
- [ ] `/sitemap.xml` and `/robots.txt` respond; canonical tags present
- [ ] Unique `<title>`/description per route; OG image resolves
- [ ] One `<h1>` per page; logical heading order
- [ ] All images have descriptive alt text mentioning "concept" for covers
- [ ] Keyboard: tab order sane, focus rings visible, FAQ accordion toggles with Enter/Space, mobile menu `aria-expanded` works
- [ ] Contrast passes WCAG AA (esp. gold on ivory — used only for small-caps labels at sufficient weight/size)
- [ ] Lighthouse: 90+ performance/accessibility on mobile
