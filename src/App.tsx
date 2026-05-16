import { AuthProvider, useAuth } from './components/AuthProvider';
import AuthPrompt from './components/AuthPrompt';
import Dashboard from './components/Dashboard';
import ShareView from './components/ShareView';

function AppContent() {
  const { user, loading } = useAuth();
  
  // Handle share links
  const urlParams = new URLSearchParams(window.location.search);
  const shareId = urlParams.get('share');

  if (shareId) {
    return <ShareView shareId={shareId} />;
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0A0A0A]">
        <div className="w-6 h-6 border-2 border-white/10 border-t-indigo-500 rounded-full animate-spin"></div>
      </div>
    );
  }

  return user ? <Dashboard /> : <AuthPrompt />;
}

export default function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}
