// src/views/NewProjectView.jsx
import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { MessageSquare, Search } from 'lucide-react'
import { store } from '../store/store.js'
import { uploadDocument } from '../utils/api.js'
import Sidebar from '../components/Sidebar.jsx'
import FileUploadZone from '../components/FileUploadZone.jsx'
import SegmentedControl from '../components/SegmentedControl.jsx'

export default function NewProjectView() {
  const [name, setName]           = useState('')
  const [lawFile, setLawFile]     = useState(null)
  const [sitFile, setSitFile]     = useState(null)
  const [includeNio, setIncludeNio] = useState(true)
  const [model, setModel]         = useState('01')
  const [mode, setMode]           = useState('chat')
  const [nameFocused, setNameFocused] = useState(false)
  const [creating, setCreating]   = useState(false)
  const [uploadStep, setUploadStep] = useState(null) // 'law' | 'sit' | 'done' | null
  const [error, setError]         = useState(null)

  const canCreate = name.trim() && !creating

  async function handleCreate() {
    if (!canCreate) return
    setCreating(true)
    setError(null)

    let lawDocId = null
    let sitDocId = null

    try {
      // Upload law file if provided
      if (lawFile) {
        setUploadStep('law')
        const res = await uploadDocument(lawFile)
        lawDocId  = res.doc_id ?? res.id ?? null
      }

      // Upload situation file if provided
      if (sitFile) {
        setUploadStep('sit')
        const res = await uploadDocument(sitFile)
        sitDocId  = res.doc_id ?? res.id ?? null
      }

      setUploadStep('done')

      store.dispatch({
        type: 'CREATE_PROJECT',
        payload: {
          name: name.trim(),
          model,
          mode,
          lawFile,
          sitFile,
          lawDocId,
          sitDocId,
          includeNio,
        },
      })
    } catch (err) {
      setError(err.message || 'Erreur lors du téléchargement.')
      setCreating(false)
      setUploadStep(null)
    }
  }

  function buttonLabel() {
    if (!creating) return 'Créer le projet'
    if (uploadStep === 'law') return 'Téléchargement loi…'
    if (uploadStep === 'sit') return 'Téléchargement situation…'
    if (uploadStep === 'done') return 'Création…'
    return 'Téléchargement…'
  }

  const inputStyle = {
    width: '100%',
    backgroundColor: '#443A36',
    border: 'none',
    borderRadius: 12,
    padding: '12px 16px',
    color: '#fff',
    fontSize: '0.9rem',
    outline: nameFocused ? '2px solid #E88B66' : '2px solid transparent',
    transition: 'outline 0.2s',
    boxSizing: 'border-box',
    opacity: creating ? 0.6 : 1,
    pointerEvents: creating ? 'none' : 'auto',
  }

  return (
    <div style={{ display: 'flex', height: '100vh', backgroundColor: '#2C2522', overflow: 'hidden' }}>
      <Sidebar />

      <motion.div
        key="new-project"
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.25, ease: 'easeOut' }}
        style={{ flex: 1, overflowY: 'auto', padding: '36px 32px' }}
      >
        {/* Title */}
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05 }}
          style={{ marginBottom: 32 }}
        >
          <h1 style={{ color: '#fff', fontSize: '1.5rem', fontWeight: 800, margin: 0 }}>
            Nouveau projet
          </h1>
          <p style={{ color: '#A89E9A', fontSize: '0.85rem', marginTop: 6 }}>
            Configurez votre espace de travail NIO
          </p>
        </motion.div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 24, maxWidth: 640 }}>

          {/* Project name */}
          <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
            <label style={{ color: '#A89E9A', fontSize: '0.8rem', fontWeight: 600,
                            display: 'block', marginBottom: 8, letterSpacing: '0.05em' }}>
              NOM DU PROJET *
            </label>
            <input
              value={name}
              onChange={e => setName(e.target.value)}
              onFocus={() => setNameFocused(true)}
              onBlur={() => setNameFocused(false)}
              placeholder="Ex : Analyse contrat GNL 2025"
              style={inputStyle}
              disabled={creating}
            />
          </motion.div>

          {/* PDF uploads */}
          <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}>
            <label style={{ color: '#A89E9A', fontSize: '0.8rem', fontWeight: 600,
                            display: 'block', marginBottom: 8, letterSpacing: '0.05em' }}>
              DOCUMENTS
            </label>
            <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
              <div style={{ flex: 1, minWidth: 220, opacity: creating ? 0.6 : 1,
                            pointerEvents: creating ? 'none' : 'auto' }}>
                <FileUploadZone
                  label="Loi / Texte réglementaire"
                  file={lawFile}
                  onFile={setLawFile}
                  uploading={uploadStep === 'law'}
                  done={!!lawFile && uploadStep === 'done'}
                />
              </div>
              <div style={{ flex: 1, minWidth: 220, opacity: creating ? 0.6 : 1,
                            pointerEvents: creating ? 'none' : 'auto' }}>
                <FileUploadZone
                  label="Situation / Cas concret"
                  file={sitFile}
                  onFile={setSitFile}
                  uploading={uploadStep === 'sit'}
                  done={!!sitFile && uploadStep === 'done'}
                />
              </div>
            </div>
          </motion.div>

          {/* Include NIO knowledge */}
          <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
            <button
              onClick={() => !creating && setIncludeNio(n => !n)}
              style={{
                display: 'flex', alignItems: 'center', gap: 12,
                backgroundColor: 'transparent', border: 'none', cursor: creating ? 'not-allowed' : 'pointer',
                padding: 0, opacity: creating ? 0.6 : 1,
              }}
            >
              <div style={{
                width: 20, height: 20, borderRadius: 6,
                backgroundColor: includeNio ? '#E88B66' : '#443A36',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                transition: 'background-color 0.2s',
              }}>
                {includeNio && <span style={{ color: '#fff', fontSize: '0.7rem', fontWeight: 700 }}>✓</span>}
              </div>
              <span style={{ color: '#fff', fontSize: '0.85rem' }}>
                Inclure la base de connaissances NIO
              </span>
            </button>
          </motion.div>

          {/* Model selector */}
          <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }}>
            <label style={{ color: '#A89E9A', fontSize: '0.8rem', fontWeight: 600,
                            display: 'block', marginBottom: 8, letterSpacing: '0.05em' }}>
              MODÈLE IA
            </label>
            <SegmentedControl
              options={['01', '02', '03']}
              value={model}
              onChange={m => !creating && setModel(m)}
            />
          </motion.div>

          {/* Mode cards */}
          <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
            <label style={{ color: '#A89E9A', fontSize: '0.8rem', fontWeight: 600,
                            display: 'block', marginBottom: 8, letterSpacing: '0.05em' }}>
              MODE
            </label>
            <div style={{ display: 'flex', gap: 12 }}>
              <ModeCard
                icon={<MessageSquare size={20} color="#E88B66" />}
                title="Chat"
                subtitle="Dialoguez avec vos documents"
                active={mode === 'chat'}
                onClick={() => !creating && setMode('chat')}
              />
              <ModeCard
                icon={<Search size={20} color="#E88B66" />}
                title="Analyse"
                subtitle="Analyse automatique approfondie"
                active={mode === 'analyse'}
                onClick={() => !creating && setMode('analyse')}
              />
            </div>
          </motion.div>

          {/* Error */}
          {error && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              style={{
                backgroundColor: 'rgba(220,38,38,0.12)',
                border: '1px solid rgba(220,38,38,0.25)',
                borderRadius: 10, padding: '10px 16px',
                color: '#fca5a5', fontSize: '0.82rem',
              }}
            >
              ⚠️ {error}
            </motion.div>
          )}

          {/* Create button */}
          <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35 }}>
            <motion.button
              onClick={handleCreate}
              disabled={!canCreate}
              whileHover={canCreate ? { scale: 1.02, backgroundColor: '#F09A78' } : {}}
              whileTap={canCreate ? { scale: 0.97 } : {}}
              style={{
                width: '100%', padding: '14px', borderRadius: 14,
                backgroundColor: canCreate ? '#E88B66' : '#443A36',
                border: 'none', cursor: canCreate ? 'pointer' : 'not-allowed',
                color: canCreate ? '#fff' : '#A89E9A',
                fontSize: '0.9rem', fontWeight: 700,
                boxShadow: canCreate ? '0 4px 16px rgba(232,139,102,0.3)' : 'none',
                transition: 'background-color 0.2s, box-shadow 0.2s',
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10,
              }}
            >
              {creating && <Spinner size={16} />}
              {buttonLabel()}
            </motion.button>
          </motion.div>

        </div>
      </motion.div>
    </div>
  )
}

function ModeCard({ icon, title, subtitle, active, onClick }) {
  return (
    <motion.button
      onClick={onClick}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.97 }}
      style={{
        flex: 1, padding: '16px', borderRadius: 14,
        backgroundColor: '#443A36',
        outline: active ? '2px solid #E88B66' : '2px solid transparent',
        boxShadow: active ? '0 0 16px rgba(232,139,102,0.18)' : '0 2px 8px rgba(0,0,0,0.12)',
        cursor: 'pointer', border: 'none', textAlign: 'left',
        transition: 'outline 0.2s, box-shadow 0.2s',
      }}
    >
      <div style={{ marginBottom: 8 }}>{icon}</div>
      <p style={{ color: '#fff', fontSize: '0.85rem', fontWeight: 600, margin: '0 0 4px' }}>{title}</p>
      <p style={{ color: '#A89E9A', fontSize: '0.75rem', margin: 0 }}>{subtitle}</p>
    </motion.button>
  )
}
