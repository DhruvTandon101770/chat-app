// Login and Signup functionality
document.addEventListener('DOMContentLoaded', () => {
    const loginForm = document.getElementById('login-form');
    const signupForm = document.getElementById('signup-form');
  
    // Signup form submission
    signupForm.addEventListener('submit', async (event) => {
      event.preventDefault();
      const username = document.getElementById('username').value.trim();
      const password = document.getElementById('password').value.trim();
  
      // Validate username and password
      if (!username || !password) {
        alert('Please enter a username and password.');
        return;
      }
  
      if (username.length < 4 || password.length < 6) {
        alert('Username must be at least 4 characters and password must be at least 6 characters.');
        return;
      }
  
      try {
        const response = await fetch('/signup', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ username, password })
        });
  
        if (response.ok) {
          alert('Sign up successful! Please login.');
          window.location.href = 'login.html';
        } else if (response.status === 409) {
          alert('Username already exists');
        } else {
          alert('An error occurred during sign up');
        }
      } catch (error) {
        console.error('Error signing up:', error);
        alert('An error occurred during sign up');
      }
    });
  
    // Login form submission
    loginForm.addEventListener('submit', async (event) => {
      event.preventDefault();
      const username = document.getElementById('username').value.trim();
      const password = document.getElementById('password').value.trim();
  
      // Validate username and password
      if (!username || !password) {
        alert('Please enter a username and password.');
        return;
      }
  
      try {
        const response = await fetch('/login', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ username, password })
        });
  
        if (response.ok) {
          // Redirect to the chat page
          window.location.href = 'chat.html';
        } else if (response.status === 401) {
          alert('Invalid username or password');
        } else {
          alert('An error occurred during login');
        }
      } catch (error) {
        console.error('Error logging in:', error);
        alert('An error occurred during login');
      }
    });
  });
  
  // Chat functionality
  document.addEventListener('DOMContentLoaded', () => {
    const ws = new WebSocket('ws://localhost:6969');
    const messageInput = document.getElementById('message-input');
    const sendButton = document.getElementById('send-button');
    const chatMessages = document.querySelector('.chat-messages');
  
    ws.onopen = () => {
      console.log('WebSocket connection opened');
    };
  
    ws.onmessage = (event) => {
      const message = JSON.parse(event.data);
      const messageElement = document.createElement('div');
      messageElement.textContent = `${message.username}: ${message.content}`;
      chatMessages.appendChild(messageElement);
      chatMessages.scrollTop = chatMessages.scrollHeight;
    };
  
    ws.onclose = () => {
      console.log('WebSocket connection closed');
    };z
  
    sendButton.addEventListener('click', () => {
      const message = {
        username: 'myUsername',
        content: messageInput.value
      };
      ws.send(JSON.stringify(message));
      messageInput.value = '';
    });
  });