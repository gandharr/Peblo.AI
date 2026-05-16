import { useState, useEffect } from 'react';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { Note } from '../types';
import { Sparkles, Clock, Hash, ArrowLeft } from 'lucide-react';
import Markdown from 'react-markdown';
import { format } from 'date-fns';

export default function ShareView({ shareId }: { shareId: string }) {
  const [note, setNote] = useState<Note | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchSharedNote() {
      try {
        const noteRef = doc(db, 'notes', shareId);
        const snap = await getDoc(noteRef);

        if (snap.exists() && snap.data().isPublic) {
          setNote({ id: snap.id, ...snap.data() } as Note);
        } else {
          setError('Document not found or access restricted.');
        }
      } catch (err) {
        setError('Failed to establish connection to the registry.');
      } finally {
        setLoading(false);
      }
    }

    fetchSharedNote();
  }, [shareId]);

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-[#030405]">
      <div className="w-12 h-12 border-2 border-indigo-600/30 border-t-indigo-600 rounded-full animate-spin"></div>
    </div>
  );

  if (error || !note) return (
    <div className="min-h-screen flex items-center justify-center bg-[#030405] text-white/20 font-medium flex-col gap-4">
      <p>{error || 'Resource not found'}</p>
      <a href="/" className="text-xs text-indigo-400 hover:underline flex items-center gap-2">
        <ArrowLeft className="w-3 h-3" />
        Return to Peblo
      </a>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#030405] text-slate-100 py-12 md:py-24 px-4 font-sans selection:bg-indigo-500/30">
      <div className="max-w-3xl mx-auto">
        <div className="bento-card p-8 md:p-16 relative overflow-hidden">
          {/* Subtle decoration */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-600/5 blur-[100px] pointer-events-none rounded-full -mr-32 -mt-32"></div>
          
          <div className="relative z-10">
            <header className="mb-12 border-b border-white/5 pb-12">
              <div className="flex items-center gap-2 text-white/20 text-[11px] font-medium tracking-tight mb-8">
                <Clock className="w-3.5 h-3.5" />
                <span>Last updated {format(note.updatedAt.toDate(), 'MMM d, yyyy')}</span>
              </div>

              <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-8 leading-tight">
                {note.title}
              </h1>

              <div className="flex flex-wrap gap-2">
                {note.tags?.map(tag => (
                   <span key={tag} className="bg-white/[0.03] text-white/40 border border-white/5 px-3 py-1 rounded-lg text-xs font-medium">#{tag}</span>
                ))}
              </div>
            </header>
            
            <article className="prose prose-invert prose-slate max-w-none prose-lg mb-16 text-slate-300 leading-relaxed">
              <Markdown>{note.content}</Markdown>
            </article>

            {note.summary && (
              <div className="bg-white/[0.02] p-8 rounded-3xl border border-white/5 shadow-sm">
                <div className="flex items-center gap-2 mb-4 text-indigo-400">
                  <Sparkles className="w-4 h-4" />
                  <h3 className="font-bold text-xs uppercase tracking-widest">Executive Summary</h3>
                </div>
                <p className="text-slate-400 leading-relaxed text-sm italic font-medium">
                  "{note.summary}"
                </p>
              </div>
            )}
          </div>
        </div>

        <footer className="mt-12 text-center">
            <div className="inline-flex items-center gap-3 px-4 py-2 bg-white/[0.02] border border-white/5 rounded-full">
                <span className="text-white/20 text-xs font-medium">Powered by</span>
                <span className="text-indigo-400 text-xs font-bold tracking-tight">Peblo Workspace</span>
            </div>
        </footer>
      </div>
    </div>
  );
}
