export default function Logo({ className = "" }: { className?: string }) {
  return (
    <div className={`flex items-center ${className}`}>
      <span className="font-bold tracking-tight text-white/90">
        <span className="text-base">Peblo</span>
        <span className="text-indigo-500 text-xl">.</span>
      </span>
    </div>
  );
}
