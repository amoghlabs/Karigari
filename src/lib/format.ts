export function formatPrice(price: number): string {
  const value = Math.round(price * 100) / 100;
  return value.toLocaleString("en-IN", {
    style: "currency",
    currency: "INR",
    minimumFractionDigits: price % 1 === 0 ? 0 : 2,
    maximumFractionDigits: 2,
  });
}

export function formatDate(ts: number): string {
  return new Date(ts).toLocaleDateString("en-IN", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}