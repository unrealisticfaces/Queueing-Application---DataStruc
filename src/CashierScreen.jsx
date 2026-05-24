import React, { useState, useEffect } from 'react';
import { Monitor, CheckCircle, AlertTriangle, Power } from 'lucide-react';
import { io } from 'socket.io-client';

const socket = io(`http://${window.location.hostname}:3000`);

export default function CashierScreen() {
  const [terminalId, setTerminalId] = useState(null);
  const [cashiers, setCashiers] = useState({ 1: { serving: null, isAccepting: true }, 2: { serving: null, isAccepting: true }, 3: { serving: null, isAccepting: true } });
  
  const [showModal, setShowModal] = useState(false);
  const [showToggleModal, setShowToggleModal] = useState(false);

  useEffect(() => {
    socket.on('queue-updated', (data) => setCashiers(data.cashiers));
    return () => socket.off('queue-updated');
  }, []);

  const confirmFinish = () => {
    socket.emit('finish-serving', terminalId);
    setShowModal(false);
  };

  const handleToggle = () => {
    const myData = cashiers[terminalId] || { serving: null, isAccepting: true };
    if (myData.isAccepting) {
      setShowToggleModal(true);
    } else {
      socket.emit('toggle-accepting', { cashierId: terminalId, isAccepting: true });
    }
  };

  const confirmToggleOff = () => {
    socket.emit('toggle-accepting', { cashierId: terminalId, isAccepting: false });
    setShowToggleModal(false);
  };

  if (!terminalId) {
    return (
      <div className="min-h-screen bg-[#121212] flex items-center justify-center p-8 font-sans">
        <div className="bg-[#1e1e1e] p-10 rounded-3xl border border-amber-500/20 w-full max-w-lg text-center shadow-2xl">
          <Monitor size={48} className="text-amber-500 mx-auto mb-6" />
          <h2 className="text-2xl font-bold text-white mb-8">Select Your Terminal</h2>
          <div className="grid grid-cols-1 gap-4">
            {[1, 2, 3].map(id => (
              <button key={id} onClick={() => setTerminalId(id)} className="bg-[#2a2a2a] hover:bg-amber-500 hover:text-[#121212] text-amber-500 font-bold py-4 rounded-xl text-xl transition-colors">
                Cashier Terminal {id}
              </button>
            ))}
          </div>
        </div>
      </div>
    );
  }

  const myData = cashiers[terminalId] || { serving: null, isAccepting: true };

  return (
    <div className="min-h-screen bg-[#121212] text-slate-100 p-8 font-sans flex items-center justify-center relative">
      
      {showModal && (
        <div className="fixed inset-0 bg-[#0a0a0a]/80 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-[#1e1e1e] border border-amber-500/30 rounded-3xl p-8 max-w-md w-full shadow-2xl animate-in zoom-in-95 duration-200 text-center">
            <div className="w-16 h-16 rounded-full bg-amber-500/20 text-amber-500 flex items-center justify-center mb-6 mx-auto">
              <AlertTriangle size={32} />
            </div>
            <h3 className="text-2xl font-bold text-white mb-2">Complete Transaction?</h3>
            <p className="text-slate-400 mb-8">
              Are you sure you are done serving <strong>{myData.serving?.id}</strong>?
            </p>
            <div className="flex gap-4">
              <button 
                onClick={() => setShowModal(false)}
                className="flex-1 py-4 px-4 bg-[#2a2a2a] hover:bg-[#3a3a3a] text-white font-bold rounded-2xl transition-colors"
              >
                Cancel
              </button>
              <button 
                onClick={confirmFinish}
                className="flex-1 py-4 px-4 bg-emerald-500 hover:bg-emerald-600 text-slate-900 font-bold rounded-2xl transition-colors shadow-lg shadow-emerald-500/20"
              >
                Yes, Complete
              </button>
            </div>
          </div>
        </div>
      )}

      {showToggleModal && (
        <div className="fixed inset-0 bg-[#0a0a0a]/80 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-[#1e1e1e] border border-amber-500/30 rounded-3xl p-8 max-w-md w-full shadow-2xl animate-in zoom-in-95 duration-200 text-center">
            <div className="w-16 h-16 rounded-full bg-rose-500/20 text-rose-500 flex items-center justify-center mb-6 mx-auto">
              <Power size={32} />
            </div>
            <h3 className="text-2xl font-bold text-white mb-2">Stop Accepting Customers?</h3>
            <p className="text-slate-400 mb-8">
              You will no longer pull new customers from the global waiting list after your current transaction.
            </p>
            <div className="flex gap-4">
              <button 
                onClick={() => setShowToggleModal(false)}
                className="flex-1 py-4 px-4 bg-[#2a2a2a] hover:bg-[#3a3a3a] text-white font-bold rounded-2xl transition-colors"
              >
                Cancel
              </button>
              <button 
                onClick={confirmToggleOff}
                className="flex-1 py-4 px-4 bg-rose-500 hover:bg-rose-600 text-white font-bold rounded-2xl transition-colors shadow-lg shadow-rose-500/20"
              >
                Yes, Stop
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="w-full max-w-2xl bg-[#1e1e1e] rounded-3xl p-10 border border-[#2a2a2a] shadow-2xl text-center">
        <header className="flex justify-between items-center mb-10 pb-6 border-b border-[#2a2a2a]">
          <h1 className="text-2xl font-bold text-slate-300 flex items-center gap-3">
            <Monitor className="text-amber-500" /> Terminal {terminalId}
          </h1>
          <div className="flex items-center gap-6">
            <button 
              onClick={handleToggle}
              className={`flex items-center gap-2 px-4 py-2 rounded-full font-bold text-sm transition-colors border ${
                myData.isAccepting 
                ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20 hover:bg-emerald-500/20' 
                : 'bg-rose-500/10 text-rose-400 border-rose-500/20 hover:bg-rose-500/20'
              }`}
            >
              <Power size={16} />
              {myData.isAccepting ? 'Accepting Customers' : 'Not Accepting'}
            </button>
            <button onClick={() => setTerminalId(null)} className="text-sm text-slate-500 hover:text-amber-500 underline">Switch Terminal</button>
          </div>
        </header>

        <div className="mb-12">
          <h2 className="text-slate-400 uppercase tracking-widest font-bold mb-4">Currently Serving</h2>
          {myData.serving ? (
            <div className="animate-in zoom-in">
              <div className="text-7xl font-black text-amber-500 mb-2">{myData.serving.id}</div>
              <div className="text-xl text-slate-300 bg-[#121212] inline-block px-4 py-1 rounded-full border border-[#2a2a2a]">
                {myData.serving.purpose}
              </div>
            </div>
          ) : (
            <div className="text-4xl text-slate-500 font-medium py-8">Idle / Waiting</div>
          )}
        </div>

        <button 
          onClick={() => setShowModal(true)}
          disabled={!myData.serving}
          className="w-full bg-amber-500 hover:bg-amber-400 text-[#121212] disabled:opacity-20 disabled:hover:bg-amber-500 font-black py-6 rounded-2xl text-2xl flex justify-center items-center gap-3 transition-all shadow-lg shadow-amber-500/20"
        >
          <CheckCircle size={32} /> Complete Transaction
        </button>
      </div>
    </div>
  );
}