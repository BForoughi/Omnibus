import './App.css'
import { useState, useEffect } from 'react'

function App() {
  const [message, setMessage] = useState('Checking connection...');
  
  useEffect(() => {
    fetch('/api/hello')
      .then(response => {
        if (!response.ok) {
          throw new Error('Failed to connect to the backend API.');
        }
        return response.text();
      })
      .then(data => {
        setMessage(`Success! Backend says: "${data}"`);
      })
      .catch(err => {
        console.error('Connection Error:', err);
        setMessage('Connection Failed. Check your Node server and proxy settings.');
      })
  }, [])

  return (
    <div style={{ padding: '20px', border: '1px solid #ccc' }}>
      <h2>Connection Test Status</h2>
      <p>{message}</p>
    </div>
  )
}

export default App
