export default function Loader({
  color = "border-blue-500",
}: {
  color?: string;
}) {
  return (
    <div className="flex items-center justify-center">
      <div
        className={`animate-spin rounded-full border-2 h-4 w-4 border-t-transparent ${color}`}
      ></div>
    </div>
  );
}
