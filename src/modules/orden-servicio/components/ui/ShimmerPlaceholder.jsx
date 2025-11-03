// src/components/ui/ShimmerPlaceholder.jsx

export function ShimmerPlaceholder({
  height = '1.5rem',
  width = '100%',
  borderRadius = '6px',
}) {
  return (
    <div
      className="shimmer-placeholder"
      style={{ height, width, borderRadius }}
    ></div>
  );
}
