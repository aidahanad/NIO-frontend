import React from 'react'
import { motion } from 'framer-motion'
import { MessageSquare, FolderPlus } from 'lucide-react'
import { store } from '../store/store.js'

export default function WelcomeView() {
  const startChat = () => store.dispatch({ type: 'START_NEW_CHAT' })
  const startProject = () => store.dispatch({ type: 'SET_VIEW', payload: 'new-project' })

  return (
    <div style={{
      width: '100vw', height: '100vh',
      position: 'relative', overflow: 'hidden',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
    }}>
      <div className="animated-gradient" style={{ position: 'absolute', inset: 0, zIndex: 0 }} />

      <div style={{
        position: 'absolute', inset: 0, zIndex: 1,
        background: 'rgba(0,0,0,0.18)',
        backdropFilter: 'blur(0px)',
      }} />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: 'easeOut' }}
        style={{
          position: 'relative', zIndex: 2,
          display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 0,
        }}>

        <div style={{ textAlign: 'center', marginBottom: 16 }}>
          <h1 style={{
            fontSize: '3.2rem', fontWeight: 800, color: '#fff',
            letterSpacing: '0.25em', lineHeight: 1,
            textShadow: '0 2px 20px rgba(0,0,0,0.4)',
          }}>NIO</h1>
          <div style={{
            width: 48, height: 2.5, backgroundColor: '#E88B66',
            borderRadius: 2, margin: '10px auto 0',
            boxShadow: '0 0 12px rgba(232,139,102,0.6)',
          }} />
        </div>

        <p style={{
          color: 'rgba(255,255,255,0.85)', fontSize: '1rem',
          fontWeight: 300, letterSpacing: '0.02em', marginTop: 10,
        }}>Votre assistant intelligent.</p>

        <p style={{
          color: 'rgba(255,255,255,0.45)', fontSize: '0.85rem',
          marginTop: 10, marginBottom: 40,
        }}>Choisissez une option pour commencer.</p>

        <div style={{ display: 'flex', gap: 20 }}>
          <WelcomeCard
            icon={<MessageSquare size={26} color="#E88B66" />}
            title="Nouvelle Discussion"
            onClick={startChat} />
          <WelcomeCard
            icon={<FolderPlus size={26} color="#E88B66" />}
            title="Nouveau Projet"
            onClick={startProject} />
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
      whileHover={{ y: -4, boxShadow: '0 12px 32px rgba(0,0,0,0.35)' }}
      whileTap={{ scale: 0.97 }}
      style={{
        width: 180, height: 160,
        backgroundColor: 'rgba(68,58,54,0.55)',
        backdropFilter: 'blur(12px)',
        borderRadius: 20,
        border: '1px solid rgba(255,255,255,0.1)',
        display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center', gap: 14,
        cursor: 'pointer',
        boxShadow: '0 4px 16px rgba(0,0,0,0.25)',
        transition: 'background-color 0.2s',
      }}>
      <motion.div animate={{ scale: hov ? 1.12 : 1 }} transition={{ duration: 0.2 }}>
        {icon}
      </motion.div>
      <span style={{ color: '#fff', fontSize: '0.9rem', fontWeight: 600, textAlign: 'center' }}>
        {title}
      </span>
    </motion.button>
  )
}
