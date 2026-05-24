import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';

const app = express();
app.get('/', (req, res) => res.send('✅ Fully Automated Queue Server is running!'));

const httpServer = createServer(app);
const io = new Server(httpServer, { cors: { origin: "*" } });

let unassignedQueue = [];
let ticketCounter = 1;
const MAX_PER_CASHIER = 5;

let cashiers = {
  1: { serving: null, line: [] },
  2: { serving: null, line: [] },
  3: { serving: null, line: [] }
};

const getLoad = (c) => (c.serving ? 1 : 0) + c.line.length;

function addTicketToQueue(queue, ticket) {
  const isPriority = ticket.purpose === 'Senior' || ticket.purpose === 'PWD';
  if (isPriority) {
    const firstNormalIndex = queue.findIndex(t => t.purpose !== 'Senior' && t.purpose !== 'PWD');
    if (firstNormalIndex === -1) {
      queue.push(ticket);
    } else {
      queue.splice(firstNormalIndex, 0, ticket);
    }
  } else {
    queue.push(ticket);
  }
}

function balanceQueues() {
  let assigned = true;
  
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
        addTicketToQueue(cashiers[bestCashierId].line, customer);
      }
    } else {
      assigned = false;
    }
  }
}

io.on('connection', (socket) => {
  socket.emit('queue-updated', { unassignedQueue, cashiers });

  socket.on('add-ticket', (purpose) => {
    const newTicket = {
      id: `TKT-${ticketCounter.toString().padStart(3, '0')}`,
      purpose: purpose,
      timestamp: Date.now(),
    };

    addTicketToQueue(unassignedQueue, newTicket);
    ticketCounter++;
    
    balanceQueues(); 
    
    io.emit('queue-updated', { unassignedQueue, cashiers });
    socket.emit('ticket-generated', newTicket);
  });

  socket.on('finish-serving', (cashierId) => {
    const c = cashiers[cashierId];
    
    if (c.line.length > 0) {
      c.serving = c.line.shift(); 
    } else {
      c.serving = null; 
    }

    balanceQueues();
    
    io.emit('queue-updated', { unassignedQueue, cashiers });
  });
});

const PORT = 3000;
const HOST = '0.0.0.0';

httpServer.listen(PORT, HOST, () => console.log(`✅ Automated Server running on port ${PORT}`));