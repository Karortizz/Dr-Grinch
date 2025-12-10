import React, { useState } from 'react';
import { Lock, X } from 'lucide-react';

interface AdminLoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export const AdminLoginModal: React.FC<AdminLoginModalProps> = ({ isOpen, onClose, onSuccess }) => {
  const [password, setPassword] = useState('');
  const [error, setError] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (password === 'navidad2025') {
      onSuccess();
      setPassword('');
      setError(false);
    } else {
      setError(true);
      setTimeout(() => setError(false), 2000);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose}></div>
      
      <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl overflow-hidden relative z-10 animate-fade-in candy-stripe-border p-2">
        <div className="bg-white rounded-xl p-6 relative">
            <button 
              onClick={onClose}
              className="absolute top-4 right-4 text-slate-400 hover:text-red-500 transition-colors"
            >
              <X size={24} />
            </button>

            <div className="text-center mb-6">
              <h2 className="text-2xl font-black text-[#b91c1c] uppercase tracking-tight mb-2">
                Zona Prohibida
              </h2>
              <p className="text-slate-500 font-medium text-sm">
                Solo para el Grinch y sus secuaces.
              </p>
            </div>

            <form onSubmit={handleSubmit}>
              <div className="relative mb-6">
                <div className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400">
                  <Lock size={20} />
                </div>
                <input 
                  type="password" 
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    setError(false);
                  }}
                  placeholder="Contraseña..."
                  className={`w-full bg-[#f3f4f6] text-gray-800 font-bold text-lg py-3 pl-12 pr-4 rounded-xl outline-none border-2 transition-all placeholder-gray-400 ${
                    error 
                    ? 'border-red-500 bg-red-50 text-red-900 focus:border-red-500' 
                    : 'border-transparent focus:border-green-500'
                  }`}
                  autoFocus
                />
              </div>

              {error && (
                <div className="mb-4 text-center text-red-600 font-bold text-sm animate-pulse">
                  ¡Contraseña incorrecta! 😡
                </div>
              )}

              <button 
                type="submit"
                className="w-full bg-[#b91c1c] hover:bg-[#991b1b] text-white text-lg font-bold py-3 rounded-full shadow-lg active:scale-95 transition-all"
              >
                Ingresar
              </button>
            </form>
        </div>
      </div>
    </div>
  );
};