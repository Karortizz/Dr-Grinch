import React, { useState, useEffect } from 'react';
import { AdminPanel } from './components/AdminPanel';
import { ParticipantReveal } from './components/ParticipantReveal';
import { Landing } from './components/Landing';
import { AdminLoginModal } from './components/AdminLoginModal';
import { AppState, AppMode } from './types';
import { decodeState } from './services/logic';

const App: React.FC = () => {
  const [mode, setMode] = useState<AppMode>(AppMode.LANDING);
  const [state, setState] = useState<AppState | null>(null);
  const [loading, setLoading] = useState(true);
  const [isAdminModalOpen, setIsAdminModalOpen] = useState(false);

  // Initial Check for Hash
  useEffect(() => {
    const handleHashChange = () => {
        const hash = window.location.hash;
        if (hash && hash.length > 1) {
            const decoded = decodeState(hash);
            if (decoded && decoded.draw) {
                setState(decoded);
                setMode(AppMode.PARTICIPANT);
            } else {
              // Invalid hash, go to landing
              setMode(AppMode.LANDING);
            }
        } else {
            // No hash, go to landing
            if (mode !== AppMode.SETUP) {
               setMode(AppMode.LANDING);
            }
        }
        setLoading(false);
    }

    handleHashChange();
    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  const handleDrawGenerated = (hash: string, newState: AppState) => {
    setState(newState);
    window.location.hash = hash;
  };

  const handlePreview = (previewState: AppState) => {
    setState(previewState);
    setMode(AppMode.PARTICIPANT);
  }

  const handleAdminRequest = () => {
    setIsAdminModalOpen(true);
  };

  const handleAdminSuccess = () => {
    setIsAdminModalOpen(false);
    // Limpiamos el estado actual si venimos de un sorteo existente para empezar de cero o editar?
    // Generalmente si entras como admin quieres crear uno nuevo o ver el panel.
    // Mantenemos el estado si existe para editar, o null si venimos de landing.
    setMode(AppMode.SETUP);
    // Removemos el hash para que la URL quede limpia en el admin panel
    window.history.pushState("", document.title, window.location.pathname + window.location.search);
  };

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center text-white font-bold text-2xl">Cargando...</div>;
  }

  return (
    <div className="min-h-screen font-roboto flex flex-col">
      <AdminLoginModal 
        isOpen={isAdminModalOpen} 
        onClose={() => setIsAdminModalOpen(false)} 
        onSuccess={handleAdminSuccess} 
      />

      <main className="container mx-auto px-4 flex-grow flex flex-col justify-center py-10 relative z-0">
        {mode === AppMode.LANDING && (
          <Landing onAdminLogin={handleAdminRequest} />
        )}

        {mode === AppMode.SETUP && (
          <AdminPanel 
            onDrawGenerated={handleDrawGenerated} 
            onPreview={handlePreview}
            initialState={state}
          />
        )}

        {mode === AppMode.PARTICIPANT && state && (
          <ParticipantReveal 
            state={state} 
            onAdminLogin={handleAdminRequest}
          />
        )}
      </main>

      <footer className="py-6 text-center text-white/60">
        <p className="text-xs font-medium">Hecho con odio... digo, amor 💚</p>
      </footer>
    </div>
  );
};

export default App;