import React, { useSyncExternalStore, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { MessageSquare, Search, Trash2 } from 'lucide-react'
import { store } from '../store/store.js'

export default function Sidebar() {
  const { projects, activeProjectId, activeView } = useSyncExternalStore(
    store.subscribe, store.getSnapshot
  )
  const [hoveredId, setHoveredId] = useState(null)

  function goWelcome() {
    store.dispatch({ type: 'SET_VIEW', payload: 'welcome' })
  }
  function startChat() {
    store.dispatch({ type: 'START_NEW_CHAT' })
  }
  function startNewProject() {
    store.dispatch({ type: 'SET_VIEW', payload: 'new-project' })
  }
  function openProject(id) {
    store.dispatch({ type: 'SET_ACTIVE_PROJECT', payload: id })
  }
  function deleteProject(e, id) {
    e.stopPropagation()
    store.dispatch({ type: 'DELETE_PROJECT', payload: id })
  }

  function formatTime(iso) {
    const d = new Date(iso)
    return d.toLocaleDateString('fr-FR', { day: '2-digit', month: 'short' })
  }

  return (
    <div style={{
      width: 260,
      minWidth: 260,
      height: '100vh',
      backgroundColor: '#362e2b',
      display: 'flex',
      flexDirection: 'column',
      padding: '8px 16px',
      boxShadow: '4px 0 20px rgba(0,0,0,0.25)',
      overflow: 'hidden',
    }}>

      <button
        onClick={goWelcome}
        style={{ background: 'none', border: 'none', cursor: 'pointer', marginBottom: 18, padding: 0 }}
      >
        <div style={{ letterSpacing: '0em', fontSize: '2.3rem', fontWeight: 700, color: '#fff', textAlign: 'left' }}>NIO</div>
        <div style={{ width: 62, height: 2, backgroundColor: '#E88B66', borderRadius: 2, marginTop: 5 }} />
      </button>

      <p style={{ fontSize: 10, fontWeight: 600, color: '#A89E9A', letterSpacing: '0.12em', marginBottom: 10, textTransform: 'uppercase' }}>
        Discussions
      </p>

      <SidebarOutlineBtn label="+ Nouvelle" onClick={startChat} />

      <div style={{ height: 1, backgroundColor: 'rgba(168,158,154,0.12)', margin: '20px 0' }} />

      <p style={{ fontSize: 10, fontWeight: 600, color: '#A89E9A', letterSpacing: '0.12em', marginBottom: 10, textTransform: 'uppercase' }}>
        Projets
      </p>

      <SidebarFilledBtn label="+ Nouveau projet" onClick={startNewProject} />

      <div style={{
        marginTop: 16,
        overflowY: 'auto',
        flex: 1,
        maxHeight: '55vh',
        display: 'flex',
        flexDirection: 'column',
        gap: 4,
      }}>
        {projects.map(p => {
          const isActive = p.id === activeProjectId && activeView === 'project'
          const isHovered = hoveredId === p.id
          const Icon = p.mode === 'analyse' ? Search : MessageSquare

          return (
            <motion.div
              key={p.id}
              onClick={() => openProject(p.id)}
              onMouseEnter={() => setHoveredId(p.id)}
              onMouseLeave={() => setHoveredId(null)}
              style={{
                position: 'relative',
                display: 'flex',
                alignItems: 'center',
                gap: 10,
                padding: '9px 10px',
                borderRadius: 10,
                cursor: 'pointer',
                backgroundColor: isActive ? '#443A36' : isHovered ? '#443A36' : 'transparent',
                borderLeft: isActive ? '3px solid #E88B66' : '3px solid transparent',
                transition: 'background-color 0.18s, border-color 0.18s',
                paddingLeft: isActive ? 10 : 10,
              }}
            >
              <Icon size={14} color={isActive ? '#E88B66' : '#A89E9A'} style={{ flexShrink: 0 }} />
              <div style={{ flex: 1, overflow: 'hidden' }}>
                <p style={{
                  fontSize: '0.8rem', fontWeight: 500, color: isActive ? '#fff' : '#d4ceca',
                  overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                }}>{p.name}</p>
                <p style={{ fontSize: '0.7rem', color: '#A89E9A', marginTop: 1 }}>{formatTime(p.createdAt)}</p>
              </div>
              <AnimatePresence>
                {isHovered && (
                  <motion.button
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.15 }}
                    onClick={e => deleteProject(e, p.id)}
                    style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 2, display: 'flex', flexShrink: 0 }}
                  >
                    <Trash2 size={13} color="#A89E9A" />
                  </motion.button>
                )}
              </AnimatePresence>
            </motion.div>
          )
        })}
        {projects.length === 0 && (
          <p style={{ fontSize: '0.75rem', color: '#A89E9A', textAlign: 'center', marginTop: 12, opacity: 0.6 }}>
            Aucun projet
          </p>
        )}
      </div>
    </div>
  )
}

function SidebarOutlineBtn({ label, onClick }) {
  const [hov, setHov] = useState(false)
  return (
    <button
      onClick={onClick}
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      style={{
        width: '100%', padding: '8px 14px', borderRadius: 10,
        border: '1.5px solid #E88B66',
        backgroundColor: hov ? '#E88B66' : 'transparent',
        color: hov ? '#fff' : '#E88B66',
        fontSize: '0.82rem', fontWeight: 500, cursor: 'pointer',
        transition: 'background-color 0.18s, color 0.18s',
        textAlign: 'left',
      }}
    >{label}</button>
  )
}

function SidebarFilledBtn({ label, onClick }) {
  const [hov, setHov] = useState(false)
  return (
    <button
      onClick={onClick}
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      style={{
        width: '100%', padding: '8px 14px', borderRadius: 10,
        border: 'none',
        backgroundColor: hov ? '#F09A78' : '#E88B66',
        color: '#fff',
        fontSize: '0.82rem', fontWeight: 500, cursor: 'pointer',
        transition: 'background-color 0.18s',
        textAlign: 'left',
        boxShadow: '0 2px 8px rgba(232,139,102,0.3)',
      }}
    >{label}</button>
  )
}
