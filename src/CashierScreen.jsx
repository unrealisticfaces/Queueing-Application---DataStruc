import React, { useState, useEffect } from 'react';
import { Monitor, CheckCircle, Users, AlertTriangle } from 'lucide-react';
import { io } from 'socket.io-client';

const socket = io(`http://${window.location.hostname}:3000`);

export default function CashierScreen() {
  const [terminalId, setTerminalId] = useState(null);
  const [cashiers, setCashiers] = useState({ 1: { serving: null, line: [] }, 2: { serving: null, line: [] }, 3: { serving: null, line: [] } });
  
  // State to control our confirmation pop-up
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    socket.on('queue-updated', (data) => setCashiers(data.cashiers));
    return () => socket.off('queue-updated');
  }, []);

  // Triggered from inside the modal
  const confirmFinish = () => {
    socket.emit('finish-serving', terminalId);
    setShowModal(false);
  };

  // Step 1: Select which terminal this screen represents
  if (!terminalId) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center p-8 font-sans">
        <div className="bg-slate-800 p-10 rounded-3xl border border-slate-700 w-full max-w-lg text-center shadow-2xl">
          <Monitor size={48} className="text-indigo-400 mx-auto mb-6" />
          <h2 className="text-2xl font-bold text-white mb-8">Select Your Terminal</h2>
          <div className="grid grid-cols-1 gap-4">
            {[1, 2, 3].map(id => (
              <button key={id} onClick={() => setTerminalId(id)} className="bg-slate-700 hover:bg-indigo-600 text-white font-bold py-4 rounded-xl text-xl transition-colors">
                Cashier Terminal {id}
              </button>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // Step 2: The actual working dashboard for that specific cashier
  const myData = cashiers[terminalId];

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 p-8 font-sans flex items-center justify-center relative">
      
      {/* --- CONFIRMATION MODAL --- */}
      {showModal && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-slate-800 border border-slate-700 rounded-3xl p-8 max-w-md w-full shadow-2xl animate-in zoom-in-95 duration-200 text-center">
            <div className="w-16 h-16 rounded-full bg-amber-500/20 text-amber-500 flex items-center justify-center mb-6 mx-auto">
              <AlertTriangle size={32} />
            </div>
            <h3 className="text-2xl font-bold text-white mb-2">Complete Transaction?</h3>
            <p className="text-slate-400 mb-8">
              Are you sure you are done serving <strong>{myData.serving?.id}</strong>? The system will immediately assign the next customer to you.
            </p>
            <div className="flex gap-4">
              <button 
                onClick={() => setShowModal(false)}
                className="flex-1 py-4 px-4 bg-slate-700 hover:bg-slate-600 text-white font-bold rounded-2xl transition-colors"
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
      {/* --------------------------- */}

      <div className="w-full max-w-2xl bg-slate-800/50 rounded-3xl p-10 border border-slate-700/50 shadow-2xl text-center">
        <header className="flex justify-between items-center mb-10 pb-6 border-b border-slate-700">
          <h1 className="text-2xl font-bold text-slate-300 flex items-center gap-3">
            <Monitor className="text-indigo-400" /> Terminal {terminalId}
          </h1>
          <button onClick={() => setTerminalId(null)} className="text-sm text-slate-500 hover:text-white underline">Switch Terminal</button>
        </header>

        <div className="mb-12">
          <h2 className="text-slate-400 uppercase tracking-widest font-bold mb-4">Currently Serving</h2>
          {myData.serving ? (
            <div className="animate-in zoom-in">
              <div className="text-7xl font-black text-emerald-400 mb-2">{myData.serving.id}</div>
              <div className="text-xl text-slate-300 bg-slate-900 inline-block px-4 py-1 rounded-full border border-slate-700">
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
          className="w-full bg-emerald-500 hover:bg-emerald-400 text-slate-900 disabled:opacity-20 disabled:hover:bg-emerald-500 font-black py-6 rounded-2xl text-2xl flex justify-center items-center gap-3 transition-all shadow-lg shadow-emerald-500/20"
        >
          <CheckCircle size={32} /> Complete Transaction
        </button>

        <div className="mt-8 flex items-center justify-center gap-3 text-slate-400">
          <Users size={20} />
          <span>There are <strong>{myData.line.length}</strong> people waiting directly in your line.</span>
        </div>
      </div>
    </div>
  );
}