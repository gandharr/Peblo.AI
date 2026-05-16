export default function Logo({ className = "", sizeClass = "text-xl" }: { className?: string; sizeClass?: string }) {
  return (
    <div className={`flex items-center ${className}`}>
      <span className="font-bold tracking-tight text-white/90">
        <span className={sizeClass}>Peblo</span>
        <span className={`text-indigo-500 ${sizeClass}`}>.</span>
      </span>
    </div>
  );
}
