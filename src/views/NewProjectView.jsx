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
  const [uploadStep, setUploadStep] = useState(null)
  const [error, setError]         = useState(null)

  const canCreate = name.trim() && !creating

  async function handleCreate() {
    if (!canCreate) return
    setCreating(true)
    setError(null)

    let lawDocId = null
    let sitDocId = null

    try {
      if (lawFile) {
        setUploadStep('law')
        const res = await uploadDocument(lawFile)
        lawDocId = res.doc_id ?? res.id ?? null
      }
      if (sitFile) {
        setUploadStep('sit')
        const res = await uploadDocument(sitFile)
        sitDocId = res.doc_id ?? res.id ?? null
      }
      setUploadStep('done')
      store.dispatch({
        type: 'CREATE_PROJECT',
        payload: { name: name.trim(), model, mode, lawFile, sitFile, lawDocId, sitDocId, includeNio: !!includeNio },
      })
    } catch (err) {
      setError(err.message || 'Erreur lors du téléchargement.')
      setCreating(false)
      setUploadStep(null)
    }
  }

  function buttonLabel() {
    if (!creating) return 'Créer le projet'
    if (uploadStep === 'law')  return 'Téléchargement loi…'
    if (uploadStep === 'sit')  return 'Téléchargement situation…'
    if (uploadStep === 'done') return 'Création…'
    return 'Téléchargement…'
  }

  return (
    <div style={{ display: 'flex', height: '100vh', backgroundColor: '#F5F2F0', overflow: 'hidden' }}>
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
          <h1 style={{ color: '#1A1614', fontSize: '1.5rem', fontWeight: 800, margin: 0 }}>
            Nouveau projet
          </h1>
          <p style={{ color: '#8A7D78', fontSize: '0.85rem', marginTop: 6, margin: '6px 0 0' }}>
            Configurez votre espace de travail NIO
          </p>
        </motion.div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 24, maxWidth: 640 }}>

          {/* Project name */}
          <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
            <label style={{
              color: '#8A7D78', fontSize: '0.78rem', fontWeight: 600,
              display: 'block', marginBottom: 8, letterSpacing: '0.05em',
            }}>
              NOM DU PROJET *
            </label>
            <input
              value={name}
              onChange={e => setName(e.target.value)}
              onFocus={() => setNameFocused(true)}
              onBlur={() => setNameFocused(false)}
              placeholder="Ex : Analyse contrat GNL 2025"
              disabled={creating}
              style={{
                width: '100%',
                backgroundColor: '#FFFFFF',
                border: `1.5px solid ${nameFocused ? '#E88B66' : '#E8E2DE'}`,
                borderRadius: 12,
                padding: '12px 16px',
                color: '#1A1614',
                fontSize: '0.9rem',
                outline: 'none',
                transition: 'border-color 0.2s',
                boxSizing: 'border-box',
                opacity: creating ? 0.6 : 1,
                pointerEvents: creating ? 'none' : 'auto',
                fontFamily: 'Inter, sans-serif',
              }}
            />
          </motion.div>

          {/* File uploads */}
          <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}>
            <label style={{
              color: '#8A7D78', fontSize: '0.78rem', fontWeight: 600,
              display: 'block', marginBottom: 8, letterSpacing: '0.05em',
            }}>
              DOCUMENTS
            </label>
            <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
              <div style={{ flex: 1, minWidth: 220, opacity: creating ? 0.6 : 1, pointerEvents: creating ? 'none' : 'auto' }}>
                <FileUploadZone
                  label="Loi / Texte réglementaire"
                  file={lawFile}
                  onFile={setLawFile}
                  uploading={uploadStep === 'law'}
                  done={!!lawFile && uploadStep !== 'law' && uploadStep !== 'sit'}
                />
              </div>
              <div style={{ flex: 1, minWidth: 220, opacity: creating ? 0.6 : 1, pointerEvents: creating ? 'none' : 'auto' }}>
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

          {/* Include NIO */}
          <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
            <button
              onClick={() => !creating && setIncludeNio(n => !n)}
              style={{
                display: 'flex', alignItems: 'center', gap: 12,
                backgroundColor: 'transparent', border: 'none',
                cursor: creating ? 'not-allowed' : 'pointer',
                padding: 0, opacity: creating ? 0.6 : 1,
              }}
            >
              <div style={{
                width: 20, height: 20, borderRadius: 6,
                backgroundColor: includeNio ? '#E88B66' : '#E8E2DE',
                border: includeNio ? 'none' : '1.5px solid #C8C0BC',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                transition: 'background-color 0.2s',
              }}>
                {includeNio && (
                  <span style={{ color: '#fff', fontSize: '0.7rem', fontWeight: 700 }}>✓</span>
                )}
              </div>
              <span style={{ color: '#1A1614', fontSize: '0.85rem' }}>
                Inclure la base de connaissances NIO
              </span>
            </button>
          </motion.div>

          {/* Model */}
          <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }}>
            <label style={{
              color: '#8A7D78', fontSize: '0.78rem', fontWeight: 600,
              display: 'block', marginBottom: 8, letterSpacing: '0.05em',
            }}>
              MODÈLE IA
            </label>
            <SegmentedControl
              options={['01', '02', '03']}
              value={model}
              onChange={m => !creating && setModel(m)}
            />
          </motion.div>

          {/* Mode */}
          <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
            <label style={{
              color: '#8A7D78', fontSize: '0.78rem', fontWeight: 600,
              display: 'block', marginBottom: 8, letterSpacing: '0.05em',
            }}>
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
                subtitle="Génération de rapport + étude des documents"
                active={mode === 'analyse'}
                onClick={() => !creating && setMode('analyse')}
              />
            </div>
          </motion.div>

          {/* Error */}
          {error && (
            <div style={{
              backgroundColor: 'rgba(220,38,38,0.08)',
              border: '1px solid rgba(220,38,38,0.2)',
              borderRadius: 10, padding: '10px 16px',
              color: '#dc2626', fontSize: '0.82rem',
            }}>
              ⚠️ {error}
            </div>
          )}

          {/* Create button */}
          <motion.button
            onClick={handleCreate}
            disabled={!canCreate}
            whileHover={canCreate ? { scale: 1.02, boxShadow: '0 6px 20px rgba(232,139,102,0.35)' } : {}}
            whileTap={canCreate ? { scale: 0.97 } : {}}
            style={{
              width: '100%', padding: '14px', borderRadius: 14, border: 'none',
              backgroundColor: canCreate ? '#E88B66' : '#E8E2DE',
              cursor: canCreate ? 'pointer' : 'not-allowed',
              color: canCreate ? '#fff' : '#8A7D78',
              fontSize: '0.9rem', fontWeight: 700,
              transition: 'background-color 0.2s',
            }}
          >
            {buttonLabel()}
          </motion.button>

        </div>
      </motion.div>
    </div>
  )
}

function ModeCard({ icon, title, subtitle, active, onClick }) {
  const [hov, setHov] = React.useState(false)
  return (
    <motion.button
      onClick={onClick}
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.97 }}
      style={{
        flex: 1, padding: '16px', borderRadius: 14, textAlign: 'left',
        backgroundColor: active ? '#FFF3EE' : hov ? '#FAFAFA' : '#FFFFFF',
        border: `2px solid ${active ? '#E88B66' : '#E8E2DE'}`,
        cursor: 'pointer',
        boxShadow: active ? '0 2px 12px rgba(232,139,102,0.15)' : '0 1px 4px rgba(0,0,0,0.05)',
        transition: 'background-color 0.2s, border-color 0.2s',
      }}
    >
      <div style={{ marginBottom: 8 }}>{icon}</div>
      <p style={{ color: '#1A1614', fontSize: '0.85rem', fontWeight: 600, margin: 0 }}>{title}</p>
      <p style={{ color: '#8A7D78', fontSize: '0.75rem', margin: '4px 0 0' }}>{subtitle}</p>
    </motion.button>
  )
}
