import React, { useState } from 'react';
import { Users, UserPlus, Play, Star, User, Clock } from 'lucide-react';

export default function App() {
  const [queue, setQueue] = useState([]);
  const [currentlyServing, setCurrentlyServing] = useState(null);
  const [ticketCounter, setTicketCounter] = useState(1);
  
  const [name, setName] = useState('');
  const [priority, setPriority] = useState('2'); 

  const handleEnqueue = (e) => {
    e.preventDefault();
    if (!name.trim()) return;

    const newTicket = {
      id: `TKT-${ticketCounter.toString().padStart(3, '0')}`,
      name: name,
      priority: parseInt(priority),
      timestamp: Date.now(),
    };

    setQueue((prevQueue) => {
      const newQueue = [...prevQueue, newTicket];
      // Priority Queue Algorithm: Sort by priority (1 is highest), then by time (FIFO)
      return newQueue.sort((a, b) => {
        if (a.priority === b.priority) {
          return a.timestamp - b.timestamp; 
        }
        return a.priority - b.priority;
      });
    });

    setTicketCounter(prev => prev + 1);
    setName('');
  };

  const handleDequeue = () => {
    if (queue.length === 0) return;
    
    const nextPerson = queue[0];
    setCurrentlyServing(nextPerson);
    setQueue(prevQueue => prevQueue.slice(1));
  };

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 p-8 font-sans selection:bg-indigo-500/30">
      <header className="mb-10 flex items-center justify-between border-b border-slate-800 pb-6">
        <div>
          <h1 className="text-3xl font-bold text-white tracking-tight flex items-center gap-3">
            <Users className="text-indigo-400" size={32} />
            FlowState Queue
          </h1>
          <p className="text-slate-400 mt-1">Smart Priority Ticketing System</p>
        </div>
        <div className="bg-slate-800 px-4 py-2 rounded-full border border-slate-700 flex items-center gap-2">
          <Clock size={16} className="text-slate-400"/>
          <span className="text-sm font-medium">{queue.length} Waiting</span>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Input & Controls */}
        <div className="lg:col-span-4 space-y-6">
          <div className="bg-slate-800/50 rounded-2xl p-6 border border-slate-700/50 backdrop-blur-xl">
            <h2 className="text-xl font-semibold mb-6 flex items-center gap-2">
              <UserPlus size={20} className="text-indigo-400" />
              Issue New Ticket
            </h2>
            
            <form onSubmit={handleEnqueue} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-400 mb-2">Customer Name</label>
                <input 
                  type="text" 
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all"
                  placeholder="e.g. Jane Doe"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-slate-400 mb-2">Priority Level</label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setPriority('2')}
                    className={`py-3 rounded-xl border flex items-center justify-center gap-2 transition-all ${priority === '2' ? 'bg-indigo-500/20 border-indigo-500 text-indigo-300' : 'bg-slate-900 border-slate-700 text-slate-400 hover:border-slate-500'}`}
                  >
                    <User size={18} /> Regular
                  </button>
                  <button
                    type="button"
                    onClick={() => setPriority('1')}
                    className={`py-3 rounded-xl border flex items-center justify-center gap-2 transition-all ${priority === '1' ? 'bg-amber-500/20 border-amber-500 text-amber-300' : 'bg-slate-900 border-slate-700 text-slate-400 hover:border-slate-500'}`}
                  >
                    <Star size={18} /> VIP
                  </button>
                </div>
              </div>

              <button 
                type="submit" 
                disabled={!name.trim()}
                className="w-full bg-indigo-500 hover:bg-indigo-600 text-white font-medium py-3 rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed mt-4"
              >
                Add to Queue
              </button>
            </form>
          </div>

          <button 
            onClick={handleDequeue}
            disabled={queue.length === 0}
            className="w-full bg-emerald-500/10 border border-emerald-500/30 hover:bg-emerald-500/20 text-emerald-400 font-semibold py-4 rounded-2xl flex items-center justify-center gap-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Play size={20} />
            Call Next Customer
          </button>
        </div>

        {/* Displays */}
        <div className="lg:col-span-8 space-y-6">
          <div className="bg-gradient-to-br from-indigo-900/40 to-slate-800/40 rounded-2xl p-8 border border-indigo-500/20 flex flex-col items-center justify-center min-h-[200px] text-center">
            <h3 className="text-indigo-300 font-medium tracking-widest uppercase text-sm mb-4">Now Serving</h3>
            {currentlyServing ? (
              <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                <div className="text-6xl font-bold text-white mb-2 tracking-tight">
                  {currentlyServing.id}
                </div>
                <div className="text-2xl text-slate-300 flex items-center justify-center gap-2">
                  {currentlyServing.priority === 1 && <Star className="text-amber-400" size={24} />}
                  {currentlyServing.name}
                </div>
              </div>
            ) : (
              <div className="text-slate-500 text-xl">Waiting for next customer...</div>
            )}
          </div>

          <div className="bg-slate-800/30 rounded-2xl p-6 border border-slate-700/50">
            <h3 className="text-lg font-semibold mb-4 text-slate-300">Up Next</h3>
            {queue.length === 0 ? (
              <div className="text-center py-12 text-slate-500 border-2 border-dashed border-slate-700 rounded-xl">
                The queue is currently empty.
              </div>
            ) : (
              <div className="space-y-3">
                {queue.map((ticket, index) => (
                  <div key={ticket.timestamp} className="flex items-center justify-between bg-slate-900/50 border border-slate-700/50 p-4 rounded-xl">
                    <div className="flex items-center gap-4">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold ${ticket.priority === 1 ? 'bg-amber-500/20 text-amber-400' : 'bg-slate-800 text-slate-300'}`}>
                        {index + 1}
                      </div>
                      <div>
                        <div className="font-semibold text-slate-200">{ticket.id}</div>
                        <div className="text-sm text-slate-400">{ticket.name}</div>
                      </div>
                    </div>
                    <div>
                      {ticket.priority === 1 ? (
                        <span className="px-3 py-1 bg-amber-500/10 text-amber-400 text-xs font-medium rounded-full border border-amber-500/20">VIP</span>
                      ) : (
                        <span className="px-3 py-1 bg-slate-800 text-slate-400 text-xs font-medium rounded-full border border-slate-700">Regular</span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}