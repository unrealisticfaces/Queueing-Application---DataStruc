import React, { useState, useEffect, useRef } from 'react';
import { CreditCard, HelpCircle, Package } from 'lucide-react';
import { io } from 'socket.io-client';

const socket = io(`http://${window.location.hostname}:3000`);

export default function AdminScreen() {
  const [issuedTicket, setIssuedTicket] = useState(null);
  const timerRef = useRef(null);

  useEffect(() => {
    socket.on('ticket-generated', (ticket) => {
      setIssuedTicket(ticket);
      if (timerRef.current) clearTimeout(timerRef.current);
      
      // Auto-reset after 5 seconds without user clicking
      timerRef.current = setTimeout(() => {
        setIssuedTicket(null);
      }, 5000);
    });

    return () => {
      socket.off('ticket-generated');
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, []);

  const handleCreateTicket = (purpose) => {
    socket.emit('add-ticket', purpose);
  };

  const handleResetKiosk = () => {
    if (timerRef.current) clearTimeout(timerRef.current);
    setIssuedTicket(null);
  };

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 flex flex-col items-center justify-center p-8 font-sans">
      
      {issuedTicket ? (
        // Static, solid, non-animated success screen
        <div className="flex flex-col items-center w-full max-w-sm">
          <h2 className="text-3xl font-bold text-white mb-8 text-center">
            You are in line!
          </h2>

          <div className="bg-slate-100 text-slate-900 rounded-2xl w-full p-8 text-center mb-8 border border-slate-300">
            <div className="text-sm font-bold text-slate-500 uppercase tracking-widest mb-4">
              {issuedTicket.purpose}
            </div>
            
            <div className="text-7xl font-black mb-6 tracking-tighter text-slate-900">
              {issuedTicket.id}
            </div>
            
            <div className="border-t border-slate-300 pt-6 mt-2">
              <p className="text-slate-600 font-medium text-sm">
                Please look at the TV monitor for your number.
              </p>
            </div>
          </div>

          <button 
            onClick={handleResetKiosk}
            className="w-full text-white bg-slate-800 hover:bg-slate-700 py-4 px-6 rounded-xl border border-slate-700 font-bold text-lg"
          >
            Issue Another Ticket
          </button>
        </div>

      ) : (
        // Static selection screen with no hover animations
        <div className="w-full max-w-5xl text-center">
          <h1 className="text-5xl font-extrabold text-white mb-4 tracking-tight">Welcome</h1>
          <p className="text-xl text-slate-400 mb-12">Please tap the purpose of your visit to get a ticket.</p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <button 
              onClick={() => handleCreateTicket('Payment')}
              className="bg-slate-800 border-2 border-slate-700 hover:border-indigo-500 hover:bg-slate-800/80 p-10 rounded-2xl flex flex-col items-center gap-6"
            >
              <div className="bg-slate-900 p-6 rounded-full">
                <CreditCard size={48} className="text-indigo-400" />
              </div>
              <span className="text-2xl font-bold text-slate-200">Payment</span>
            </button>

            <button 
              onClick={() => handleCreateTicket('Customer Service')}
              className="bg-slate-800 border-2 border-slate-700 hover:border-amber-500 hover:bg-slate-800/80 p-10 rounded-2xl flex flex-col items-center gap-6"
            >
              <div className="bg-slate-900 p-6 rounded-full">
                <HelpCircle size={48} className="text-amber-400" />
              </div>
              <span className="text-2xl font-bold text-slate-200">Customer Service</span>
            </button>

            <button 
              onClick={() => handleCreateTicket('Returns / Pickup')}
              className="bg-slate-800 border-2 border-slate-700 hover:border-emerald-500 hover:bg-slate-800/80 p-10 rounded-2xl flex flex-col items-center gap-6"
            >
              <div className="bg-slate-900 p-6 rounded-full">
                <Package size={48} className="text-emerald-400" />
              </div>
              <span className="text-2xl font-bold text-slate-200">Returns / Pickup</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}