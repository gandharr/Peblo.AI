import { useMemo } from 'react';
import { Note } from '../types';
import { 
  BarChart3, 
  TrendingUp, 
  Tag as TagIcon, 
  StickyNote, 
  Clock,
  Sparkles,
  Zap,
  Flame,
  Calendar
} from 'lucide-react';
import { format, startOfWeek, endOfWeek, eachDayOfInterval, isSameDay } from 'date-fns';
import { motion } from 'motion/react';

export default function ProductivityInsights({ notes }: { notes: Note[] }) {
  const stats = useMemo(() => {
    const totalNotes = notes.length;
    const aiNotes = notes.filter(n => n.summary).length;
    const tagFreq: Record<string, number> = {};
    notes.forEach(n => {
      n.tags?.forEach(t => {
        tagFreq[t] = (tagFreq[t] || 0) + 1;
      });
    });
    
    const topTags = Object.entries(tagFreq)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5);

    // Weekly activity
    const now = new Date();
    const start = startOfWeek(now);
    const end = endOfWeek(now);
    const days = eachDayOfInterval({ start, end });
    const activity = days.map(day => ({
      day: format(day, 'EEE'),
      count: notes.filter(n => isSameDay(n.updatedAt.toDate(), day)).length
    }));

    return { totalNotes, aiNotes, topTags, activity };
  }, [notes]);

  return (
    <div className="p-6 md:p-12 h-screen overflow-y-auto custom-scrollbar bg-transparent" id="insights-dashboard">
      <header className="mb-10 text-center md:text-left">
        <h1 className="text-2xl md:text-3xl font-bold tracking-tight mb-1 text-white">Registry Metrics</h1>
        <p className="text-white/30 text-sm font-medium">Visualizing workspace output and intelligence trends.</p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
        {[
          { label: 'Total Documents', value: stats.totalNotes, icon: StickyNote, color: 'text-blue-400', bg: 'bg-blue-500/10' },
          { label: 'AI Summarized', value: stats.aiNotes, icon: Sparkles, color: 'text-indigo-400', bg: 'bg-indigo-500/10' },
          { label: 'Metadata Tags', value: stats.topTags.length, icon: TagIcon, color: 'text-amber-400', bg: 'bg-amber-500/10' },
          { label: 'Write Streak', value: 4, icon: Flame, color: 'text-orange-400', bg: 'bg-orange-500/10' },
        ].map((s, i) => (
          <motion.div
            key={s.label}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="bg-white/[0.02] p-6 rounded-3xl border border-white/5 shadow-xl flex items-center gap-6 group hover:bg-white/[0.05] transition-all"
          >
            <div className={`w-12 h-12 ${s.bg} rounded-xl flex items-center justify-center border border-white/5 group-hover:scale-105 transition-transform`}>
              <s.icon className={`w-6 h-6 ${s.color}`} shapeRendering="geometricPrecision" />
            </div>
            <div>
              <p className="text-[10px] font-bold text-white/20 uppercase tracking-widest mb-0.5">{s.label}</p>
              <p className="text-2xl font-bold text-white tracking-tight">{s.value}</p>
            </div>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 pb-12">
        {/* Weekly Activity */}
        <div className="lg:col-span-2 bg-white/[0.02] p-8 rounded-3xl border border-white/5 shadow-xl backdrop-blur-xl">
          <div className="flex items-center justify-between mb-10">
            <div className="flex items-center gap-3">
              <Calendar className="w-5 h-5 text-indigo-400" shapeRendering="geometricPrecision" />
              <h3 className="font-bold text-lg">System Pulse</h3>
            </div>
            <span className="text-[10px] font-bold text-white/20 uppercase tracking-widest px-3 py-1 bg-white/5 rounded-full border border-white/5">Weekly activity</span>
          </div>
          <div className="flex items-end justify-between h-48 gap-4 px-4 font-medium">
            {stats.activity.map((a, i) => (
              <div key={a.day} className="flex-1 flex flex-col items-center group">
                <motion.div 
                  initial={{ height: 0 }}
                  animate={{ height: `${(a.count / Math.max(1, ...stats.activity.map(x=>x.count))) * 100}%` }}
                  className="w-full bg-indigo-500/20 rounded-t-lg group-hover:bg-indigo-500/40 transition-all relative border-t border-indigo-400/30"
                  style={{ minHeight: a.count > 0 ? '8px' : '0' }}
                >
                   {a.count > 0 && <span className="absolute -top-7 left-1/2 -translate-x-1/2 text-[10px] font-bold text-indigo-400 bg-white/5 px-2 py-0.5 rounded border border-white/5">{a.count}</span>}
                </motion.div>
                <span className="mt-4 text-[10px] font-bold text-white/20 uppercase tracking-wider">{a.day}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Top Tags */}
        <div className="bg-white/[0.02] p-8 rounded-3xl border border-white/5 shadow-xl backdrop-blur-xl">
          <div className="flex items-center gap-3 mb-10">
            <TagIcon className="w-5 h-5 text-amber-500" shapeRendering="geometricPrecision" />
            <h3 className="font-bold text-lg">Top Tags</h3>
          </div>
          <div className="space-y-4">
            {stats.topTags.map(([tag, count], i) => (
              <div key={tag} className="flex items-center justify-between group">
                <div className="flex items-center gap-3">
                  <span className="text-[10px] font-bold text-white/10">0{i+1}</span>
                  <span className="text-xs font-semibold text-white/50 bg-white/5 px-3 py-1.5 rounded-lg border border-white/5 tracking-tight group-hover:bg-white/10 transition-all">#{tag}</span>
                </div>
                <span className="text-sm font-bold text-white tracking-tight">{count}</span>
              </div>
            ))}
            {stats.topTags.length === 0 && (
              <p className="text-sm text-white/20 italic font-medium">No active registry.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
