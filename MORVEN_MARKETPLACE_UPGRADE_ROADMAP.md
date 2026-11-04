# Morven Ghana — Marketplace Upgrade Roadmap (4 November 2026)

**Goal:** Build a high-trust, easy-to-shop single-brand menswear store. Borrow interaction patterns from Amazon, Alibaba and fashion specialists without copying their branding, inventing ratings, or operating unnecessary marketplace infrastructure.

## What exists in the current review branch
- Next.js frontend, Morven homepage/shop, Clerk sign-in, seller dashboard, product APIs, Cloudinary-backed images, MongoDB, Paystack integration.
- Product size selection and persistent selected sizes, with partial seller configuration.
- Category browsing, basic catalog search, newest-first feed, dynamic prices.
- **First upgrade committed:** real-product autocomplete suggestions and sort by newest / price, with tests. No third-party search API or key required.
- **Security hygiene PR:** https://github.com/Ernest-Fiah/QuickCart/pull/5 (draft; preserves integration code; must verify environment first).

## Order of execution

### Phase 0 — essential before accepting payments
1. Rotate exposed credentials, migrate runtime values to Vercel/local env and reconcile pending draft branches. Avoid assuming deleting Git files from the latest commit makes previously leaked keys safe.
2. Verify successful/cancelled Paystack sandbox payments, webhook signatures, idempotent order creation, shipping fee and correct Ghana taxes.
3. Enter accurate size availability per product and add inventory quantity per size before any automatic "in stock" claim.
4. Confirm the 20 products (images, sizes, GH₵ prices) in a *staging* DB, then publish after backup.
5. Checkout success, receipts, customer order history, seller fulfillment, refund process, policies and mobile QA.

### Phase 1 — quick conversion upgrades, minimal/new API costs
1. Search autocomplete and sort (implemented in current review branch); improve category and result count UX.
2. Add simple filters: category, in-stock size, GH₵ price range; only display product attributes actually recorded.
3. Build clear garment size charts (suits, shirts, polos, shoes) with fit descriptions. Validate measurements with Morven staff.
4. Wishlist and recently viewed products that actually save events (consent-aware where appropriate), replacing unsupported "Browsing history" claims.
5. "Complete the look": show matching suit, shirt, tie and shoe recommendations by category; not fake sales data.
6. Simplify mobile checkout and integrate a working WhatsApp enquiry link to the approved business number.
7. Add proper product search URLs, SEO metadata, sitemap, product structured data, and Search Console tracking.
8. Enable real verified-purchase reviews only after order fulfillment; never hardcode stars.

### Phase 2 — differentiate Morven
1. Shop by occasion: weddings, office, graduations, formal events, law practice.
2. Outfit builder/bundle calculator: jacket + trousers + shirt + tie; explicit individual and bundle price, validated server-side.
3. Product comparison for 2–4 garments: fabric, cut, fit, price and available size.
4. Corporate uniforms/first-job packages and lawyer/legal garments enquiry and measurement form.
5. Gift vouchers with balance, expiry, redemption and fraud-resistant server-side accounting.
6. Delivery progress updates and transactional notifications with opt-in marketing and opt-outs.

### Phase 3 — only when the catalog/traffic justify additional providers
1. Server-side indexed search (MongoDB Atlas Search, Meilisearch, Typesense, Algolia) with typo tolerance and facets, only when current client-side catalog search becomes slow/inadequate.
2. Image-based garment search, starting with a limited catalog matching proof of concept; needs image embeddings/service.
3. AI styling/fit assistant grounded **only in real product attributes and verified inventory**, not unverified size guarantees.
4. Personal recommendations based on purchases and opted-in browsing; avoid arbitrary "best seller" labels.
5. Inventory forecasting, abandoned cart workflows and marketing segmentation with appropriate consent.

## Competitive design references
- Amazon Alexa for Shopping (previously Rufus): conversational search, comparisons, recommendations, shopping history — https://www.aboutamazon.com/news/retail/alexa-for-shopping-ai-assistant
- Amazon visual search: Amazon Lens, image search — https://www.aboutamazon.com/news/retail/visual-search-shopping-features
- Alibaba discovery: AI search, file/image search, inquiries, order protection — https://about.alibaba.com/
- ASOS fit sizing and model measurements — https://www.asos.com/customer-care/product-stock/can-you-help-me-find-the-right-size/
- Zalando size-fit work — https://blog.zalando.com/en/technology/how-zalando-uses-technology-help-customers-find-right-size

## Acceptance criteria for launch
- A real customer can search a product, select a genuinely available size, pay safely via Paystack test mode, see an order with the correct quantity/size/amount and receive a working delivery/fulfillment update.
- Admin can add/edit/retire products, manage inventory per size and handle payment/refund exceptions.
- Security secrets are absent from the tracked code; all previously exposed credentials are rotated/revoked.
- Mobile at 320–430px and desktop at 1280–1440px are visually checked; no navbar/search overlap.
- Automated CI passes on the exact merged commit, and staging is tested end to end.

## Implementation notes
The existing frontend filter/search operates on downloaded catalog data. That is acceptable for a modest early catalog; performance and SEO will benefit from server-side pagination and indexed queries later. Avoid AI service costs until the basic search, product data, inventory and checkout are solid.
