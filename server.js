import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';

const app = express();
app.get('/', (req, res) => res.send('✅ Fully Automated Queue Server is running!'));

const httpServer = createServer(app);
const io = new Server(httpServer, { cors: { origin: "*" } });

let unassignedQueue = [];
let ticketCounter = 1;
const MAX_PER_CASHIER = 5; // The limit still exists, but is hidden from the display!

let cashiers = {
  1: { serving: null, line: [] },
  2: { serving: null, line: [] },
  3: { serving: null, line: [] }
};

const getLoad = (c) => (c.serving ? 1 : 0) + c.line.length;

// THE BRAIN: Automatically distributes anyone waiting if there is space
function balanceQueues() {
  let assigned = true;
  
  // Keep looping as long as we successfully assigned someone AND people are waiting
  while (assigned && unassignedQueue.length > 0) {
    let bestCashierId = null;
    let minLoad = Infinity;

    for (let i = 1; i <= 3; i++) {
      const load = getLoad(cashiers[i]);
      if (load < minLoad && load < MAX_PER_CASHIER) {
        minLoad = load;
        bestCashierId = i;
      }
    }

    if (bestCashierId) {
      const customer = unassignedQueue.shift();
      if (!cashiers[bestCashierId].serving) {
        cashiers[bestCashierId].serving = customer;
      } else {
        cashiers[bestCashierId].line.push(customer);
      }
    } else {
      assigned = false; // All cashiers are completely full (5/5)
    }
  }
}

io.on('connection', (socket) => {
  console.log('Client connected:', socket.id);
  socket.emit('queue-updated', { unassignedQueue, cashiers });

  // 1. Kiosk creates a ticket
  socket.on('add-ticket', (purpose) => {
    const newTicket = {
      id: `TKT-${ticketCounter.toString().padStart(3, '0')}`,
      purpose: purpose,
      timestamp: Date.now(),
    };

    unassignedQueue.push(newTicket);
    ticketCounter++;
    
    // Attempt to automatically assign them immediately
    balanceQueues(); 
    
    // Broadcast update and also send the ticket back to the Kiosk to show the user
    io.emit('queue-updated', { unassignedQueue, cashiers });
    socket.emit('ticket-generated', newTicket);
  });

  // 2. Cashier finishes a transaction
  socket.on('finish-serving', (cashierId) => {
    const c = cashiers[cashierId];
    
    // Pull the next person from their specific line, if any
    if (c.line.length > 0) {
      c.serving = c.line.shift(); 
    } else {
      c.serving = null; 
    }

    // Because this cashier just freed up space, pull from the global waitlist!
    balanceQueues();
    
    io.emit('queue-updated', { unassignedQueue, cashiers });
  });
});

// Change from '127.0.0.1' to '0.0.0.0'
const PORT = 3000;
const HOST = '0.0.0.0';

httpServer.listen(PORT, HOST, () => console.log(`✅ Automated Server running on port ${PORT}`));