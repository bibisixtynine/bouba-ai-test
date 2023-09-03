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

// Store mouse positions
const mousePositions = [];

// Define a route to serve your black and red page
app.get('/', (req, res) => {
  res.sendFile(__dirname + '/public/index.html');
});

// WebSocket server logic
wss.on('connection', (ws) => {
  ws.on('message', (message) => {
    console.log(`Received message: <${message}>`);

    if (typeof message === 'string') {
      console.log(message.startsWith('mousePosition'))
      if (message === 'recordClick') {
        const currentDate = new Date().toLocaleString();
        fs.appendFile('clicks.txt', `${currentDate}\n`, (err) => {
          if (err) {
            console.error(err);
          } else {
            console.log('Click recorded.');
          }
        });
      } else if (message.startsWith('mousePosition')) {
        console.log("mousePosition received")
        const [, mouseX, mouseY] = message.split(',');
        const timestamp = Date.now();
        mousePositions.push({ timestamp, x: mouseX, y: mouseY });

        // Limit the array size to 30 records per second
        if (mousePositions.length > 30) {
          mousePositions.shift();
        }

        // Send mouse position to all clients
        console.log("S1/3 send message")
        wss.clients.forEach((client) => {
          console.log("S2/3 send message")
          if (client.readyState === WebSocket.OPEN) {
            console.log("S3/3 to client n?")
            client.send(`mousePosition,${mouseX},${mouseY}`);
          }
        });

        // Write the mouse positions to a file every second
        if (mousePositions.length === 30) {
          const dataToWrite = mousePositions
            .map(({ timestamp, x, y }) => `${timestamp},${x},${y}`)
            .join('\n');
          fs.appendFile('mouse_positions.txt', dataToWrite, (err) => {
            if (err) {
              console.error(err);
            } else {
              console.log('Mouse positions recorded.');
            }
          });
          mousePositions.length = 0; // Clear the array
        }
      }
    }
  });
});



const listener = server.listen(process.env.PORT, () => {
  console.log('Your app is listening on port ' + listener.address().port);
});

