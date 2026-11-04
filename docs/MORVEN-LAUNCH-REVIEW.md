# Morven checkout and sizing review — 4 November 2026

Reviewed source snapshot: 894242f56c303394b5ddd221d9210ca0be3468eb.

## Changes

- Fail closed when Clerk seller authorization errors.
- Disable the legacy unpaid order creation endpoint and its queued order writer.
- Require sign-in and payment ownership before verification; validate payment status, reference, GHS currency and amount.
- Add signed Paystack webhook processing at `/api/paystack/webhook`. Both webhook and browser verification use the payment document ID as the order ID, preventing duplicate inserts through MongoDB's built-in unique `_id` index. Orders are persisted before payment status becomes successful. Legacy successful payments are not recreated.
- Validate delivery-address ownership, product availability, sizes and integer quantities. Use server product prices and shared minor-unit totals.
- Preserve size, name and unit price in payments and orders. Different sizes have separate basket lines. Sellers can add sizes during product creation or use **Seller → Product list → Edit sizes** for existing products.
- Add a size-help page without inventing product measurement charts or available inventory.
- Preserve cart edits made during payment; clear the basket only when it exactly matches the purchased basket.
- Remove the nonfunctional promo-code field. Correct contact details; contact form opens an email draft instead of claiming a message was sent.
- Remove tracked environment files from this branch and ignore future environment files; add a blank `.env.example`.

## Validation

`npm test`: 10 tests passed, using Node's test runner and mocked service boundaries. Tests cover size keys, size/quantity rejection, money rounding, amount/currency/reference checks, seller authorization errors, payment ownership, signed webhooks and deterministic order writes.

`git diff --check`: passed at handoff.

`npm run build`: attempted, but could not start (`next: not found`). This environment has no installed project dependencies. No production build, rendered browser QA, live MongoDB test, Clerk sign-in test, Paystack test charge or mobile-wallet test has been completed. Mocked concurrency tests do not replace a real MongoDB callback/webhook race test.

## Required before production

1. Replace credentials previously committed in `.env`: Clerk secret, MongoDB credentials, Inngest signing/event keys, Cloudinary secret and Paystack secret as applicable. Update deployment settings. Removing the current files does not purge Git history or revoke credentials. Do not paste replacement secrets into GitHub or chat.
2. Reconcile pending payments and any queued legacy `order/created` events before switching over. Legacy successful payments are deliberately skipped to avoid duplicating their historical orders. Take a database backup. Review records with payment success but missing orders manually.
3. Configure fresh server secrets and the HTTPS production `NEXT_PUBLIC_APP_URL` in the hosting environment. Configure Paystack webhook URL as `https://YOUR-DOMAIN/api/paystack/webhook` in the correct test/live mode.
4. Set actual available size labels on all existing clothing/footwear products before reopening checkout. No sizes or stock counts were invented. Existing unsized cart items must be removed and re-added with a size.
5. Run `npm ci`, `npm test`, `npm run lint`, and `npm run build` in the full checkout with original assets and lockfile. Review dependency audit results and resolve build/lint failures before merging.
6. In Paystack test mode, exercise successful, failed, abandoned and delayed payments; close the browser after payment and verify webhook fulfillment; replay a webhook and race it with the callback; verify exactly one order. Check that a second user cannot verify another user's reference. Verify a later retry recovers after a temporary database outage.
7. Test two sizes of the same shirt through customer and seller order screens, quantity edits/removal, sign-out/sign-in, mobile layout, deleted products, unavailable sizes and edited carts during payment.

## Business decisions and remaining work

- The existing 2% tax and free-delivery assumptions are retained, with consistent rounding. These are not a determination of the correct tax or delivery policy. Confirm the actual business rules before launch.
- Available-size lists are supported; stock quantities, reservations and automatic stock deduction are not implemented. Do not treat the lists as guaranteed inventory. Define the required inventory/refund workflow before enabling scarce-stock sales.
- Footer policy/returns/delivery/FAQ links and social links still include placeholders. Publish approved business policies and replace these before launch; this change does not invent legal terms or return promises.
- No transactional order email, refund automation, shipment tracking or rate-limiting system was added. Decide operational ownership and configure appropriate protections before broad public launch.
- Existing legacy order/address references remain; product names are snapshotted for new payments, and deleted-product names use a safe fallback. Delivery addresses are not snapshotted in this change.
- This is a source review and focused corrective change, not certification that every page and external service is production-ready.

Paystack references: https://paystack.com/docs/payments/webhooks/ and https://paystack.com/docs/payments/verify-payments/.
