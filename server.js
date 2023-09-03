const express = require('express');
const http = require('http');
const WebSocket = require('ws');
const fs = require('fs');
const app = express();

// Serve static files from the "public" folder
app.use(express.static('public'));

// Create an HTTP server instance
const server = http.createServer(app);

// Create a WebSocket server by passing the HTTP server instance
const wss = new WebSocket.Server({ server });

// Define a route to serve your black and red page
app.get('/', (req, res) => {
  res.sendFile(__dirname + '/public/index.html');
});

// WebSocket server logic
wss.on('connection', (ws) => {
  ws.on('message', (message) => {
    console.log(`Received message: ${message}`);
    if (message === 'recordClick') {
      const currentDate = new Date().toLocaleString();
      fs.appendFile('clicks.txt', `${currentDate}\n`, (err) => {
        if (err) {
          console.error(err);
        } else {
          console.log('Click recorded.');
        }
      });
    }
  });
});

const listener = server.listen(process.env.PORT, () => {
  console.log('Your app is listening on port ' + listener.address().port);
});
