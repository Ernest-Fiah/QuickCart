# MORVEN GHANA — FINAL GO-LIVE CHECKLIST
Last reviewed: 4 November 2026  
Project: Ernest-Fiah/QuickCart  
Current implementation: draft GitHub PR #4 (built on earlier draft PRs). This is **not** proof that the live store or catalog has been published.

## Status key
- [x] Implemented in the current review branch; still verify it behaves correctly in staging.
- [ ] Not verified, needs setup, a business decision, or additional work before launch.

## P0 — MUST COMPLETE BEFORE TAKING LIVE PAYMENTS

### 1. Repository and security
- [x] Remove tracked `.env` / `.env.local` from the draft code and ignore future local environment files.
- [ ] **Rotate all exposed credentials** from the public main branch and its Git history: Paystack secret, Clerk secret, MongoDB credentials, Cloudinary secret, Inngest keys, and any other exposed tokens. Revoking old keys is essential; deleting files from new commits does **not** undo exposure.
- [ ] Apply GitHub's sensitive-data-removal procedure to history if required; audit git history and deploy logs for leaks.
- [ ] Confirm `.env.local` stays local, GitHub secrets are correctly scoped, and Vercel holds only rotated environment values.
- [ ] Keep production, staging, and local databases and Paystack keys separate; never run staging catalog updates against production.
- [ ] Merge/rebase the dependent PR chain carefully (PR #1 -> PR #3 -> PR #4; PR #2 is a separate overlapping checkout implementation); do not merge two conflicting implementations blindly.
- [ ] Verify Clerk seller/admin roles, restricted APIs, and that regular users cannot access seller actions.

### 2. Payments, order completion, pricing
- [x] Paystack initialization and server-side verification/webhook handlers are implemented in the review code.
- [ ] Set **new** Paystack test credentials and the public HTTPS webhook endpoint `/api/paystack/webhook`; verify signature checks and retries.
- [ ] Run successful, failed, abandoned, cancelled, and duplicate-callback/webhook sandbox transactions.
- [ ] Confirm only a paid and verified transaction creates a paid order exactly once; never trust a client-supplied amount, reference, address, or size.
- [ ] Confirm customer's order history and seller orders show the same amount, size, payment status, and Paystack reference.
- [ ] Confirm Ghana VAT/levies with accounting: the existing 2% checkout rule is **not** an approved tax determination.
- [ ] Set shipping fee, delivery zones, timelines, free-delivery thresholds and returns/refunds policy; replace placeholder assumptions if inaccurate.
- [ ] Add/verify order receipt (email or WhatsApp), invoice/receipt number, fulfilment updates, cancellations and refund workflow.
- [ ] Only switch to Paystack **live** keys after all test-mode checks pass and merchant account configuration is confirmed.

### 3. Product catalog and sizes
- [x] Product, cart and order code accepts clothing size choices in the current review branch.
- [ ] Confirm real sizes per suit, formal shirt, polo, knitwear, shoe and trouser; configure each product's true available sizes.
- [ ] Confirm the 20 new garment names, categories, descriptions, prices and photo-to-product matching in Seller > New Collection.
- [ ] Ensure all original 20 image files are accessible to the import tool and backed up. The code alone does not upload local pictures to Cloudinary.
- [ ] Back up MongoDB before seller approval and publishing/archiving the old catalog; use a staging database first.
- [ ] Confirm products appear on Home/Shop/Product after import and archives remain hidden but previous orders stay intact.
- [ ] Add **quantity-by-size inventory** and oversell protection before claiming precise stock availability; the current implementation tracks size options, not stock counts.
- [ ] Test two sizes of the same shirt in one cart, cart edits, unavailable sizes, discontinued products and exact amounts.

### 4. Build, compatibility and live settings
- [ ] Run `npm ci`, `npm test`, `npm run lint`, `npm run build` on the final merged commit; review all GitHub Actions jobs and resolve any failure.
- [ ] Set actual store domain, SSL, canonical host, DNS and `NEXT_PUBLIC_APP_URL` callback origin. Check Vercel custom domain.
- [ ] Verify Clerk allowed domains and redirect URLs, Cloudinary configuration, MongoDB network permissions, Inngest integration and Paystack callback URLs.
- [ ] Test mobile at 320/360/375/390/430 px, tablet at 768 px, desktop at 1024/1440 px (iOS and Android if available).
- [ ] Confirm both fixed navbars never obscure the homepage search bar or the top of other pages; inspect header behavior with menus open and scroll.

## P1 — HIGH-IMPACT SHOPPING AND CONVERSION IMPROVEMENTS

### Search and discovery
- [x] Basic client-side product-name/category/description search and category filters already exist on the homepage.
- [ ] Test search results, empty queries, zero matches, accents/spelling, typos, mixed capitalization and mobile keyboard submit.
- [ ] Add useful **server-side indexed search** when catalog size warrants it: indexed product text, pagination and category/size/price/color filters. Consider Typesense, Meilisearch or Algolia only if needed; avoid paying for search before validating traffic and catalog size.
- [ ] Add autosuggestions, popular searches based on actual data, recent searches with consent, and a clear "no results" state.
- [ ] Change “Browsing history” and “Fast-selling” labels if they are not backed by real browsing/sales data; currently those tiles select recent/category products rather than measured history/sales.
- [ ] Implement sorting (newest, price low/high, popularity when measured) and useful breadcrumbs.

### Product presentation and trust
- [x] Homepage mobile nav offset, search styling and discovery product-photo proportions improved in the review branch.
- [ ] Review card photo visibility on real devices; ensure no suit/shirt information is lost to crop or small source images.
- [ ] Publish a useful size guide (measurements in cm/in, garment-specific guidance and fit types).
- [ ] Add real color options, multiple high-resolution photos, care instructions and truthful fabric/material specifications.
- [ ] Remove any fake reviews, invented stock claims or promotional counts; collect verified buyer reviews after fulfillment.
- [ ] Provide clear Ghana contact number, shop location/map, genuine support hours, WhatsApp order support and a working contact form.
- [ ] Verify Wishlist, promo-code and newsletter buttons actually perform their indicated actions, or remove/disable them visibly.
- [ ] Provide clear empty-cart state, loading/error states, accessible labels, keyboard focus and checkout reassurance.

### SEO, performance and analytics
- [ ] Replace generic metadata description with a useful Morven Ghana title and description, plus social sharing Open Graph image.
- [ ] Generate sitemap.xml, robots.txt and canonical URLs; add product-specific metadata and schema.org Product/Offer markup using true prices and availability.
- [ ] Connect Google Search Console and submit sitemap; check indexing, broken pages and 404 redirects.
- [ ] Connect appropriate privacy-conscious analytics and conversion tracking (view product, add to cart, begin checkout, paid order). Follow consent rules for marketing cookies.
- [ ] Optimize large clothing images and homepage loading; audit Next Image `unoptimized`, image dimensions, caching and lazy loading; verify Lighthouse mobile Core Web Vitals.
- [ ] Paginate product-list API when catalog becomes large instead of returning all products per visitor.
- [ ] Add understandable Terms, Privacy, Shipping and Returns policies and ensure their footer links work.

## P2 — AFTER THE ESSENTIAL LAUNCH
- [ ] Add order tracking timeline and optional customer notifications by email/SMS/WhatsApp (only with appropriate consent).
- [ ] Add stock-low alerts, seller inventory editing and promotions with validated discounts.
- [ ] Add truly dynamic recommendations (related items, bestsellers) based on purchases/views, with no fabricated popularity metrics.
- [ ] Add Abandoned-cart reminders with consent and opt-outs.
- [ ] Add gift voucher redemption and accounting after defining voucher rules, balances and fraud protections.
- [ ] Add the GBA/legal garments order form as a separate validated workflow if needed; keep special-order garments distinct from ordinary instant checkout.
- [ ] Create a launch-day rollback plan, DB backup, error monitoring, uptime monitoring and a named support contact for failed orders.

## Release decision
**Do NOT enable live payments** until P0 items are checked, exposed keys are rotated, the final merged branch has green CI, and a real buyer-to-Paystack-test-order-to-seller-fulfilment flow works end to end.

## Useful review links
- Current UI/catalog draft: https://github.com/Ernest-Fiah/QuickCart/pull/4
- First prelaunch payment/size hardening: https://github.com/Ernest-Fiah/QuickCart/pull/1
- Alternative checkout hardening draft to reconcile: https://github.com/Ernest-Fiah/QuickCart/pull/2
- Product detail draft: https://github.com/Ernest-Fiah/QuickCart/pull/3
- Existing catalog instructions: `MORVEN_20_CATALOG_IMPORT.md`
- Existing security/payment instructions: `MORVEN_PRELAUNCH_REVIEW.md`
