import React from 'react'
import Counter from './Counter'

function App() {
  return (
    <div style={{ padding: '20px', border: '2px solid #61dafb', borderRadius: '8px', margin: '10px' }}>
      <h2 style={{ color: '#61dafb' }}>⚛️ React Microfrontend</h2>
      <p>Это независимый React-модуль</p>
      <Counter />
    </div>
  )
}

export default App
