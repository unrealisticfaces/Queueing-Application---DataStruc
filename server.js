import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';

const app = express();
app.get('/', (req, res) => res.send('Fully Automated Queue Server is running!'));

const httpServer = createServer(app);
const io = new Server(httpServer, { cors: { origin: "*" } });

let unassignedQueue = [];
let ticketCounter = 1;

let cashiers = {
  1: { serving: null, isAccepting: true },
  2: { serving: null, isAccepting: true },
  3: { serving: null, isAccepting: true }
};

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
    let availableCashierId = null;

    for (let i = 1; i <= 3; i++) {
      if (cashiers[i].isAccepting && !cashiers[i].serving) {
        availableCashierId = i;
        break;
      }
    }

    if (availableCashierId) {
      const customer = unassignedQueue.shift();
      cashiers[availableCashierId].serving = customer;
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
    if (cashiers[cashierId]) {
      cashiers[cashierId].serving = null; 
    }

    balanceQueues();
    
    io.emit('queue-updated', { unassignedQueue, cashiers });
  });

  socket.on('toggle-accepting', ({ cashierId, isAccepting }) => {
    if (cashiers[cashierId]) {
      cashiers[cashierId].isAccepting = isAccepting;
      if (isAccepting) {
        balanceQueues();
      }
      io.emit('queue-updated', { unassignedQueue, cashiers });
    }
  });
});

const PORT = 3000;
const HOST = '0.0.0.0';

httpServer.listen(PORT, HOST, () => console.log(`Automated Server running on port ${PORT}`));