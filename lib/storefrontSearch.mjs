// Dependency-free shop search for the existing Morven catalog.
// Text matching is intentionally deterministic and never fabricates results.
export const normalizeSearch = (value) =>
  String(value ?? "").normalize("NFD").replace(/[\u0300-\u036f]/g, "")
    .toLowerCase().replace(/[^a-z0-9]+/g, " ").trim();

export const matchesProductSearch = (product, query) => {
  const words = normalizeSearch(query).split(" ").filter(Boolean);
  if (!words.length) return true;
  const haystack = normalizeSearch([
    product?.name, product?.category, product?.description
  ].filter(Boolean).join(" "));
  return words.every(word => haystack.includes(word));
};

export const suggestProducts = (products, query, limit = 5) => {
  const needle = normalizeSearch(query);
  if (needle.length < 2) return [];
  return (products || [])
    .filter(product => product?._id && matchesProductSearch(product, needle))
    .sort((a, b) => {
      const aName = normalizeSearch(a.name);
      const bName = normalizeSearch(b.name);
      const aStarts = aName.startsWith(needle) ? 1 : 0;
      const bStarts = bName.startsWith(needle) ? 1 : 0;
      return bStarts - aStarts || Number(b.date || 0) - Number(a.date || 0);
    })
    .slice(0, Math.max(0, limit));
};

export const sortProducts = (products, sortBy = "newest") => {
  const items = [...(products || [])];
  if (sortBy === "price-low") {
    return items.sort((a, b) => Number(a.offerPrice || 0) - Number(b.offerPrice || 0));
  }
  if (sortBy === "price-high") {
    return items.sort((a, b) => Number(b.offerPrice || 0) - Number(a.offerPrice || 0));
  }
  return items.sort((a, b) => Number(b.date || 0) - Number(a.date || 0));
};
