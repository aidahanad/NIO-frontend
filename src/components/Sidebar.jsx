import React, { useSyncExternalStore, useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { MessageSquare, Search, Trash2 } from 'lucide-react'
import { store } from '../store/store.js'

export default function Sidebar() {
  const { projects, activeProjectId, activeView, activeChatSession } = useSyncExternalStore(
    store.subscribe, store.getSnapshot
  )
  const [hoveredId, setHoveredId] = useState(null)

  function goWelcome()    { store.dispatch({ type: 'SET_VIEW', payload: 'welcome' }) }
  function startChat()    { store.dispatch({ type: 'START_NEW_CHAT' }) }
  function startNewProject() { store.dispatch({ type: 'SET_VIEW', payload: 'new-project' }) }
  function openProject(id)   { store.dispatch({ type: 'SET_ACTIVE_PROJECT', payload: id }) }
  function deleteProject(e, id) {
    e.stopPropagation()
    store.dispatch({ type: 'DELETE_PROJECT', payload: id })
  }
  function renameProject(id, name) { store.dispatch({ type: 'RENAME_PROJECT', payload: { id, name } }) }
  function renameChat(title)       { store.dispatch({ type: 'RENAME_CHAT', payload: title }) }

  function formatTime(iso) {
    return new Date(iso).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short' })
  }

  const isChatActive = activeView === 'chat' && activeChatSession

  return (
    <div style={{
      width: 260, minWidth: 260, height: '100vh',
      backgroundColor: '#FFFFFF',
      display: 'flex', flexDirection: 'column',
      padding: '8px 16px',
      boxShadow: '1px 0 0 #E8E2DE',
      overflow: 'hidden',
    }}>

      {/* Logo */}
      <button
        onClick={goWelcome}
        style={{ background: 'none', border: 'none', cursor: 'pointer', marginBottom: 18, padding: 0 }}
      >
        <div style={{ fontSize: '2.3rem', fontWeight: 700, color: '#1A1614', textAlign: 'left' }}>NIO</div>
        <div style={{ width: 62, height: 2, backgroundColor: '#E88B66', borderRadius: 2, marginTop: 5 }} />
      </button>

      {/* Discussions */}
      <p style={{ fontSize: 10, fontWeight: 600, color: '#8A7D78', letterSpacing: '0.12em', marginBottom: 10, textTransform: 'uppercase' }}>
        Discussions
      </p>

      <SidebarOutlineBtn label="+ Nouvelle" onClick={startChat} />

      <AnimatePresence>
        {isChatActive && (
          <motion.div
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            style={{ marginTop: 6 }}
          >
            <RenameableItem
              label={activeChatSession.title || 'Nouvelle discussion'}
              isActive={true}
              isHovered={hoveredId === activeChatSession.id}
              icon={<MessageSquare size={14} color="#E88B66" style={{ flexShrink: 0 }} />}
              onMouseEnter={() => setHoveredId(activeChatSession.id)}
              onMouseLeave={() => setHoveredId(null)}
              onClick={() => {}}
              onDelete={null}
              onRename={renameChat}
            />
          </motion.div>
        )}
      </AnimatePresence>

      <div style={{ height: 1, backgroundColor: '#E8E2DE', margin: '20px 0' }} />

      {/* Projets */}
      <p style={{ fontSize: 10, fontWeight: 600, color: '#8A7D78', letterSpacing: '0.12em', marginBottom: 10, textTransform: 'uppercase' }}>
        Projets
      </p>

      <SidebarFilledBtn label="+ Nouveau projet" onClick={startNewProject} />

      <div style={{
        marginTop: 16, overflowY: 'auto', flex: 1,
        maxHeight: '55vh', display: 'flex', flexDirection: 'column', gap: 4,
      }}>
        {projects.map(p => {
          const isActive = p.id === activeProjectId && activeView === 'project'
          const Icon = p.mode === 'analyse' ? Search : MessageSquare
          return (
            <RenameableItem
              key={p.id}
              label={p.name}
              isActive={isActive}
              isHovered={hoveredId === p.id}
              icon={<Icon size={14} color={isActive ? '#E88B66' : '#8A7D78'} style={{ flexShrink: 0 }} />}
              subLabel={formatTime(p.createdAt)}
              onMouseEnter={() => setHoveredId(p.id)}
              onMouseLeave={() => setHoveredId(null)}
              onClick={() => openProject(p.id)}
              onDelete={(e) => deleteProject(e, p.id)}
              onRename={(name) => renameProject(p.id, name)}
            />
          )
        })}
        {projects.length === 0 && (
          <p style={{ fontSize: '0.75rem', color: '#8A7D78', textAlign: 'center', marginTop: 12, opacity: 0.6 }}>
            Aucun projet
          </p>
        )}
      </div>
    </div>
  )
}

function RenameableItem({ label, isActive, isHovered, icon, subLabel, onMouseEnter, onMouseLeave, onClick, onDelete, onRename }) {
  const [editing, setEditing] = useState(false)
  const [draft, setDraft]     = useState(label)
  const inputRef = useRef(null)

  useEffect(() => {
    if (editing) {
      setDraft(label)
      setTimeout(() => { inputRef.current?.focus(); inputRef.current?.select() }, 0)
    }
  }, [editing])

  function commit() {
    const trimmed = draft.trim()
    if (trimmed && trimmed !== label) onRename(trimmed)
    setEditing(false)
  }

  function handleKey(e) {
    if (e.key === 'Enter')  { e.preventDefault(); commit() }
    if (e.key === 'Escape') { setEditing(false); setDraft(label) }
  }

  return (
    <div
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
      onDoubleClick={(e) => { e.stopPropagation(); setEditing(true) }}
      onClick={() => { if (!editing) onClick() }}
      style={{
        display: 'flex', alignItems: 'center', gap: 10,
        padding: '9px 10px', borderRadius: 10,
        cursor: editing ? 'text' : 'pointer',
        backgroundColor: isActive ? '#FFF3EE' : isHovered ? '#F5F2F0' : 'transparent',
        borderLeft: isActive ? '3px solid #E88B66' : '3px solid transparent',
        transition: 'background-color 0.15s',
      }}
    >
      {icon}
      <div style={{ flex: 1, overflow: 'hidden' }}>
        {editing ? (
          <input
            ref={inputRef}
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onKeyDown={handleKey}
            onBlur={commit}
            onClick={(e) => e.stopPropagation()}
            style={{
              width: '100%',
              background: '#F5F2F0',
              border: '1px solid #E88B66',
              borderRadius: 4,
              color: '#1A1614',
              fontSize: '0.8rem',
              padding: '2px 6px',
              outline: 'none',
              fontFamily: 'inherit',
            }}
          />
        ) : (
          <>
            <p style={{
              fontSize: '0.8rem', fontWeight: 500, margin: 0,
              color: isActive ? '#E88B66' : '#1A1614',
              overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
            }}>{label}</p>
            {subLabel && (
              <p style={{ fontSize: '0.7rem', color: '#8A7D78', margin: 0, marginTop: 1 }}>{subLabel}</p>
            )}
          </>
        )}
      </div>
      <AnimatePresence>
        {isHovered && !editing && onDelete && (
          <motion.button
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            onClick={onDelete}
            style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 2, display: 'flex', flexShrink: 0 }}
          >
            <Trash2 size={13} color="#8A7D78" />
          </motion.button>
        )}
      </AnimatePresence>
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
        transition: 'background-color 0.18s, color 0.18s', textAlign: 'left',
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
        transition: 'background-color 0.18s', textAlign: 'left',
        boxShadow: '0 2px 8px rgba(232,139,102,0.3)',
      }}
    >{label}</button>
  )
}
