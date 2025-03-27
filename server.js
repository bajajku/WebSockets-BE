require('dotenv').config();
const express = require('express');
const http = require('http');
const WebSocket = require('ws');
const Message = require('./models/message');
const MessageClass = require('./models/messageClass');
const mongoose = require('mongoose');

// Initialize Express app
const app = express();
const port = process.env.PORT || 3000;

// Create HTTP server
const server = http.createServer(app);

// Create WebSocket server
const wss = new WebSocket.Server({ server });

// Store connected clients with their names
const clients = new Map(); // Using Map instead of Set to store client name with the connection

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/websocket-chat')
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => console.error('MongoDB connection error:', err));

// WebSocket server events
wss.on('connection', async (ws, req) => {
  console.log('Client connected');
  
  // Generate a unique ID for this client
  const clientId = Math.random().toString(36).substring(2, 10);
  
  // Initially set a placeholder name with the unique ID
  let clientName = `Guest-${clientId}`;
  clients.set(ws, clientName);
  
  try {
    // Load last 50 messages from MongoDB
    const lastMessages = await Message.find()
      .sort({ date: -1 })
      .limit(50)
      .lean();

    // Send welcome message
    const welcomeMessage = new MessageClass('server', 'Welcome to the WebSocket server!');
    ws.send(JSON.stringify(welcomeMessage));
    
    // Send chat history to the new client
    const historyMessage = new MessageClass('server', 'Loading chat history...');
    ws.send(JSON.stringify(historyMessage));
    
    // Send messages in chronological order (oldest first)
    lastMessages.reverse().forEach(msg => {
      const historicalMessage = new MessageClass(msg.userName, msg.message);
      ws.send(JSON.stringify(historicalMessage));
    });
  } catch (error) {
    console.error('Error loading chat history:', error);
    const errorMessage = new MessageClass('server', 'Error loading chat history');
    ws.send(JSON.stringify(errorMessage));
  }

  // Announce immediately that a new user has joined
  broadcastMessage(new MessageClass('server', `${clientName} has joined the chat`));
  
  // Handle messages from clients
  ws.on('message', (data) => {
    try {
      const receivedMsg = JSON.parse(data);
      console.log('Received message:', receivedMsg);
      
      // If this is the first message with a sender name, update their name
      if (receivedMsg.sender && receivedMsg.sender !== clientName && !clientName.includes(receivedMsg.sender)) {
        // Announce name change
        broadcastMessage(new MessageClass('server', `Guest-${clientId} is now known as ${receivedMsg.sender}`));
        
        // Update the client name
        clientName = receivedMsg.sender;
        clients.set(ws, clientName);
      }
      
      // Save message to database using Mongoose model
      const dbMessage = new Message({
        userName: receivedMsg.sender || clientName,
        message: receivedMsg.content,
        date: new Date()
      });
      
      // Save to database
      dbMessage.save()
        .then(() => console.log('Message saved to database'))
        .catch(err => console.error('Error saving message to database:', err));
      
      // Broadcast the message to all clients using MessageClass for in-memory messages
      broadcastMessage(new MessageClass(receivedMsg.sender || clientName, receivedMsg.content));
    } catch (error) {
      console.error('Error parsing message:', error);
    }
  });
  
  // Handle client disconnection
  ws.on('close', () => {
    const name = clients.get(ws) || 'Anonymous';
    console.log(`Client disconnected: ${name}`);
    
    // Announce that this user has left
    broadcastMessage(new MessageClass('server', `${name} has left the chat`));
    
    // Remove client from the map
    clients.delete(ws);
  });
  
  // Handle errors
  ws.on('error', (error) => {
    console.error('WebSocket error:', error);
  });
});

// Function to broadcast messages to all clients
function broadcastMessage(message) {
  const messageStr = JSON.stringify(message);
  clients.forEach((name, client) => {
    // Don't send the message back to the sender if excludeClient is provided
    if (client.readyState === WebSocket.OPEN) {
      client.send(messageStr);
    }
  });
}

// Basic route for testing
app.get('/', (req, res) => {
  res.send('WebSocket server is running');
});

// Start the server
server.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});


