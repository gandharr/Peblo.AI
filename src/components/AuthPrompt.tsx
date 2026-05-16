import { motion } from 'motion/react';
import { useAuth } from './AuthProvider';
import { LogIn, StickyNote } from 'lucide-react';
import Logo from './Logo';

export default function AuthPrompt() {
  const { signIn } = useAuth();

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0A0A0A] p-6 relative overflow-hidden">
      <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-indigo-500/10 to-transparent"></div>
      
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md bg-white/5 backdrop-blur-2xl rounded-[2.5rem] md:rounded-[3rem] border border-white/10 p-8 md:p-12 text-center shadow-2xl relative z-10"
        id="auth-modal"
      >
        <div className="mb-10 flex justify-center">
          <Logo />
        </div>
        <h1 className="text-3xl font-bold text-white mb-3 tracking-tight">Peblo</h1>
        <p className="text-white/40 mb-10 font-medium leading-relaxed text-sm">
          A high-performance workspace for modern creative documentation and collaborative research.
        </p>
        <button
          onClick={signIn}
          className="w-full flex items-center justify-center gap-3 bg-white text-black hover:bg-slate-200 font-semibold py-4 px-6 rounded-xl transition-all duration-300 shadow-xl active:scale-[0.98]"
          id="login-button"
        >
          <LogIn className="w-5 h-5" shapeRendering="geometricPrecision" />
          Continue with Google
        </button>
        <p className="mt-10 text-[11px] font-medium text-white/10 tracking-tight">
          Secure enterprise authentication powered by Google
        </p>
      </motion.div>
    </div>
  );
}
