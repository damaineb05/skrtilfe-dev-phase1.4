/**
 * WearableShimmer — loading skeleton for wearable items.
 * Shows 3 placeholder cards with shimmer animation.
 */
export default function WearableShimmer({ count = 3 }) {
  return (
    <div className="space-y-2 p-3">
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className="shimmer rounded-xl h-16 w-full"
          style={{ opacity: 1 - i * 0.2 }}
        />
      ))}
    </div>
  );
}