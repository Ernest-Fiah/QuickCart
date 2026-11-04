import Link from 'next/link';
export const metadata = { title: 'Size guide | Morven Ghana' };
export default function SizeGuide() {
  return <main className="max-w-3xl mx-auto px-6 py-16 space-y-6">
    <Link href="/all-products" className="underline">Back to shop</Link>
    <h1 className="text-3xl font-medium">Find your fit</h1>
    <p>Available sizes are shown on each product page. Select a size before adding the item to your cart.</p>
    <h2 className="text-xl font-medium">Formal shirts</h2>
    <p>Measure around the base of your neck with a flexible tape, keeping enough room for a finger underneath. Compare the measurement with the labelled neck size, checking whether it uses inches or centimetres. 1 inch equals 2.54 cm.</p>
    <h2 className="text-xl font-medium">Polos and T-shirts</h2>
    <p>Use the label on a well-fitting shirt as a starting point. Letter sizes vary with style and fit; there is no universal conversion from S, M or L to a neck measurement.</p>
    <h2 className="text-xl font-medium">Suits, trousers and shoes</h2>
    <p>Compare with the size label on an item that fits you well. Confirm the sizing system and fit with our team before ordering if you are unsure.</p>
    <p>For help with a specific product, call <a href="tel:+233558788167" className="underline">055 878 8167</a> or visit our Spintex shop.</p>
  </main>;
}
