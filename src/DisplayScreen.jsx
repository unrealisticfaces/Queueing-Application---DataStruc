import React, { useState, useEffect } from 'react';
import { Clock, Monitor, ArrowRight, Tag } from 'lucide-react';
import { io } from 'socket.io-client';

const socket = io(`http://${window.location.hostname}:3000`);

export default function DisplayScreen() {
  const [unassignedQueue, setUnassignedQueue] = useState([]);
  const [cashiers, setCashiers] = useState({ 1: { serving: null, isAccepting: true }, 2: { serving: null, isAccepting: true }, 3: { serving: null, isAccepting: true } });

  useEffect(() => {
    socket.on('queue-updated', (data) => {
      setUnassignedQueue(data.unassignedQueue);
      setCashiers(data.cashiers);
    });
    return () => socket.off('queue-updated');
  }, []);

  const getPriorityColor = (purpose, defaultColor) => {
    if (purpose === 'Senior' || purpose === 'PWD') return 'text-yellow-400';
    return defaultColor;
  };

  return (
    <div className="h-screen w-screen overflow-hidden bg-slate-900 text-slate-100 p-6 flex flex-col gap-6 font-sans">
      
      <header className="flex items-center justify-between border-b border-slate-800 pb-4 shrink-0">
        <h1 className="text-4xl font-bold text-white tracking-tight flex items-center gap-4">
          <Monitor className="text-indigo-500" size={40} />
          Now Serving
        </h1>
        <div className="bg-slate-800 px-6 py-2 rounded-full border border-slate-700 flex items-center gap-3">
          <Clock size={20} className="text-slate-400"/>
          <span className="text-xl font-bold">{unassignedQueue.length} Waiting</span>
        </div>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 flex-[2] min-h-0">
        {[1, 2, 3].map((id) => {
          const c = cashiers[id];
          return (
            <div key={id} className={`rounded-3xl p-8 flex flex-col items-center justify-center border-2 transition-colors duration-300 h-full ${
              c?.serving ? 'bg-slate-800 border-indigo-500/50 shadow-lg' : 'bg-slate-800/20 border-slate-800/50'
            }`}>
              <h3 className="text-slate-400 font-bold tracking-widest uppercase text-2xl mb-6 text-center shrink-0">
                Cashier {id}
              </h3>
              
              <div className="flex flex-col items-center justify-center w-full bg-slate-900/50 rounded-2xl border border-slate-800 flex-1">
                {c?.serving ? (
                  <div className="text-center flex flex-col items-center">
                    <div className={`text-7xl font-extrabold mb-4 tracking-tighter ${getPriorityColor(c.serving.purpose, 'text-emerald-400')}`}>
                      {c.serving.id}
                    </div>
                    {c.serving.purpose !== 'Senior' && c.serving.purpose !== 'PWD' && (
                      <div className={`text-lg uppercase tracking-wider font-bold bg-slate-800 px-6 py-2 rounded-full border border-slate-700 flex items-center justify-center gap-2 text-slate-300`}>
                        <Tag size={16} className="text-indigo-400" /> {c.serving.purpose}
                      </div>
                    )}
                  </div>
                ) : c?.isAccepting ? (
                  <div className="text-slate-600 text-4xl font-medium">Available</div>
                ) : (
                  <div className="text-rose-500/50 text-4xl font-bold tracking-widest uppercase">Closed</div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      <div className="bg-slate-800/40 rounded-3xl p-6 border border-slate-700/50 flex-[3] flex flex-col min-h-0">
        <h3 className="text-2xl font-bold mb-6 text-slate-300 flex items-center gap-3 shrink-0">
          Global Waiting List <ArrowRight className="text-slate-500" size={24}/>
        </h3>
        
        <div className="flex-1 overflow-hidden">
          {unassignedQueue.length === 0 ? (
            <div className="h-full flex items-center justify-center text-slate-500 text-2xl border-2 border-dashed border-slate-700/50 rounded-2xl">
              No one is currently waiting.
            </div>
          ) : (
            <div className="flex flex-wrap gap-4 content-start h-full overflow-y-auto pr-2 pb-2">
              {unassignedQueue.map((ticket) => (
                <div key={ticket.id} className={`bg-slate-900/80 border-2 px-6 py-4 rounded-xl flex flex-col items-center justify-center shadow-lg shrink-0 ${
                  (ticket.purpose === 'Senior' || ticket.purpose === 'PWD') ? 'border-yellow-400/40' : 'border-slate-700/80'
                }`}>
                  <span className={`font-bold text-3xl tracking-tight ${getPriorityColor(ticket.purpose, 'text-white')}`}>
                    {ticket.id}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

    </div>
  );
}