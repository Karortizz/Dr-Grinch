import React, { useState, useEffect } from 'react';
import { Plus, Trash2, Link as LinkIcon, Shuffle, AlertCircle, Eye, EyeOff, Check, RefreshCw, Smartphone, Edit3, X, AlertTriangle } from 'lucide-react';
import { Participant, DrawResult, AppState } from '../types';
import { generateDraw, encodeState } from '../services/logic';

interface AdminPanelProps {
  onDrawGenerated: (hash: string, state: AppState) => void;
  onPreview: (state: AppState) => void;
  initialState?: AppState | null;
}

type ConfirmationView = 'NONE' | 'MODIFY' | 'CLEAR';

export const AdminPanel: React.FC<AdminPanelProps> = ({ onDrawGenerated, onPreview, initialState }) => {
  const [participants, setParticipants] = useState<Participant[]>(initialState?.participants || []);
  const [newName, setNewName] = useState('');
  const [drawResult, setDrawResult] = useState<DrawResult | null>(initialState?.draw || null);
  const [error, setError] = useState<string | null>(null);
  const [showSpoilers, setShowSpoilers] = useState(false);
  const [shareUrl, setShareUrl] = useState<string | null>(null);
  const [hasCopied, setHasCopied] = useState(false);
  
  // State to manage which screen/view is shown
  const [confirmationView, setConfirmationView] = useState<ConfirmationView>('NONE');

  useEffect(() => {
    if (initialState && initialState.draw) {
       const hash = encodeState(initialState);
       const url = `${window.location.origin}${window.location.pathname}#${hash}`;
       setShareUrl(url);
    }
  }, [initialState]);

  const addParticipant = () => {
    if (!newName.trim()) return;
    const newId = crypto.randomUUID().slice(0, 8);
    setParticipants([...participants, { id: newId, name: newName.trim(), exclusions: [] }]);
    setNewName('');
    setDrawResult(null);
    setShareUrl(null);
  };

  const removeParticipant = (id: string) => {
    setParticipants(participants.filter(p => p.id !== id));
    setParticipants(prev => prev.map(p => ({
      ...p,
      exclusions: p.exclusions.filter(exId => exId !== id)
    })));
    setDrawResult(null);
    setShareUrl(null);
  };

  const toggleExclusion = (giverId: string, excludedId: string) => {
    setParticipants(prev => prev.map(p => {
      if (p.id !== giverId) return p;
      const isExcluded = p.exclusions.includes(excludedId);
      return {
        ...p,
        exclusions: isExcluded 
          ? p.exclusions.filter(id => id !== excludedId)
          : [...p.exclusions, excludedId]
      };
    }));
    setDrawResult(null);
    setShareUrl(null);
  };

  const handleDraw = () => {
    if (participants.length < 2) {
      setError("Necesitas al menos 2 personas para jugar.");
      return;
    }
    setError(null);
    const result = generateDraw(participants);
    
    if (result) {
      setDrawResult(result);
      const newState: AppState = {
        participants,
        draw: result,
        timestamp: Date.now()
      };
      const hash = encodeState(newState);
      const url = `${window.location.origin}${window.location.pathname}#${hash}`;
      setShareUrl(url);
      onDrawGenerated(hash, newState);
    } else {
      setError("¡IMPOSIBLE! Tus reglas son muy estrictas. Elimina algunas restricciones.");
    }
  };

  const copyToClipboard = () => {
    if (!shareUrl) return;
    navigator.clipboard.writeText(shareUrl).then(() => {
      setHasCopied(true);
      setTimeout(() => setHasCopied(false), 2000);
    });
  };

  const handlePreview = () => {
    if (drawResult) {
      const currentState: AppState = { participants, draw: drawResult, timestamp: Date.now() };
      onPreview(currentState);
    }
  };

  // --- CONFIRMATION HANDLERS ---

  const executeModify = () => {
    // Keep participants, clear draw
    setDrawResult(null);
    setShareUrl(null);
    setShowSpoilers(false);
    setConfirmationView('NONE');
  };

  const executeClearAll = () => {
    // Clear everything
    setParticipants([]);
    setDrawResult(null);
    setShareUrl(null);
    setShowSpoilers(false);
    window.history.pushState("", document.title, window.location.pathname + window.location.search);
    setConfirmationView('NONE');
  };

  // --- RENDER HELPERS ---

  const renderModifyConfirmation = () => (
    <div className="flex flex-col h-full animate-fade-in text-center justify-center">
      <div className="mb-6 text-yellow-600 flex justify-center">
        <AlertTriangle size={64} />
      </div>
      <h2 className="text-2xl font-black text-slate-800 mb-4">¿Estás seguro?</h2>
      <p className="text-slate-600 font-medium mb-8">
        Si modificas la lista ahora, <span className="text-red-600 font-bold">el sorteo actual se perderá</span>.
        <br/>
        El link que enviaste dejará de funcionar.
        <br/><br/>
        (Pero tranqui, los nombres se mantienen).
      </p>
      
      <div className="space-y-3">
        <button 
          onClick={executeModify}
          className="w-full bg-yellow-500 hover:bg-yellow-600 text-white font-bold py-4 rounded-xl shadow-md active:scale-95 transition-all"
        >
          Sí, quiero hacer cambios
        </button>
        <button 
          onClick={() => setConfirmationView('NONE')}
          className="w-full bg-slate-100 hover:bg-slate-200 text-slate-600 font-bold py-4 rounded-xl transition-all"
        >
          Cancelar
        </button>
      </div>
    </div>
  );

  const renderClearConfirmation = () => (
    <div className="flex flex-col h-full animate-fade-in text-center justify-center">
      <div className="mb-6 text-red-600 flex justify-center">
        <Trash2 size={64} />
      </div>
      <h2 className="text-2xl font-black text-slate-800 mb-4">¡Peligro!</h2>
      <p className="text-slate-600 font-medium mb-8">
        Esto borrará <span className="text-red-600 font-bold">TODOS los nombres</span> y el sorteo.
        <br/>
        Tendrás que empezar de cero.
        <br/><br/>
        ¿Realmente quieres borrar todo?
      </p>
      
      <div className="space-y-3">
        <button 
          onClick={executeClearAll}
          className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-4 rounded-xl shadow-md active:scale-95 transition-all"
        >
          Sí, BORRAR TODO
        </button>
        <button 
          onClick={() => setConfirmationView('NONE')}
          className="w-full bg-slate-100 hover:bg-slate-200 text-slate-600 font-bold py-4 rounded-xl transition-all"
        >
          Cancelar
        </button>
      </div>
    </div>
  );

  const renderMainContent = () => {
    if (drawResult) {
      // SUCCESS VIEW
      return (
        <div className="animate-fade-in flex flex-col h-full">
           <div className="flex-1">
              <div className="bg-green-50 p-6 rounded-2xl border-2 border-green-100 text-center mb-6">
                 <div className="inline-block p-3 bg-white rounded-full text-green-600 shadow-sm mb-3">
                    <Check size={32} strokeWidth={3} />
                 </div>
                 <h3 className="font-black text-green-800 text-xl mb-1">¡El mal está hecho!</h3>
                 <p className="text-green-700 text-sm font-medium mb-4">Comparte el link antes de que me arrepienta.</p>
                 
                 {/* Moved Preview Button Inside Green Box */}
                 <button 
                    onClick={handlePreview}
                    className="w-full bg-white border-2 border-[#009e60] text-[#009e60] hover:bg-green-600 hover:text-white font-bold py-2 px-4 rounded-xl flex items-center justify-center gap-2 transition-all shadow-sm text-sm"
                  >
                     <Smartphone size={18} /> Probar Link (Vista Previa)
                  </button>
              </div>
              
              <div className="mb-6">
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2 ml-1">Tu Enlace Malvado</label>
                <div className="flex gap-2">
                  <input 
                    readOnly 
                    value={shareUrl || ''} 
                    className="flex-1 bg-[#f3f4f6] text-gray-600 text-sm p-4 rounded-xl outline-none truncate font-medium border border-transparent focus:border-green-500"
                  />
                  <button 
                    onClick={copyToClipboard}
                    className="bg-[#009e60] hover:bg-[#007f4d] text-white px-5 rounded-xl font-bold transition-colors shadow-md active:scale-95 flex items-center justify-center"
                  >
                    {hasCopied ? <Check size={24} /> : <LinkIcon size={24} />}
                  </button>
                </div>
              </div>

              <div className="border-t border-slate-100 pt-4 mb-4">
                 <button 
                   onClick={() => setShowSpoilers(!showSpoilers)}
                   className="w-full py-3 px-4 flex justify-between items-center text-slate-600 bg-slate-50 hover:bg-slate-100 rounded-xl transition-colors mb-2"
                 >
                   <span className="font-bold text-sm flex items-center gap-2">
                     {showSpoilers ? <EyeOff size={18}/> : <Eye size={18}/>}
                     Espiar Resultados
                   </span>
                 </button>
                 
                 {showSpoilers && (
                   <div className="p-2 bg-slate-50 rounded-xl border border-slate-100 max-h-40 overflow-y-auto custom-scrollbar">
                     {participants.map(p => {
                        const receiverId = drawResult[p.id];
                        const receiver = participants.find(r => r.id === receiverId);
                        return (
                          <div key={p.id} className="flex items-center justify-between text-sm p-2 border-b border-slate-200 last:border-0">
                            <span className="font-bold text-slate-700">{p.name}</span>
                            <span className="text-slate-400">➜</span>
                            <span className="text-green-600 font-bold">{receiver?.name}</span>
                          </div>
                        )
                     })}
                   </div>
                 )}
              </div>
           </div>

           <div className="mt-auto space-y-3">
              <div className="flex gap-2">
                <button 
                  onClick={() => setConfirmationView('MODIFY')}
                  className="flex-1 bg-yellow-100 hover:bg-yellow-200 text-yellow-800 text-sm font-bold py-3 rounded-xl flex items-center justify-center gap-2 transition-colors"
                >
                  <Edit3 size={16} /> Modificar
                </button>
                <button 
                  onClick={() => setConfirmationView('CLEAR')}
                  className="flex-1 bg-red-100 hover:bg-red-200 text-red-800 text-sm font-bold py-3 rounded-xl flex items-center justify-center gap-2 transition-colors"
                >
                  <Trash2 size={16} /> Borrar Todo
                </button>
              </div>
           </div>
        </div>
      );
    }

    // SETUP VIEW (Add Participants)
    return (
      <>
        {/* Add Participant Input */}
        <div className="flex gap-2 mb-6">
          <input
            type="text"
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && addParticipant()}
            placeholder="Nombre de la víctima..."
            className="flex-1 bg-[#f3f4f6] text-gray-800 text-lg py-3 px-4 rounded-xl outline-none border-2 border-transparent focus:border-green-500 transition-all shadow-sm placeholder-gray-400"
          />
          <button 
            onClick={addParticipant}
            className="bg-[#009e60] hover:bg-[#007f4d] text-white p-3 rounded-xl font-bold shadow-md transition-colors active:scale-95 flex items-center justify-center min-w-[60px]"
          >
            <Plus size={28} />
          </button>
        </div>

        {/* List */}
        <div className="flex-1 overflow-y-auto mb-6 pr-1 custom-scrollbar">
          {participants.length > 0 && (
             <div className="flex justify-end mb-2">
                <button onClick={() => setConfirmationView('CLEAR')} className="text-xs font-bold text-red-400 hover:text-red-600 flex items-center gap-1">
                  <Trash2 size={12} /> BORRAR TODOS
                </button>
             </div>
          )}

          {participants.length === 0 && (
            <div className="text-center py-12 bg-slate-50 rounded-xl border-2 border-dashed border-slate-200">
              <p className="text-slate-400 font-bold text-lg">La lista está vacía...</p>
              <p className="text-slate-400 text-sm">¿Acaso nadie se merece un regalo?</p>
            </div>
          )}
          
          <div className="space-y-3">
            {participants.map(p => (
              <div key={p.id} className="bg-white p-3 rounded-xl border border-slate-100 shadow-sm hover:shadow-md transition-shadow">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-bold text-lg text-slate-800 pl-2 border-l-4 border-green-500">{p.name}</span>
                  <button onClick={() => removeParticipant(p.id)} className="text-slate-300 hover:text-red-500 transition-colors p-1">
                    <Trash2 size={20} />
                  </button>
                </div>
                
                {participants.length > 1 && (
                  <div className="pl-3">
                    <p className="text-[10px] font-bold text-slate-400 uppercase mb-1">PROHIBIDO REGALAR A:</p>
                    <div className="flex flex-wrap gap-1.5">
                      {participants.filter(target => target.id !== p.id).map(target => (
                        <button
                          key={target.id}
                          onClick={() => toggleExclusion(p.id, target.id)}
                          className={`px-2 py-1 rounded text-xs font-bold transition-all border ${
                            p.exclusions.includes(target.id)
                              ? 'bg-red-50 text-red-600 border-red-200 line-through'
                              : 'bg-white text-slate-400 border-slate-200 hover:border-green-400 hover:text-green-600'
                          }`}
                        >
                          {target.name}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 text-red-800 rounded-xl flex items-center gap-3 border border-red-200 font-medium animate-pulse">
            <AlertCircle size={20} className="shrink-0" />
            {error}
          </div>
        )}

        {/* Action Button */}
        <button 
          onClick={handleDraw}
          disabled={participants.length < 2}
          className="w-full bg-[#b91c1c] hover:bg-[#991b1b] disabled:bg-gray-300 disabled:cursor-not-allowed text-white text-xl font-black py-4 rounded-full shadow-lg active:scale-95 transition-all flex justify-center items-center gap-2"
        >
          <Shuffle size={24} /> ¡SORTEAR YA!
        </button>
      </>
    );
  };

  return (
    <div className="w-full max-w-2xl mx-auto mt-4 px-4 pb-12">
      <div className="candy-stripe-border relative">
        <div className="bg-white rounded-[16px] px-4 py-8 sm:p-8 relative overflow-hidden min-h-[600px] flex flex-col shadow-inner">
          
          {/* Decorative Corners */}
          <div className="absolute top-[-10px] left-[-10px] text-4xl transform -rotate-12 select-none">🌿</div>
          <div className="absolute top-[-10px] right-[-10px] text-4xl transform rotate-90 select-none">🌿</div>

          {/* Header (Only show on Main View) */}
          {confirmationView === 'NONE' && (
            <div className="text-center mb-6">
              <h1 className="text-3xl sm:text-4xl font-black text-[#b91c1c] uppercase tracking-tight mb-2">
                Lista de Traviesos
              </h1>
              <p className="text-slate-500 font-medium">
                Planifica el caos (digo, el sorteo).
              </p>
            </div>
          )}

          {/* Content Routing */}
          {confirmationView === 'MODIFY' && renderModifyConfirmation()}
          {confirmationView === 'CLEAR' && renderClearConfirmation()}
          {confirmationView === 'NONE' && renderMainContent()}
          
        </div>
      </div>
    </div>
  );
};