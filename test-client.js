// const WebSocket = require('ws');

// // Connect to the WebSocket server
// const socket = new WebSocket('ws://localhost:3000');

// socket.on('open', () => {
//   console.log('Connected to the server');
  
//   // Send a test message
//   const message = {
//     sender: 'NodeClient',
//     content: 'Hello from Node.js client!'
//   };
//   socket.send(JSON.stringify(message));
// });

// socket.on('message', (data) => {
//   try {
//     const message = JSON.parse(data);
//     // Handle both message formats
//     const sender = message.sender || message.userName || 'Unknown';
//     const content = message.content || message.message || '';
//     console.log(`${sender}: ${content}`);
//   } catch (error) {
//     console.error('Error parsing message:', error);
//   }
// });

// socket.on('close', () => {
//   console.log('Connection closed');
// });

// socket.on('error', (error) => {
//   console.error('WebSocket error:', error);
// });

// // Send a message every 5 seconds
// setInterval(() => {
//   if (socket.readyState === WebSocket.OPEN) {
//     const message = {
//       sender: 'NodeClient',
//       content: 'Periodic message at ' + new Date().toLocaleTimeString()
//     };
//     socket.send(JSON.stringify(message));
//   }
// }, 5000);

// // Handle process termination
// process.on('SIGINT', () => {
//   console.log('Closing connection...');
//   socket.close();
//   process.exit();
// }); 