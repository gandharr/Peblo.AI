import { StickyNote } from 'lucide-react';

export default function Logo({ className = "" }: { className?: string }) {
  return (
    <div className={`flex items-center gap-2.5 ${className}`}>
      <div className="relative">
        <div className="w-10 h-10 bg-[#6366F1] rounded-[1.2rem] flex items-center justify-center relative overflow-hidden shadow-lg shadow-indigo-500/20">
          {/* Diagonal shadow effect from the image */}
          <div className="absolute inset-0 bg-gradient-to-br from-white/10 via-transparent to-black/10"></div>
          
          {/* Subtle light streak across the middle */}
          <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/5 to-transparent"></div>

          <StickyNote 
            className="text-white w-5.5 h-5.5 relative z-10" 
            strokeWidth={1.5} 
            shapeRendering="geometricPrecision"
          />
        </div>
      </div>
      
      <div className="flex flex-col">
        <span className="text-xl font-bold tracking-tight text-white/90">
          Peblo<span className="text-indigo-500">.</span>
        </span>
      </div>
    </div>
  );
}
