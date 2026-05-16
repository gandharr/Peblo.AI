export default function Logo({ className = "" }: { className?: string }) {
  return (
    <div className={`flex items-center ${className}`}>
      <span className="text-2xl font-bold tracking-tight text-white/90">
        Peblo<span className="text-indigo-500">.</span>
      </span>
    </div>
  );
}
