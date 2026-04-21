import React from 'react'
import { motion } from 'framer-motion'
import { MessageSquare, FolderPlus } from 'lucide-react'
import { store } from '../store/store.js'

export default function WelcomeView() {
  const startChat    = () => store.dispatch({ type: 'START_NEW_CHAT' })
  const startProject = () => store.dispatch({ type: 'SET_VIEW', payload: 'new-project' })

  return (
    <div style={{
      width: '100vw', height: '100vh',
      backgroundColor: '#F5F2F0',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      overflow: 'hidden',
    }}>
      {/* Soft decorative blob */}
      <div style={{
        position: 'absolute',
        width: 600, height: 600,
        borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(232,139,102,0.12) 0%, transparent 70%)',
        pointerEvents: 'none',
      }} />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: 'easeOut' }}
        style={{
          position: 'relative', zIndex: 2,
          display: 'flex', flexDirection: 'column',
          alignItems: 'center', gap: 0,
        }}
      >
        {/* Title */}
        <div style={{ textAlign: 'center', marginBottom: 16 }}>
          <h1 style={{
            fontSize: '3.5rem', fontWeight: 700, color: '#1A1614',
            letterSpacing: '0.1em', lineHeight: 1, margin: 0,
          }}>NIO</h1>

          <h2 style={{
            fontSize: '1.4rem', fontWeight: 400, color: '#8A7D78',
            letterSpacing: '0em', lineHeight: 1.3, margin: '8px 0 0',
          }}>NAFTAL Intelligent Optimizor</h2>

          <div style={{
            width: 100, height: 2.5, backgroundColor: '#E88B66',
            borderRadius: 2, margin: '16px auto 0',
          }} />
        </div>

        <p style={{
          color: '#4A3F3B', fontSize: '1rem',
          fontWeight: 400, marginTop: 10,
        }}>
          Votre assistant intelligent.
        </p>

        <p style={{
          color: '#8A7D78', fontSize: '0.85rem',
          marginTop: 6, marginBottom: 40,
        }}>
          Choisissez une option pour commencer.
        </p>

        {/* Cards */}
        <div style={{ display: 'flex', gap: 20 }}>
          <WelcomeCard
            icon={<MessageSquare size={26} color="#E88B66" />}
            title="Nouvelle Discussion"
            onClick={startChat}
          />
          <WelcomeCard
            icon={<FolderPlus size={26} color="#E88B66" />}
            title="Nouveau Projet"
            onClick={startProject}
          />
        </div>
      </motion.div>
    </div>
  )
}

function WelcomeCard({ icon, title, onClick }) {
  const [hov, setHov] = React.useState(false)
  return (
    <motion.button
      onClick={onClick}
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      whileHover={{ y: -4, boxShadow: '0 12px 32px rgba(0,0,0,0.1)' }}
      whileTap={{ scale: 0.97 }}
      style={{
        width: 220, height: 120,
        backgroundColor: hov ? '#FFF8F5' : '#FFFFFF',
        borderRadius: 20,
        border: `1.5px solid ${hov ? '#E88B66' : '#E8E2DE'}`,
        display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center', gap: 14,
        cursor: 'pointer',
        boxShadow: '0 2px 12px rgba(0,0,0,0.06)',
        transition: 'background-color 0.2s, border-color 0.2s',
      }}
    >
      <motion.div animate={{ scale: hov ? 1.12 : 1 }} transition={{ duration: 0.2 }}>
        {icon}
      </motion.div>
      <span style={{ color: '#1A1614', fontSize: '0.9rem', fontWeight: 600, textAlign: 'center' }}>
        {title}
      </span>
    </motion.button>
  )
}
