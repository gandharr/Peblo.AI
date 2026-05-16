import { motion, AnimatePresence } from 'motion/react';
import { 
  Plus, 
  Search, 
  LayoutDashboard, 
  StickyNote, 
  Tag, 
  BarChart3, 
  Settings, 
  LogOut, 
  ChevronRight,
  TrendingUp,
  X
} from 'lucide-react';
import { useAuth } from './AuthProvider';
import Logo from './Logo';

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  onNewNote: () => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  isOpen: boolean;
  onClose: () => void;
  filterArchived?: 'all'|'active'|'archived';
  setFilterArchived?: (v: 'all'|'active'|'archived') => void;
  sortBy?: 'updatedAt'|'title';
  setSortBy?: (v: 'updatedAt'|'title') => void;
}

export default function Sidebar({ 
  activeTab, 
  setActiveTab, 
  onNewNote, 
  searchQuery, 
  setSearchQuery,
  isOpen,
  onClose
}: SidebarProps) {
  const { user, logout } = useAuth();

  const menuItems = [
    { id: 'notes', label: 'All Notes', icon: StickyNote },
    { id: 'insights', label: 'AI Insights', icon: BarChart3 },
    { id: 'productivity', label: 'Productivity', icon: TrendingUp },
  ];

  return (
    <>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[50] lg:hidden"
          />
        )}
      </AnimatePresence>

      <div className={`
        fixed inset-y-0 left-0 w-80 max-w-[80vw] lg:relative lg:w-80 h-screen flex flex-col bg-transparent overflow-hidden p-6 z-[60] transition-transform duration-300 lg:translate-x-0
        ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `} id="sidebar">
        <div className="flex flex-col h-full bg-[#0A0A0A] lg:bg-white/5 border border-white/10 rounded-[2rem] overflow-hidden backdrop-blur-md">
          <div className="p-6 pb-4">
            <div className="flex items-center justify-between mb-10">
              <Logo />
              <button 
                onClick={onClose}
                className="lg:hidden p-2 -mr-2 text-white/20 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

          <button
            onClick={onNewNote}
            className="w-full flex items-center justify-center gap-2 bg-indigo-600 text-white hover:bg-indigo-700 font-semibold py-3 px-4 rounded-xl transition-all mb-8 group"
            id="btn-new-note"
          >
            <Plus className="w-5 h-5 group-hover:rotate-90 transition-transform" shapeRendering="geometricPrecision" />
            <span>Create Note</span>
          </button>

          <div className="relative mb-8" id="search-container">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30 w-4 h-4" shapeRendering="geometricPrecision" />
            <input
              type="text"
              placeholder="Search documents..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-white/5 border border-white/5 focus:border-white/10 focus:bg-white/10 rounded-xl py-2 pl-10 pr-4 text-sm text-white placeholder-white/20 outline-none transition-all"
            />
          </div>

          {/* Filters */}
          <div className="flex items-center gap-2 mb-6">
            <button
              onClick={() => setFilterArchived?.('all')}
              className={`px-3 py-1 rounded-xl text-xs font-medium ${filterArchived === 'all' ? 'bg-indigo-600 text-white' : 'text-white/40 hover:bg-white/5'}`}>
              All
            </button>
            <button
              onClick={() => setFilterArchived?.('active')}
              className={`px-3 py-1 rounded-xl text-xs font-medium ${filterArchived === 'active' ? 'bg-indigo-600 text-white' : 'text-white/40 hover:bg-white/5'}`}>
              Active
            </button>
            <button
              onClick={() => setFilterArchived?.('archived')}
              className={`px-3 py-1 rounded-xl text-xs font-medium ${filterArchived === 'archived' ? 'bg-indigo-600 text-white' : 'text-white/40 hover:bg-white/5'}`}>
              Archived
            </button>
          </div>

          <div className="flex items-center gap-2 mb-6">
            <label className="text-[11px] text-white/40">Sort:</label>
            <select
              value={sortBy}
              onChange={(e) => setSortBy?.(e.target.value as 'updatedAt'|'title')}
              className="bg-transparent border border-white/5 text-white/40 rounded-xl py-1 px-2 text-sm"
            >
              <option value="updatedAt">Recently Updated</option>
              <option value="title">Title</option>
            </select>
          </div>

          <nav className="space-y-1">
            {menuItems.map((item) => (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`w-full flex items-center justify-between px-4 py-3 rounded-xl transition-all group ${
                  activeTab === item.id 
                    ? 'bg-white/10 text-white' 
                    : 'text-white/40 hover:bg-white/5 hover:text-white'
                }`}
              >
                <div className="flex items-center gap-3">
                  <item.icon 
                    className={`w-4 h-4 transition-colors ${activeTab === item.id ? 'text-indigo-400' : ''}`} 
                    shapeRendering="geometricPrecision"
                  />
                  <span className="text-sm font-medium">{item.label}</span>
                </div>
                <ChevronRight className={`w-3.5 h-3.5 transition-all ${activeTab === item.id ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-2'}`} />
              </button>
            ))}
          </nav>
        </div>

        <div className="mt-auto p-6 border-t border-white/5">
          <div className="flex items-center gap-3 mb-6 p-2 rounded-xl bg-white/5">
            <img 
              src={user?.photoURL || `https://ui-avatars.com/api/?name=${user?.displayName}&background=6366f1&color=fff`} 
              alt="User" 
              className="w-10 h-10 rounded-full border border-white/10" 
            />
            <div className="overflow-hidden">
              <p className="text-sm font-semibold truncate text-white">{user?.displayName}</p>
              <p className="text-[10px] text-white/30 truncate font-medium">{user?.email}</p>
            </div>
          </div>
          <button
            onClick={logout}
            className="w-full flex items-center gap-3 px-4 py-2 text-white/20 hover:text-red-400 transition-colors text-xs font-medium"
          >
            <LogOut className="w-4 h-4" />
            Sign Out
          </button>
        </div>
      </div>
    </div>
    </>
  );
}
