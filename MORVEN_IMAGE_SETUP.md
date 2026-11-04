# Morven storefront image fitting and 20-photo upload kit

## Why the photos were cropped
Morven's original WhatsApp photos are portrait (853 × 1280 px). The old shared `ProductCard` rendered photos with `object-cover` in a nearly square box, which crops the tops/bottoms of suits and garments. This revision gives cards a consistent 4:5 frame and uses `object-contain` so the clothing is not cut off.

## Included downloadable photo kit
The conversation download `Morven_20_Shop_Ready_Photos.zip` contains:
- 20 optimized **900 × 1125 px WebP** images of the submitted Morven garments, with no crop of the outfits.
- `public/morven-showcase/manifest.json` listing the photo filenames and descriptive draft titles.
- `README.txt` with installation instructions.

**The binary photo assets are supplied in the conversation ZIP, not inside this GitHub branch.** GitHub contains the preview UI and size-fitting code, so the previews automatically appear when these local assets are installed.

### Install the kit locally in VS Code project
1. Download the photo ZIP from the ChatGPT conversation.
2. Extract the ZIP **into the QuickCart project root** (for example `C:\Users\ernes\Desktop\QuickCart`). Do not create an extra nested folder.
3. Confirm the file `public/morven-showcase/manifest.json` exists, alongside the 20 `.webp` photos.
4. Pull this branch from GitHub and run `npm run dev`.
5. Open `http://localhost:3000` or `http://localhost:3000/all-products`. The non-purchasable preview collection appears automatically. If the files are not installed, the UI stays hidden and real product listings continue to work.

### Add the photos to the real store
To sell any item, open the **Seller Dashboard > Add Product** and upload its optimized photo, real product name, price, category, size availability, and description. The standard product database and Paystack checkout are unchanged. Once all photos are published as products, remove the `public/morven-showcase` preview directory to avoid duplicate photos in the preview section.

**Important:** The draft titles in the preview are descriptive and are not confirmed official product names. No prices, ratings, inventory counts, or paid orders are fabricated.

## Pages updated
- Homepage: tight Alibaba-inspired 6-column cards, taller image frames, optional photo previews
- Shop /all-products: shared portrait-fit product cards, optional photo previews
- Product details: related-product cards no longer crop garments
- Seller product list: portrait-fit thumbnails

The original two navbars, customer phone number, location, product records and checkout were not changed for this image-fitting task.
