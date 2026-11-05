// Images are the user's own Morven photo kit in public/morven-showcase.
// Product names are editable descriptive drafts, NOT confirmed SKU/stock information.
const rows = [
  ["01-brown-pinstripe-double-breasted-suit.webp","Brown Pinstripe Double-Breasted Suit","SUIT","Brown pinstriped double-breasted suit with a formal silhouette, shown with a white shirt. Check measurements and fabric details before purchase."],
  ["02-blue-pinstripe-double-breasted-suit.webp","Blue Pinstripe Double-Breasted Suit","SUIT","Blue pinstriped double-breasted suit for tailored formal styling. Contact Morven for fit and fabric details."],
  ["03-grey-suit-with-burgundy-tie.webp","Grey Suit with Burgundy Tie","SUIT","Grey double-breasted suit shown with a burgundy tie. Tie and shirt are styling references unless included in the confirmed order."],
  ["04-grey-double-breasted-suit.webp","Grey Double-Breasted Suit","SUIT","Grey double-breasted formal suit with peak lapels and a classic tailored appearance."],
  ["05-taupe-double-breasted-suit.webp","Taupe Double-Breasted Suit","SUIT","Taupe double-breasted suit with coordinated trousers, presented in a neutral tone for formal occasions."],
  ["06-light-grey-suit-with-striped-tie.webp","Light Grey Suit with Striped Tie","SUIT","Light grey striped double-breasted suit shown with a contrasting striped tie. Confirm whether accessories are included."],
  ["07-textured-grey-suit.webp","Textured Grey Double-Breasted Suit","SUIT","Grey-toned double-breasted suit with a textured appearance. Suitable styling inspiration for business occasions."],
  ["08-taupe-business-suit.webp","Taupe Business Suit","SUIT","Taupe double-breasted suit with a white shirt, designed for a polished business wardrobe."],
  ["09-dark-brown-pinstripe-suit.webp","Dark Brown Pinstripe Suit","SUIT","Dark brown pinstripe double-breasted suit with coordinated trousers and a classic formal shape."],
  ["10-black-double-breasted-suit.webp","Black Double-Breasted Suit","SUIT","Black double-breasted suit with matching trousers, presented for formal and occasion wear."],
  ["11-ivory-double-breasted-suit.webp","Ivory Double-Breasted Suit","SUIT","Ivory double-breasted suit with a clean, light formal look and matching trousers."],
  ["12-white-long-sleeve-dress-shirt.webp","White Long-Sleeve Dress Shirt","SHIRT","White collared long-sleeve dress shirt, suited to business and formal styling."],
  ["13-beige-button-front-knitwear.webp","Beige Button-Front Knitwear","KNITWEAR","Beige knitted button-front cardigan with a relaxed collar and coordinated neutral styling."],
  ["14-cream-half-zip-sweatshirt.webp","Cream Half-Zip Sweatshirt","SWEATSHIRT","Cream long-sleeve half-zip sweatshirt with a stand collar for relaxed smart-casual outfits."],
  ["15-navy-pinstripe-suit.webp","Navy Pinstripe Suit","SUIT","Navy double-breasted pinstripe suit with matching trousers, shown with a light shirt."],
  ["16-black-short-sleeve-polo.webp","Black Short-Sleeve Polo","T-SHIRT","Black short-sleeve polo shirt with a neat collar and button placket."],
  ["17-navy-button-front-knitwear.webp","Navy Button-Front Knitwear","KNITWEAR","Navy knitted button-front cardigan with long sleeves for smart-casual styling."],
  ["18-red-polo-shirt.webp","Red Polo Shirt","T-SHIRT","Red short-sleeve polo shirt with a classic collar and button placket."],
  ["19-beige-polo-shirt.webp","Beige Polo Shirt","T-SHIRT","Beige short-sleeve polo shirt with a collared neckline and clean, understated design."],
  ["20-charcoal-grey-polo-shirt.webp","Charcoal Grey Polo Shirt","T-SHIRT","Charcoal grey short-sleeve polo shirt with a button placket and subtle chest detailing."],
];

// Owner-requested November 2026 indicative GH₵ prices: no fictitious discount.
// Seller still confirms size availability and reviews each item before publication.
export const MORVEN_COLLECTION_PRICES_GHS = [5650,6350,5300,4700,4950,5850,3950,4500,6500,7000,6700,760,480,800,6200,384,800,400,480,400];
export const MORVEN_NEW_COLLECTION = rows.map(([filename, name, category, description], index) => ({
  sourceKey: filename.replace(/\.webp$/, ""),
  filename,
  image: "/morven-showcase/" + filename,
  name,
  category,
  description,
  price: MORVEN_COLLECTION_PRICES_GHS[index],
  offerPrice: MORVEN_COLLECTION_PRICES_GHS[index],
}));
export const MORVEN_COLLECTION_KEYS = MORVEN_NEW_COLLECTION.map(item => item.sourceKey);
