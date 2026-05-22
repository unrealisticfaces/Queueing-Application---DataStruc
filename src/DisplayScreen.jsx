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

  return (
    <div className="h-screen overflow-hidden bg-slate-900 text-slate-100 p-8 font-sans flex flex-col">
      
      <header className="mb-6 flex items-center justify-between border-b border-slate-800 pb-4 shrink-0">
        <h1 className="text-4xl font-bold text-white tracking-tight flex items-center gap-4">
          <Monitor className="text-indigo-500" size={40} />
          Now Serving
        </h1>
        <div className="bg-slate-800 px-6 py-2 rounded-full border border-slate-700 flex items-center gap-3">
          <Clock size={20} className="text-slate-400"/>
          <span className="text-xl font-bold">{unassignedQueue.length} Waiting</span>
        </div>
      </header>

      {/* TOP SECTION: Cashiers */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6 shrink-0 h-[55vh]">
        {[1, 2, 3].map((id) => {
          const c = cashiers[id];
          return (
            <div key={id} className={`rounded-3xl p-6 flex flex-col border-2 transition-colors duration-300 h-full ${
              c.serving ? 'bg-slate-800 border-indigo-500/50 shadow-lg' : 'bg-slate-800/20 border-slate-800/50'
            }`}>
              <h3 className="text-slate-400 font-bold tracking-widest uppercase text-xl mb-3 text-center">
                Cashier {id}
              </h3>
              
              {/* Serving Box - Made slightly shorter to give the line below it more room */}
              <div className="h-40 flex flex-col items-center justify-center mb-4 bg-slate-900/50 rounded-2xl border border-slate-800 shrink-0">
                {c.serving ? (
                  <div className="text-center flex flex-col items-center">
                    <div className="text-7xl font-extrabold text-emerald-400 mb-2 tracking-tighter">
                      {c.serving.id}
                    </div>
                    {/* We keep purpose here just so the active customer knows it's them */}
                    <div className="text-xs uppercase tracking-wider font-bold text-slate-300 bg-slate-800 px-4 py-1 rounded-full border border-slate-700 flex items-center justify-center gap-2">
                      <Tag size={12} className="text-indigo-400" /> {c.serving.purpose}
                    </div>
                  </div>
                ) : (
                  <div className="text-slate-600 text-3xl font-medium">Available</div>
                )}
              </div>

              {/* The Assigned Line (Now strictly vertical) */}
              <div className="bg-slate-900/80 rounded-xl px-4 py-4 border border-slate-700/50 flex-1 flex flex-col overflow-hidden">
                <div className="text-xs text-indigo-400 uppercase tracking-widest font-bold mb-3">
                  Line for Cashier {id}
                </div>
                
                {/* Vertical flex column layout */}
                <div className="flex-1 flex flex-col gap-2 overflow-hidden">
                  {c.line.length === 0 ? (
                    <div className="text-slate-600 text-sm italic mt-1">No one currently in this line</div>
                  ) : (
                    c.line.map((tkt, index) => (
                      <div key={tkt.id} className="bg-slate-800 border border-slate-700 px-4 py-2 rounded-lg flex items-center gap-3">
                        <span className="text-slate-500 text-sm font-bold w-4">{index + 1}.</span>
                        <span className="font-bold text-slate-200 text-xl">{tkt.id}</span>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* BOTTOM SECTION: Waiting to be assigned (Clean, private pills) */}
      <div className="bg-slate-800/40 rounded-3xl p-6 border border-slate-700/50 flex-1 flex flex-col overflow-hidden">
        <h3 className="text-xl font-bold mb-4 text-slate-300 flex items-center gap-3 shrink-0">
          Waiting to be assigned <ArrowRight className="text-slate-500" size={20}/>
        </h3>
        
        <div className="flex-1 overflow-hidden">
          {unassignedQueue.length === 0 ? (
            <div className="h-full flex items-center justify-center text-slate-500 text-lg border-2 border-dashed border-slate-700/50 rounded-2xl">
              All tickets have been assigned to a cashier.
            </div>
          ) : (
            <div className="flex flex-wrap gap-3 content-start h-full">
              {/* Purpose text has been completely removed from these pills */}
              {unassignedQueue.map((ticket) => (
                <div key={ticket.id} className="bg-slate-900/80 border border-slate-700/80 px-5 py-3 rounded-xl flex items-center shadow-lg h-fit">
                  <span className="font-bold text-white text-2xl tracking-tight">{ticket.id}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

    </div>
  );
}