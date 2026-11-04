# Morven — publish the 20 new garments as real shop products

This upgrade removes the separate, non-purchasable photo-preview feed and provides **Seller Dashboard → New Collection** at `/seller/import-collection`.

## What changed
- Product prices, sizes, names and descriptions are reviewed in the seller tool.
- The 20 new photos are uploaded **to Cloudinary**, not served from the local preview folder after import.
- On seller confirmation, each new garment becomes a genuine MongoDB Product with an ID, image URL, price, sizes, description and product details page. Normal cart and Paystack checkout apply.
- The 20 items take over the main homepage and Shop listings, in the same compact Alibaba-inspired layout. Product cards preserve garment fit inside 4:5 boxes.
- Earlier products are **archived** (`isActive=false`) rather than deleted, so previous order records retain their product associations.
- The public product list and checkout reject archived records.
- Existing customer phone number, location, two navbars and existing Paystack integration are not changed.

## IMPORTANT: exact prices and sizes are not in the supplied photos
The seller tool offers editable **starting prices based on older products of the same category**. It does not guarantee that those prices are correct for these 20 garments, and categories without any earlier examples remain blank. Before publishing, check and approve all 20 selling prices and currently available sizes. Do not offer a size your business cannot supply. Product names/descriptions are visually descriptive drafts and should be confirmed.

## How to import on Windows (local/staging)

1. Download and extract `Morven_20_Shop_Ready_Photos.zip` into your QuickCart project directory. Your screenshots already showed `public/morven-showcase` working locally; you need not extract it again if it remains there.
2. Pull the GitHub draft branch into VS Code, stop and restart `npm run dev`.
3. Sign in using the Clerk account with `publicMetadata.role = "seller"`.
4. In Seller Dashboard select **New Collection**, or visit `http://localhost:3000/seller/import-collection`.
5. Review each item; enter/confirm regular price, selling price, name, description, and **sizes actually in stock**. For multiple garments in the same category, use **Copy to all** only when their sizes match.
6. Click **Publish 20 & Archive Old Products** and confirm. The process uploads images in small batches to Cloudinary, then changes the active catalog in a single MongoDB transaction.
7. Verify `/`, `/all-products`, each `/product/<id>`, and size-aware cart and Paystack **test** checkout.

## Safety and deployment
- **Deploy/test the new code before publishing against the live MongoDB database.** If your local `.env.local` points to the production DB, the action will update that database, even from localhost. Back up your MongoDB Product collection before publishing.
- If an individual image upload fails, older products remain visible until the final switch. Retrying reuses previously uploaded Cloudinary images.
- Public photo assets are only required in the environment where you run the seller upload wizard. Published product photos are served from Cloudinary, so they remain available after deployment without committing the original ZIP to GitHub.
- The final catalog switch needs a MongoDB deployment that supports transactions (MongoDB Atlas does).
- **No database mutation was performed by the GitHub changes themselves.** The catalog changes only when an authorized seller presses Publish and confirms.
- Check that the original public repository's leaked environment credentials have been rotated.
