import React, { useState } from 'react';
import { ChevronRight, ChevronDown } from 'lucide-react';
import { AppState } from '../types';
import { generateGiftPoem } from '../services/geminiService';

interface ParticipantRevealProps {
  state: AppState;
  onAdminLogin: () => void;
}

const CardContainer: React.FC<{ children: React.ReactNode; onAdminLogin: () => void }> = ({ children, onAdminLogin }) => (
  <div className="w-full max-w-md mx-auto mt-4 px-4 pb-12">
    <div className="candy-stripe-border relative z-10">
      <div className="bg-white rounded-[16px] px-4 py-8 sm:p-8 relative overflow-hidden min-h-[550px] flex flex-col items-center text-center shadow-inner">
          
          {/* Decorative Holly Corners (CSS Shapes for performance) */}
          <div className="absolute top-[-10px] left-[-10px] text-4xl transform -rotate-12 select-none">🌿</div>
          <div className="absolute top-[-10px] right-[-10px] text-4xl transform rotate-90 select-none">🌿</div>

          {children}
          
          {/* Subtle background texture */}
          <div className="absolute inset-0 pointer-events-none opacity-20" 
               style={{backgroundImage: 'radial-gradient(#ef4444 1.5px, transparent 1.5px), radial-gradient(#16a34a 1.5px, transparent 1.5px)', backgroundSize: '30px 30px', backgroundPosition: '0 0, 15px 15px'}}>
          </div>
      </div>
    </div>
    
    {/* Footer Link - Increased Z-Index to ensure clickability over fixed elements */}
    <div className="text-center mt-8 relative z-20">
      <button 
        onClick={onAdminLogin} 
        className="text-slate-900 font-bold text-sm sm:text-base flex items-center justify-center gap-1 mx-auto hover:text-green-900 transition-colors px-4 py-4"
      >
          soy amigo del grinch <ChevronRight size={20} strokeWidth={3} />
      </button>
    </div>
  </div>
);

export const ParticipantReveal: React.FC<ParticipantRevealProps> = ({ state, onAdminLogin }) => {
  const [selectedId, setSelectedId] = useState<string>('');
  const [isRevealed, setIsRevealed] = useState(false);
  const [poem, setPoem] = useState<string | null>(null);
  const [loadingPoem, setLoadingPoem] = useState(false);

  const currentUser = state.participants.find(p => p.id === selectedId);
  
  const handleReveal = async () => {
    if (!currentUser || !state.draw) return;
    
    setLoadingPoem(true);
    const receiverId = state.draw[currentUser.id];
    const receiver = state.participants.find(p => p.id === receiverId);
    
    if (receiver) {
      setIsRevealed(true);
      const generatedPoem = await generateGiftPoem(currentUser.name, receiver.name);
      setPoem(generatedPoem);
    }
    setLoadingPoem(false);
  };

  const resetView = () => {
    setIsRevealed(false);
    setSelectedId('');
    setPoem(null);
  };

  // Screen 1: Identification
  if (!isRevealed) {
    return (
      <CardContainer onAdminLogin={onAdminLogin}>
          <div className="mt-4 relative z-10 w-full flex flex-col items-center flex-1 h-full">
             <h1 className="text-2xl sm:text-3xl font-bold text-[#009e60] mb-6 tracking-tight">
               Hola, soy el Grinch
             </h1>
             
             <p className="text-black text-base sm:text-lg leading-snug mb-8 font-medium px-2 sm:px-4">
               Le robé esta lista a Papa Noel,
               <br />
               <span className="font-bold">¿Quién sos?</span> elegí tu nombre.
             </p>

             <div className="w-full sm:px-2 z-20 flex-1 flex flex-col">
                <div className="relative mb-6 group">
                  <select
                    value={selectedId}
                    onChange={(e) => setSelectedId(e.target.value)}
                    className="w-full bg-[#f3f4f6] text-gray-800 text-lg py-4 px-4 pr-10 rounded-xl outline-none appearance-none font-medium cursor-pointer border-2 border-transparent focus:border-green-500 transition-all shadow-sm"
                  >
                    <option value="">Elegí tu nombre</option>
                    {state.participants.sort((a,b) => a.name.localeCompare(b.name)).map(p => (
                      <option key={p.id} value={p.id}>{p.name}</option>
                    ))}
                  </select>
                  <div className="absolute right-4 top-1/2 transform -translate-y-1/2 pointer-events-none text-gray-400 group-hover:text-green-600 transition-colors">
                    <ChevronDown size={28} />
                  </div>
                </div>

                {/* Button pushed to bottom */}
                <div className="mt-auto w-full">
                    <button
                      disabled={!selectedId}
                      onClick={handleReveal}
                      className="w-full bg-[#b91c1c] hover:bg-[#991b1b] disabled:bg-gray-300 disabled:cursor-not-allowed text-white text-xl font-bold py-4 rounded-full shadow-lg active:scale-95 transition-all"
                    >
                      Abrí el sobre
                    </button>
                </div>
             </div>
          </div>
      </CardContainer>
    );
  }

  // Screen 2: The Reveal
  const receiverId = state.draw?.[selectedId] || '';
  const receiver = state.participants.find(p => p.id === receiverId);

  return (
    <CardContainer onAdminLogin={onAdminLogin}>
         <div className="mt-4 mb-6 relative z-10 w-full flex flex-col items-center h-full flex-1">
             <div className="mb-8 w-full">
                <p className="text-[#009e60] text-xs font-bold uppercase tracking-widest mb-2">Misión Secreta para</p>
                <h2 className="text-2xl sm:text-3xl font-black text-black mb-2 truncate px-2">{currentUser?.name}</h2>
                <div className="h-1.5 w-16 bg-red-500 mx-auto rounded-full"></div>
             </div>

             <div className="bg-red-50 rounded-2xl p-6 mx-0 sm:mx-2 mb-8 border-2 border-red-100 relative w-full shadow-sm transform rotate-1">
                <p className="text-slate-500 text-xs sm:text-sm font-bold uppercase mb-3">Tu víctima es:</p>
                <div className="flex flex-col sm:flex-row items-center justify-center gap-2 sm:gap-4">
                   <h2 className="text-3xl sm:text-4xl font-black text-[#b91c1c] tracking-tight break-words max-w-full text-center">
                     {receiver?.name}
                   </h2>
                </div>
             </div>

             <div className="px-2 sm:px-4 w-full flex-grow flex items-center justify-center">
               {loadingPoem && !poem ? (
                 <div className="text-[#009e60] font-bold animate-pulse py-4 flex flex-col items-center">
                   <span className="text-2xl mb-2">🤔</span>
                   El Grinch está tramando...
                 </div>
               ) : (
                 <p className="text-[#009e60] font-medium italic text-base sm:text-lg leading-relaxed">
                    "{poem}"
                 </p>
               )}
             </div>

             <div className="mt-auto w-full">
                <button 
                   onClick={resetView}
                   className="w-full text-gray-400 hover:text-red-500 text-sm font-bold underline p-4"
                >
                  Cerrar
                </button>
             </div>
         </div>
    </CardContainer>
  );
};