import { useState, useEffect, useMemo } from 'react';
import { 
  collection, 
  query, 
  where, 
  orderBy, 
  onSnapshot, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  doc, 
  serverTimestamp,
  type QuerySnapshot,
  type DocumentData
} from 'firebase/firestore';
import { db } from '../lib/firebase';
import { useAuth } from './AuthProvider';
import { Note, OperationType } from '../types';
import Sidebar from './Sidebar';
import NoteEditor from './NoteEditor';
import ProductivityInsights from './ProductivityInsights';
import { handleFirestoreError } from '../lib/error-handler';
import { generateNoteInsights } from '../lib/gemini';
import { motion, AnimatePresence } from 'motion/react';
import { StickyNote, SearchX, Clock, Sparkles, AlertCircle } from 'lucide-react';
import { format } from 'date-fns';
import { Toaster, toast } from 'react-hot-toast';
import Logo from './Logo';

export default function Dashboard() {
  const { user } = useAuth();
  const [notes, setNotes] = useState<Note[]>([]);
  const [activeNoteId, setActiveNoteId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterArchived, setFilterArchived] = useState<'all'|'active'|'archived'>('all');
  const [sortBy, setSortBy] = useState<'updatedAt'|'title'>('updatedAt');
  const [activeTab, setActiveTab] = useState('notes');
  const [isGenerating, setIsGenerating] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const cn = (...classes: (string | boolean | undefined)[]) => classes.filter(Boolean).join(' ');

  useEffect(() => {
    if (!user) return;

    const q = query(
      collection(db, 'notes'),
      where('ownerId', '==', user.uid),
      orderBy('updatedAt', 'desc')
    );

    const unsubscribe = onSnapshot(q, (snapshot: QuerySnapshot<DocumentData>) => {
      const notesData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Note[];
      setNotes(notesData);
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, 'notes');
    });

    return unsubscribe;
  }, [user]);

  const filteredNotes = useMemo(() => {
    return notes.filter(n => {
      if (filterArchived === 'active' && n.isArchived) return false;
      if (filterArchived === 'archived' && !n.isArchived) return false;
      const matchesQuery = n.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        n.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
        n.tags.some(t => t.toLowerCase().includes(searchQuery.toLowerCase()));
      return matchesQuery;
    }).sort((a,b) => {
      if (sortBy === 'updatedAt') {
        return (b.updatedAt?.toDate?.() ? b.updatedAt.toDate().getTime() : 0) - (a.updatedAt?.toDate?.() ? a.updatedAt.toDate().getTime() : 0);
      }
      return a.title.localeCompare(b.title);
    });
  }, [notes, searchQuery, filterArchived, sortBy]);

  const activeNote = useMemo(() => 
    notes.find(n => n.id === activeNoteId) || null
  , [notes, activeNoteId]);

  const handleCreateNote = async () => {
    if (!user) return;
    try {
      const newNote = {
        ownerId: user.uid,
        title: 'Untitled Note',
        content: '',
        tags: [],
        summary: null,
        actionItems: [],
        isPublic: false,
        shareId: Math.random().toString(36).substring(2, 15),
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      };
      const docRef = await addDoc(collection(db, 'notes'), newNote);
      setActiveNoteId(docRef.id);
      toast.success('New note created');
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, 'notes');
    }
  };

  const handleUpdateNote = async (updates: Partial<Note>) => {
    if (!activeNoteId) return;
    try {
      const noteRef = doc(db, 'notes', activeNoteId);
      await updateDoc(noteRef, {
        ...updates,
        updatedAt: serverTimestamp(),
      });
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `notes/${activeNoteId}`);
    }
  };

  const handleDeleteNote = async (id: string) => {
    try {
      await deleteDoc(doc(db, 'notes', id));
      if (activeNoteId === id) setActiveNoteId(null);
      toast.success('Note deleted');
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, `notes/${id}`);
    }
  };

  const handleGenerateAI = async (id: string) => {
    const note = notes.find(n => n.id === id);
    if (!note || !note.content.trim()) {
      toast.error('Add some content first!');
      return;
    }

    setIsGenerating(true);
    toast.loading('AI analyzing...', { id: 'ai-gen' });

    try {
      const insights = await generateNoteInsights(note.content);
      await updateDoc(doc(db, 'notes', id), {
        summary: insights.summary,
        actionItems: insights.actionItems,
        title: note.title === 'Untitled Note' ? insights.suggestedTitle : note.title,
        updatedAt: serverTimestamp(),
      });
      toast.success('Insights generated!', { id: 'ai-gen' });
    } catch (error) {
      toast.error('AI generation failed', { id: 'ai-gen' });
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="flex h-screen bg-[#0A0A0A] text-white" id="app-container">
      <Toaster 
        toastOptions={{
          style: {
            background: '#1A1A1A',
            color: '#fff',
            border: '1px solid rgba(255,255,255,0.1)',
            borderRadius: '1rem',
          }
        }}
      />
      <Sidebar 
        activeTab={activeTab} 
        setActiveTab={(tab) => {
          setActiveTab(tab);
          setIsSidebarOpen(false);
        }} 
        onNewNote={handleCreateNote}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
        filterArchived={filterArchived}
        setFilterArchived={setFilterArchived}
        sortBy={sortBy}
        setSortBy={setSortBy}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden lg:pr-6 lg:py-8">
        {/* Mobile Header */}
        <div className="lg:hidden flex items-center justify-between p-4 border-b border-white/5 bg-[#0A0A0A] z-20">
          <button 
            onClick={() => setIsSidebarOpen(true)}
            className="p-2 -ml-2 text-white/40 hover:text-white"
          >
            <div className="w-5 h-4 flex flex-col justify-between">
              <span className="w-full h-0.5 bg-current rounded-full" />
              <span className="w-full h-0.5 bg-current rounded-full" />
              <span className="w-full h-0.5 bg-current rounded-full" />
            </div>
          </button>
          <Logo />
          <div className="w-10" /> {/* Spacer */}
        </div>

        {activeTab === 'notes' && (
          <div className="flex-1 flex gap-6 overflow-hidden relative">
            {/* Note List Rails */}
            <div className={cn(
              "absolute inset-0 lg:relative lg:w-80 flex flex-col bg-white/5 lg:border border-white/10 lg:rounded-[2rem] overflow-hidden backdrop-blur-xl z-10 transition-transform duration-300",
              activeNoteId ? "-translate-x-full lg:translate-x-0" : "translate-x-0"
            )}>
              <div className="p-6 border-b border-white/10 bg-white/[0.01]">
                <h1 className="text-xl font-bold tracking-tight mb-0.5">Workspace</h1>
                <p className="text-[11px] text-white/30 font-medium tracking-wide">
                  {filteredNotes.length} Document{filteredNotes.length !== 1 ? 's' : ''}
                </p>
              </div>
              
              <div className={`flex-1 ${filteredNotes.length > 0 ? 'overflow-y-auto custom-scrollbar custom-scrollbar-inverse' : 'overflow-hidden'} p-3 space-y-1.5`}>
                {filteredNotes.length === 0 ? (
                  <div className="h-full flex flex-col items-center justify-center opacity-20 px-6 text-center">
                    <div className="w-12 h-12 bg-white/5 rounded-2xl flex items-center justify-center mb-4 border border-white/10">
                      <SearchX className="w-6 h-6 text-white/40" />
                    </div>
                    <p className="text-xs font-medium">No results found</p>
                  </div>
                ) : (
                  filteredNotes.map(note => (
                    <button
                      key={note.id}
                      onClick={() => setActiveNoteId(note.id)}
                      className={`w-full text-left p-4 rounded-2xl transition-all border ${
                        activeNoteId === note.id 
                        ? 'bg-white/[0.06] border-white/10 shadow-lg' 
                        : 'bg-transparent border-transparent hover:bg-white/[0.02] hover:border-white/10'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <div className={`w-7 h-7 rounded-lg flex items-center justify-center ${activeNoteId === note.id ? 'bg-indigo-600' : 'bg-white/5'}`}>
                          <StickyNote 
                            className={`w-3.5 h-3.5 ${activeNoteId === note.id ? 'text-white' : 'text-white/30'}`} 
                            shapeRendering="geometricPrecision"
                          />
                        </div>
                        {note.summary && <Sparkles className="w-3 h-3 text-indigo-400/70" />}
                      </div>
                      <h3 className={`font-semibold text-sm mb-1 line-clamp-1 tracking-tight ${activeNoteId === note.id ? 'text-white' : 'text-white/70'}`}>
                        {note.title || 'Untitled'}
                      </h3>
                      <p className="text-[11px] text-white/30 line-clamp-2 leading-relaxed mb-3">
                        {note.content || 'Draft content...'}
                      </p>
                      <div className="flex items-center justify-between text-[10px] font-medium text-white/20">
                        <span>
                          {note.updatedAt ? format(note.updatedAt.toDate(), 'MMM d') : 'Now'}
                        </span>
                        <div className="flex gap-1.5">
                          {note.tags.slice(0, 1).map(tag => (
                            <span key={tag} className="text-white/40">#{tag}</span>
                          ))}
                        </div>
                      </div>
                    </button>
                  ))
                )}
              </div>
            </div>

            {/* Main Editor View */}
            <div className={cn(
              "absolute inset-0 lg:relative flex-1 bg-white/5 lg:border border-white/10 lg:rounded-[2rem] overflow-hidden backdrop-blur-xl transition-transform duration-300",
              activeNoteId ? "translate-x-0" : "translate-x-full lg:translate-x-0"
            )}>
              <AnimatePresence mode="wait">
                {activeNote ? (
                  <motion.div
                    key={activeNote.id}
                    initial={{ opacity: 0, y: 4 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -4 }}
                    className="h-full"
                  >
                    <NoteEditor 
                      note={activeNote} 
                      onSave={handleUpdateNote} 
                      onDelete={handleDeleteNote}
                      onClose={() => setActiveNoteId(null)}
                      onGenerateAI={handleGenerateAI}
                      isGenerating={isGenerating}
                    />
                  </motion.div>
                ) : (
                  <div className="h-full flex flex-col items-center justify-center text-white/20 p-12 text-center max-w-sm mx-auto">
                    <div className="mb-10 grayscale opacity-20">
                      <Logo />
                    </div>
                    <h2 className="text-2xl font-bold text-white mb-2 tracking-tight">Select a document</h2>
                    <p className="text-sm text-white/20 font-medium mb-8">
                      Choose a note from the library or initialize a new draft to continue your work.
                    </p>
                    <button
                      onClick={handleCreateNote}
                      className="px-6 py-2.5 bg-white text-black hover:bg-slate-200 rounded-xl text-sm font-semibold transition-all active:scale-95 shadow-xl shadow-black/20"
                    >
                      New Document
                    </button>
                  </div>
                )}
              </AnimatePresence>
            </div>
          </div>
        )}

        {/* AI Insights Board */}
        {activeTab === 'insights' && (
          <div className="flex-1 bento-card p-4 md:p-12 overflow-y-auto custom-scrollbar custom-scrollbar-inverse">
            <header className="mb-10">
              <h1 className="text-2xl font-bold tracking-tight mb-1">AI Summaries</h1>
              <p className="text-white/30 text-sm font-medium">Consolidated intelligence across your workspace.</p>
            </header>
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
              {notes.filter(n => n.summary).map(note => (
                <motion.div
                  key={note.id}
                  whileHover={{ y: -4 }}
                  className="bg-white/[0.03] p-6 rounded-2xl border border-white/5 hover:border-white/10 hover:bg-white/[0.05] transition-all group cursor-pointer shadow-sm"
                  onClick={() => { setActiveTab('notes'); setActiveNoteId(note.id); }}
                >
                  <div className="flex items-center gap-2 text-indigo-400 mb-4 font-semibold tracking-wide text-[10px] uppercase">
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>Executive Summary</span>
                  </div>
                  <h3 className="text-lg font-bold text-white mb-3 group-hover:text-indigo-400 transition-colors leading-tight">{note.title}</h3>
                  <p className="text-sm text-white/40 leading-relaxed italic line-clamp-3 font-medium">"{note.summary}"</p>
                </motion.div>
              ))}
              {notes.filter(n => n.summary).length === 0 && (
                <div className="col-span-full py-32 text-center">
                   <div className="w-16 h-16 bg-white/5 rounded-2xl flex items-center justify-center mx-auto mb-6 border border-white/10">
                     <AlertCircle className="w-8 h-8 text-white/5" />
                   </div>
                   <p className="text-white/20 text-sm font-medium">No intelligence reports available.</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Productivity Dashboard */}
        {activeTab === 'productivity' && (
          <div className="flex-1">
            <ProductivityInsights notes={notes} />
          </div>
        )}
      </div>
    </div>
  );
}
