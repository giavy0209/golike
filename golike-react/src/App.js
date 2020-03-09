import React from 'react';
import './App.css';
import io from 'socket.io-client'

const socket = io()

function App() {
  return (
    <div className="App">
      <p>Test app</p>
    </div>
  );
}

export default App;
