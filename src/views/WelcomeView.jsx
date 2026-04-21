import React from 'react'
import { motion } from 'framer-motion'
import { MessageSquare, FolderPlus } from 'lucide-react'
import { store } from '../store/store.js'

export default function WelcomeView() {
  const startChat = () => store.dispatch({ type: 'START_NEW_CHAT' })
  const startProject = () => store.dispatch({ type: 'SET_VIEW', payload: 'new-project' })

  return (
    <div className="animated-gradient" style={{
      width: '100vw',
      height: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      overflow: 'hidden',
      position: 'relative',
      flexDirection: 'column',
      gap: 18,
    }}>

      {/* soft atmospheric glow layer */}
      <div style={{
        position: 'absolute',
        inset: 0,
        backdropFilter: 'blur(40px)',
        WebkitBackdropFilter: 'blur(40px)',
        background: 'rgba(255,255,255,0.04)',
        pointerEvents: 'none',
      }} />

      {/* CONTENT */}
      <motion.div
        initial={{ opacity: 0, y: 18 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: 'easeOut' }}
        style={{
          position: 'relative',
          zIndex: 2,
          textAlign: 'center',
        }}
      >
        {/* Title */}
      <h1 style={{
        fontSize: '3.8rem',
        fontWeight: 700,
        margin: 0,
        letterSpacing: '0.1em',

        // ✨ neon gradient text
        background: 'linear-gradient(90deg, #E88B66, #bf8d77, #ffb38a, #e8b466)',
        backgroundSize: '200% 100%',
        WebkitBackgroundClip: 'text',
        WebkitTextFillColor: 'transparent',

        // 🌟 glow
        textShadow: '0 0 10px rgba(232, 139, 102, 0.3), 0 0 25px rgba(255, 255, 255, 0.4)',

        // 🎞 animation
        animation: 'neoShine 4s ease-in-out infinite',
      }}>
        NIO
      </h1>

        <h2 style={{
          fontSize: '1.2rem',
          fontWeight: 400,
          color: 'rgba(255,255,255,0.85)',
          marginTop: 2,
        }}>
          NAFTAL Intelligent Optimizor
        </h2>

        <div style={{
          width: 90,
          height: 2,
          backgroundColor: '#E88B66',
          borderRadius: 999,
          margin: '18px auto 0',
        }} />

        <p style={{
          color: 'rgba(255,255,255,0.85)',
          marginTop: 18,
          fontSize: '1rem',
        }}>
          Votre assistant intelligent.
        </p>

        <p style={{
          color: 'rgba(255,255,255,0.6)',
          fontSize: '0.85rem',
          marginTop: 6,
        }}>
          Choisissez une option pour commencer.
        </p>
      </motion.div>

      {/* CARDS */}
      <motion.div
        initial={{ opacity: 0, y: 25 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15, duration: 0.6 }}
        style={{
          display: 'flex',
          gap: 20,
          position: 'relative',
          zIndex: 2,
        }}
      >
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
      whileHover={{ y: -5 }}
      whileTap={{ scale: 0.97 }}
      style={{
        width: 230,
        height: 120,
        borderRadius: 20,
        border: `1px solid ${hov ? '#E88B66' : 'rgba(255,255,255,0.15)'}`,
        background: hov ? 'rgba(255,255,255,0.10)' : 'rgba(255,255,255,0.06)',
        backdropFilter: 'blur(12px)',
        WebkitBackdropFilter: 'blur(12px)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 12,
        cursor: 'pointer',
        transition: 'all 0.25s ease',
        boxShadow: hov ? '0 12px 40px rgba(0,0,0,0.25)' : '0 6px 20px rgba(0,0,0,0.15)',
      }}
    >
      <motion.div animate={{ scale: hov ? 1.15 : 1 }}>
        {icon}
      </motion.div>

      <span style={{
        color: '#fff',
        fontSize: '0.9rem',
        fontWeight: 600,
      }}>
        {title}
      </span>
    </motion.button>
  )
}