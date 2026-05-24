import React, { useState, useEffect } from 'react';
import { Clock, Monitor, ArrowRight, Tag } from 'lucide-react';
import { io } from 'socket.io-client';

const socket = io(`http://${window.location.hostname}:3000`);

export default function DisplayScreen() {
  const [unassignedQueue, setUnassignedQueue] = useState([]);
  const [cashiers, setCashiers] = useState({ 1: { serving: null, line: [] }, 2: { serving: null, line: [] }, 3: { serving: null, line: [] } });

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
    <div className="min-h-screen bg-slate-900 text-slate-100 p-8 font-sans flex flex-col gap-8">
      
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

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 flex-[3]">
        {[1, 2, 3].map((id) => {
          const c = cashiers[id];
          return (
            <div key={id} className={`rounded-3xl p-6 flex flex-col border-2 transition-colors duration-300 ${
              c.serving ? 'bg-slate-800 border-indigo-500/50 shadow-lg' : 'bg-slate-800/20 border-slate-800/50'
            }`}>
              <h3 className="text-slate-400 font-bold tracking-widest uppercase text-xl mb-3 text-center shrink-0">
                Cashier {id}
              </h3>
              
              <div className="flex flex-col items-center justify-center mb-4 bg-slate-900/50 rounded-2xl border border-slate-800 shrink-0 h-32">
                {c.serving ? (
                  <div className="text-center flex flex-col items-center">
                    <div className={`text-6xl font-extrabold mb-2 tracking-tighter ${getPriorityColor(c.serving.purpose, 'text-emerald-400')}`}>
                      {c.serving.id}
                    </div>
                    {c.serving.purpose !== 'Senior' && c.serving.purpose !== 'PWD' && (
                      <div className={`text-xs uppercase tracking-wider font-bold bg-slate-800 px-4 py-1 rounded-full border border-slate-700 flex items-center justify-center gap-2 text-slate-300`}>
                        <Tag size={12} className="text-indigo-400" /> {c.serving.purpose}
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="text-slate-600 text-3xl font-medium">Available</div>
                )}
              </div>

              <div className="bg-slate-900/80 rounded-xl px-4 py-4 border border-slate-700/50 flex flex-col flex-1 min-h-[200px]">
                <div className="text-xs text-indigo-400 uppercase tracking-widest font-bold mb-3 shrink-0">
                  Line for Cashier {id}
                </div>
                
                <div className="flex flex-col gap-2 overflow-y-auto pr-2 max-h-[250px]">
                  {c.line.length === 0 ? (
                    <div className="text-slate-600 text-sm italic mt-1">No one currently in this line</div>
                  ) : (
                    c.line.map((tkt, index) => (
                      <div key={tkt.id} className={`bg-slate-800 border px-4 py-2 rounded-lg flex items-center justify-between gap-3 shrink-0 ${
                        (tkt.purpose === 'Senior' || tkt.purpose === 'PWD') ? 'border-yellow-400/20' : 'border-slate-700'
                      }`}>
                        <div className="flex items-center gap-3">
                          <span className="text-slate-500 text-sm font-bold w-4">{index + 1}.</span>
                          <span className={`font-bold text-xl ${getPriorityColor(tkt.purpose, 'text-slate-200')}`}>{tkt.id}</span>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="bg-slate-800/40 rounded-3xl p-6 border border-slate-700/50 flex-[2] flex flex-col min-h-[250px]">
        <h3 className="text-xl font-bold mb-4 text-slate-300 flex items-center gap-3 shrink-0">
          Waiting to be assigned <ArrowRight className="text-slate-500" size={20}/>
        </h3>
        
        <div className="flex-1">
          {unassignedQueue.length === 0 ? (
            <div className="h-full flex items-center justify-center text-slate-500 text-lg border-2 border-dashed border-slate-700/50 rounded-2xl min-h-[150px]">
              All tickets have been assigned to a cashier.
            </div>
          ) : (
            <div className="flex flex-wrap gap-3 content-start h-full overflow-y-auto pr-2 pb-2 max-h-[200px]">
              {unassignedQueue.map((ticket) => (
                <div key={ticket.id} className={`bg-slate-900/80 border px-5 py-3 rounded-xl flex flex-col items-center justify-center shadow-lg h-fit ${
                  (ticket.purpose === 'Senior' || ticket.purpose === 'PWD') ? 'border-yellow-400/40' : 'border-slate-700/80'
                }`}>
                  <span className={`font-bold text-2xl tracking-tight ${getPriorityColor(ticket.purpose, 'text-white')}`}>
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