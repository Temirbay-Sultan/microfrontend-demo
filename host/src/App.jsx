import React, { Suspense, useState } from 'react'

// Динамический импорт микрофронтендов
const ReactCounter = React.lazy(() => import('reactMf/Counter'))
const VueTodoWrapper = React.lazy(() => import('./VueWrapper'))

function App() {
  const [activeTab, setActiveTab] = useState('all')

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '20px' }}>
      <header style={{ textAlign: 'center', marginBottom: '30px' }}>
        <h1 style={{ fontSize: '2.5rem', marginBottom: '10px' }}>
          🏗️ Microfrontend Demo
        </h1>
        <p style={{ opacity: 0.7 }}>
          React + Vue работают вместе через Module Federation
        </p>
      </header>

      {/* Навигация */}
      <nav style={{
        display: 'flex',
        justifyContent: 'center',
        gap: '10px',
        marginBottom: '30px'
      }}>
        {['all', 'react', 'vue'].map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            style={{
              padding: '10px 25px',
              fontSize: '16px',
              border: 'none',
              borderRadius: '25px',
              cursor: 'pointer',
              backgroundColor: activeTab === tab ? '#7c3aed' : '#374151',
              color: 'white',
              transition: 'all 0.3s'
            }}
          >
            {tab === 'all' && '📦 Все'}
            {tab === 'react' && '⚛️ React'}
            {tab === 'vue' && '🟢 Vue'}
          </button>
        ))}
      </nav>

      {/* Контейнер микрофронтендов */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: activeTab === 'all' ? 'repeat(auto-fit, minmax(400px, 1fr))' : '1fr',
        gap: '20px'
      }}>
        <Suspense fallback={<LoadingCard text="Загрузка React..." />}>
          {(activeTab === 'all' || activeTab === 'react') && (
            <MicrofrontendCard title="React Microfrontend" color="#61dafb">
              <ReactCounter />
            </MicrofrontendCard>
          )}
        </Suspense>

        <Suspense fallback={<LoadingCard text="Загрузка Vue..." />}>
          {(activeTab === 'all' || activeTab === 'vue') && (
            <MicrofrontendCard title="Vue Microfrontend" color="#42b883">
              <VueTodoWrapper />
            </MicrofrontendCard>
          )}
        </Suspense>
      </div>

      {/* Информация */}
      <footer style={{
        marginTop: '40px',
        padding: '20px',
        backgroundColor: 'rgba(255,255,255,0.05)',
        borderRadius: '12px',
        textAlign: 'center'
      }}>
        <h3 style={{ marginBottom: '15px' }}>🎯 Принципы микрофронтендов:</h3>
        <div style={{
          display: 'flex',
          justifyContent: 'center',
          gap: '30px',
          flexWrap: 'wrap'
        }}>
          <Feature icon="🔀" text="Независимый деплой" />
          <Feature icon="🛠️" text="Разные технологии" />
          <Feature icon="👥" text="Автономные команды" />
          <Feature icon="📦" text="Изолированный код" />
        </div>
      </footer>
    </div>
  )
}

function MicrofrontendCard({ title, color, children }) {
  return (
    <div style={{
      backgroundColor: 'rgba(255,255,255,0.05)',
      borderRadius: '12px',
      padding: '20px',
      borderLeft: `4px solid ${color}`
    }}>
      <h2 style={{ color, marginBottom: '15px' }}>{title}</h2>
      {children}
    </div>
  )
}

function LoadingCard({ text }) {
  return (
    <div style={{
      padding: '40px',
      textAlign: 'center',
      backgroundColor: 'rgba(255,255,255,0.05)',
      borderRadius: '12px'
    }}>
      <div style={{ fontSize: '24px', marginBottom: '10px' }}>⏳</div>
      {text}
    </div>
  )
}

function Feature({ icon, text }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
      <span style={{ fontSize: '20px' }}>{icon}</span>
      <span>{text}</span>
    </div>
  )
}

export default App
