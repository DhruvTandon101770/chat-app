const express = require('express');
const http = require('http');
const path = require('path');
const WebSocket = require('ws');
const mysql = require('mysql');

const port = 6969;
const app = express();
const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

// MySQL connection
const connection = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: '',
  database: 'chatapp'
});

connection.connect((err) => {
  if (err) {
    console.error('Error connecting to database:', err);
    return;
  }
  console.log('Connected to database!');
});

// Serve the HTML and JavaScript files
app.use(express.static(path.join(__dirname, '../client')));
app.use(express.json());

// Sign-up route
app.post('/signup', (req, res) => {
  const { username, password } = req.body;

  // Check if the user already exists
  connection.query('SELECT * FROM users WHERE username = ?', [username], (err, results) => {
    if (err) {
      console.error('Error checking for existing user:', err);
      return res.status(500).send('Internal server error');
    }

    if (results.length > 0) {
      return res.status(409).send('Username already exists');
    }

    // Create a new user
    connection.query('INSERT INTO users (username, password) VALUES (?, ?)', [username, password], (err, result) => {
      if (err) {
        console.error('Error creating new user:', err);
        return res.status(500).send('Internal server error');
      }

      res.status(201).send('User created successfully');
    });
  });
});

// Login route
app.post('/login', (req, res) => {
  const { username, password } = req.body;

  // Check if the user exists and the password is correct
  connection.query('SELECT * FROM users WHERE username = ?', [username], (err, results) => {
    if (err) {
      console.error('Error checking for existing user:', err);
      return res.status(500).send('Internal server error');
    }

    if (results.length === 0 || results[0].password !== password) {
      return res.status(401).send('Invalid username or password');
    }

    res.status(200).send('Login successful');
  });
});

wss.on('connection', (ws) => {
  console.log('New client connected');

  // Fetch and send previous messages to the new client
  connection.query('SELECT * FROM chat_messages', (err, results) => {
    if (err) {
      console.error('Error fetching messages:', err);
      return;
    }

    results.forEach((message) => {
      ws.send(JSON.stringify(message));
    });
  });

  ws.on('message', (message) => {
    console.log(`Received message: ${message}`);

    // Store the message in the database
    connection.query('INSERT INTO chat_messages (username, content) VALUES (?, ?)', [message.username, message.content], (err, result) => {
      if (err) {
        console.error('Error storing message:', err);
        return;
      }

      // Broadcast the message to all connected clients
      wss.clients.forEach((client) => {
        if (client !== ws && client.readyState === WebSocket.OPEN) {
          client.send(JSON.stringify(message));
        }
      });
    });
  });

  ws.on('close', () => {
    console.log('Client has disconnected');
  });
});

server.listen(port, () => {
  console.log(`Server is listening on ${port}`);
});