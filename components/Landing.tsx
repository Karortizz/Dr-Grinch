import React, { useState } from 'react';
import { Lock, KeyRound } from 'lucide-react';

interface LandingProps {
  onAdminLogin: () => void;
}

export const Landing: React.FC<LandingProps> = ({ onAdminLogin }) => {
  // Simplificamos Landing para que el botón "Ingresar como Admin" también dispare el modal del App principal, 
  // en lugar de manejar el login aquí. Esto centraliza la contraseña en el modal.
  
  return (
    <div className="w-full max-w-md mx-auto mt-4 px-4 pb-12">
      <div className="candy-stripe-border relative">
        <div className="bg-white rounded-[16px] px-6 py-10 relative overflow-hidden min-h-[400px] flex flex-col items-center text-center shadow-inner">
          
          {/* Decorative Corners */}
          <div className="absolute top-[-10px] left-[-10px] text-4xl transform -rotate-12 select-none">🌿</div>
          <div className="absolute top-[-10px] right-[-10px] text-4xl transform rotate-90 select-none">🌿</div>
          
          {/* Background Texture */}
          <div className="absolute inset-0 pointer-events-none opacity-20" 
               style={{backgroundImage: 'radial-gradient(#ef4444 1.5px, transparent 1.5px), radial-gradient(#16a34a 1.5px, transparent 1.5px)', backgroundSize: '30px 30px', backgroundPosition: '0 0, 15px 15px'}}>
          </div>

          <div className="relative z-10 w-full flex-1 flex flex-col justify-center">
            
              <div className="mb-8">
                <h1 className="text-3xl font-black text-[#b91c1c] mb-4 tracking-tight uppercase">
                  ¡Alto ahí!
                </h1>
                <p className="text-slate-700 text-lg font-medium leading-snug">
                  Este sorteo es <span className="font-bold text-green-700">PRIVADO</span>.
                  <br/><br/>
                  Si no tenés un link mágico de invitación... ¡largo de mi vista!
                </p>
              </div>

              <div className="mt-auto">
                <p className="text-sm text-slate-400 font-bold mb-4 uppercase tracking-widest">¿Sos el organizador?</p>
                <button 
                  onClick={onAdminLogin}
                  className="w-full bg-[#f3f4f6] hover:bg-[#e5e7eb] text-slate-600 font-bold py-4 rounded-xl transition-all flex items-center justify-center gap-2 group border-2 border-transparent hover:border-green-200"
                >
                  <KeyRound size={20} className="group-hover:text-green-600 transition-colors" />
                  <span>Ingresar como Admin</span>
                </button>
              </div>
            
          </div>
        </div>
      </div>
    </div>
  );
};