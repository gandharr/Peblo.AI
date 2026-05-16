import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Sparkles, 
  Share2, 
  Archive, 
  Trash2, 
  CheckCircle2, 
  Clock, 
  ArrowLeft,
  X,
  ListTodo,
  Hash,
  ChevronDown,
  ExternalLink
} from 'lucide-react';
import { Note } from '../types';
import Markdown from 'react-markdown';
import { format } from 'date-fns';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import toast from 'react-hot-toast';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface NoteEditorProps {
  note: Note;
  onSave: (updates: Partial<Note>) => void;
  onDelete: (id: string) => void;
  onClose: () => void;
  onGenerateAI: (id: string) => Promise<void>;
  isGenerating: boolean;
}

export default function NoteEditor({ note, onSave, onDelete, onClose, onGenerateAI, isGenerating }: NoteEditorProps) {
  const [localTitle, setLocalTitle] = useState(note.title);
  const [localContent, setLocalContent] = useState(note.content);
  const [localTags, setLocalTags] = useState<string[]>(note.tags || []);
  const [tagInput, setTagInput] = useState('');
  const [previewMode, setPreviewMode] = useState(false);
  const [savingStatus, setSavingStatus] = useState<'idle'|'saving'|'saved'|'error'>('idle');
  const saveTimeout = useRef<NodeJS.Timeout|null>(null);

  useEffect(() => {
    setLocalTitle(note.title);
    setLocalContent(note.content);
    setLocalTags(note.tags || []);
  }, [note.id]);

  useEffect(() => {
    if (saveTimeout.current) clearTimeout(saveTimeout.current);
    
    saveTimeout.current = setTimeout(() => {
      if (localTitle !== note.title || localContent !== note.content || JSON.stringify(localTags) !== JSON.stringify(note.tags)) {
        setSavingStatus('saving');
        const result = Promise.resolve(onSave({ 
          title: localTitle, 
          content: localContent,
          tags: localTags
        }));
        result.then(() => {
          setSavingStatus('saved');
          setTimeout(() => setSavingStatus('idle'), 1200);
        }).catch(() => setSavingStatus('error'));
      }
    }, 1000);

    return () => {
      if (saveTimeout.current) clearTimeout(saveTimeout.current);
    };
  }, [localTitle, localContent, localTags]);

  const addTag = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && tagInput.trim()) {
      if (!localTags.includes(tagInput.trim())) {
        setLocalTags([...localTags, tagInput.trim()]);
      }
      setTagInput('');
    }
  };

  const removeTag = (tag: string) => {
    setLocalTags(localTags.filter(t => t !== tag));
  };

  return (
    <div className="flex flex-col h-full bg-transparent" id={`editor-${note.id}`}>
      {/* Header */}
      <header className="px-4 md:px-8 py-3 md:py-4 border-b border-white/5 flex items-center justify-between bg-white/[0.01]">
        <div className="flex items-center gap-3 md:gap-4 truncate mr-2">
          <button 
            onClick={onClose}
            className="p-2 hover:bg-white/5 rounded-lg transition-colors text-white/40 lg:hidden"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div className="flex items-center gap-2 text-white/20 text-[11px] font-medium tracking-tight">
            <Clock className="w-3.5 h-3.5 flex-shrink-0" shapeRendering="geometricPrecision" />
            <span className="truncate">Last sync {note.updatedAt ? format(note.updatedAt.toDate(), 'h:mm a') : 'Now'}</span>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => onGenerateAI(note.id)}
            disabled={isGenerating}
            className={cn(
              "flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold tracking-tight transition-all shadow-xl whitespace-nowrap",
              isGenerating 
                ? "bg-white/5 text-white/20 cursor-not-allowed" 
                : "bg-indigo-600 text-white hover:bg-indigo-700 active:scale-95"
            )}
            id="btn-ai-insights"
          >
            <Sparkles 
              className={cn("w-3.5 h-3.5 text-white/70", isGenerating && "animate-pulse")} 
              shapeRendering="geometricPrecision"
            />
            AI Analyze
          </button>
          <div className="flex items-center gap-1 bg-white/[0.02] p-1 rounded-xl border border-white/5">
            <button
              onClick={() => {
                const isPublic = !note.isPublic;
                onSave({ isPublic });

                if (isPublic) {
                  const url = new URL(window.location.href);
                  url.searchParams.set('share', note.id);
                  navigator.clipboard.writeText(url.toString());
                  toast.success('Public link copied to clipboard', {
                    style: {
                      background: '#1e1b4b',
                      color: '#fff',
                      border: '1px solid #312e81'
                    }
                  });
                } else {
                  toast('Note set to private', { icon: '🔒' });
                }
              }}
              className={cn(
                "p-2 rounded-lg transition-all flex items-center gap-2",
                note.isPublic ? "text-indigo-400 bg-white/10" : "text-white/20 hover:text-white/50"
              )}
              title={note.isPublic ? "Copy Share Link" : "Make Public"}
            >
              <Share2 className="w-4 h-4" />
              {note.isPublic && <ExternalLink className="w-3 h-3" />}
            </button>
            <button
              onClick={() => {
                const isArchived = !note.isArchived;
                setSavingStatus('saving');
                Promise.resolve(onSave({ isArchived })).then(() => {
                  setSavingStatus('saved');
                  setTimeout(() => setSavingStatus('idle'), 1200);
                }).catch(() => setSavingStatus('error'));
              }}
              className={cn("p-2 rounded-lg transition-all text-white/20 hover:text-white/40")}
              title={note.isArchived ? 'Unarchive' : 'Archive'}
            >
              <Archive className="w-4 h-4" />
            </button>
            <button
              onClick={() => onDelete(note.id)}
              className="p-2 rounded-lg hover:bg-red-500/10 text-white/20 hover:text-red-400 transition-all"
              title="Delete"
            >
              <Trash2 className="w-4 h-4" shapeRendering="geometricPrecision" />
            </button>
          </div>
        </div>
      </header>

      {/* Content Area */}
      <main className="flex-1 overflow-hidden flex flex-col lg:flex-row">
        {/* Main Editor */}
        <div className="flex-1 overflow-y-auto p-6 md:p-12 lg:pr-6 custom-scrollbar custom-scrollbar-inverse h-full bg-white/[0.01]">
          <div className="max-w-3xl mx-auto">
            {/* Tags */}
            <div className="flex flex-wrap gap-2 mb-8">
              {localTags.map(tag => (
                <span 
                  key={tag} 
                  className="bg-white/[0.03] text-white/50 border border-white/5 px-3 py-1 rounded-lg text-[11px] font-medium flex items-center gap-2 group select-none"
                >
                  <Hash className="w-3 h-3 opacity-20" shapeRendering="geometricPrecision" />
                  {tag}
                  <button 
                    onClick={() => removeTag(tag)}
                    className="opacity-0 group-hover:opacity-100 transition-opacity hover:text-white"
                  >
                    <X className="w-2.5 h-2.5" shapeRendering="geometricPrecision" />
                  </button>
                </span>
              ))}
              <input
                type="text"
                placeholder="Add focus..."
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyDown={addTag}
                className="text-[11px] font-medium text-white/20 bg-transparent outline-none py-1 min-w-[80px] focus:text-white/40 transition-colors"
              />
            </div>

            <textarea
              value={localTitle}
              onChange={(e) => setLocalTitle(e.target.value)}
              placeholder="Document Title"
              className="w-full text-3xl md:text-4xl font-bold text-white border-none outline-none resize-none placeholder:text-white/5 mb-8 overflow-hidden tracking-tight leading-tight"
              rows={1}
              style={{ minHeight: '3rem' }}
              id="editor-title"
            />

            <div className="flex items-center gap-6 mb-8 border-b border-white/5 pb-2">
              <button 
                onClick={() => setPreviewMode(false)}
                className={cn("text-xs font-semibold tracking-tight pb-2 transition-all px-1", !previewMode ? "text-indigo-400 border-b border-indigo-400" : "text-white/20 hover:text-white/40")}
              >
                Draft
              </button>
              <button 
                onClick={() => setPreviewMode(true)}
                className={cn("text-xs font-semibold tracking-tight pb-2 transition-all px-1", previewMode ? "text-indigo-400 border-b border-indigo-400" : "text-white/20 hover:text-white/40")}
              >
                Review
              </button>
            </div>

            {!previewMode ? (
              <textarea
                value={localContent}
                onChange={(e) => setLocalContent(e.target.value)}
                placeholder="Awaiting data entry..."
                className="w-full h-full min-h-[500px] text-lg text-white/70 leading-relaxed border-none outline-none resize-none placeholder:text-white/5 font-medium"
                id="editor-body"
              />
            ) : (
              <article className="prose prose-invert prose-slate max-w-none prose-lg text-white/80">
                <Markdown>{localContent}</Markdown>
              </article>
            )}
          </div>
        </div>

        {/* Sidebar Insights */}
        <AnimatePresence>
          {(note.summary || (note.actionItems && note.actionItems.length > 0)) && (
            <motion.aside
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              className="w-full lg:w-[450px] border-t lg:border-t-0 lg:border-l border-white/5 p-6 md:p-12 overflow-y-auto bg-white/[0.01] custom-scrollbar-ai"
              id="ai-insights-panel"
            >
              <div className="flex items-center gap-2 mb-10 text-indigo-400">
                <Sparkles className="w-5 h-5" />
                <h3 className="font-bold tracking-tight">Intelligence</h3>
              </div>

              {note.summary && (
                <div className="mb-12">
                  <h4 className="text-[10px] uppercase tracking-widest font-bold text-white/20 mb-4">Core Summary</h4>
                  <p className="text-sm text-white/50 leading-relaxed bg-white/[0.03] p-6 rounded-2xl border border-white/5 shadow-sm font-medium italic">
                    "{note.summary}"
                  </p>
                </div>
              )}

              {note.actionItems && note.actionItems.length > 0 && (
                <div>
                  <h4 className="text-[10px] uppercase tracking-widest font-bold text-white/20 mb-4">Next Steps</h4>
                  <div className="space-y-3">
                    {note.actionItems.map((item, i) => (
                      <div key={i} className="flex gap-3 bg-white/[0.02] p-4 rounded-xl border border-white/5 shadow-sm group hover:border-indigo-500/20 transition-all">
                        <CheckCircle2 className="w-4 h-4 text-indigo-400/50 flex-shrink-0 mt-0.5" />
                        <span className="text-sm text-white/40 leading-tight group-hover:text-white/70 transition-colors font-medium">{item}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </motion.aside>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
}
