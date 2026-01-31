import React, { useState } from 'react'

function Counter() {
  const [count, setCount] = useState(0)

  return (
    <div style={{
      padding: '15px',
      backgroundColor: '#282c34',
      borderRadius: '8px',
      color: 'white',
      marginTop: '10px'
    }}>
      <h3>React Counter Component</h3>
      <p>Счётчик: <strong>{count}</strong></p>
      <button
        onClick={() => setCount(c => c + 1)}
        style={{
          padding: '10px 20px',
          fontSize: '16px',
          backgroundColor: '#61dafb',
          border: 'none',
          borderRadius: '4px',
          cursor: 'pointer',
          marginRight: '10px'
        }}
      >
        +1
      </button>
      <button
        onClick={() => setCount(0)}
        style={{
          padding: '10px 20px',
          fontSize: '16px',
          backgroundColor: '#ff6b6b',
          color: 'white',
          border: 'none',
          borderRadius: '4px',
          cursor: 'pointer'
        }}
      >
        Сброс
      </button>
    </div>
  )
}

export default Counter
