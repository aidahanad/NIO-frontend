// src/views/NewProjectView.jsx
import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { store } from '../store/store.js'
import { uploadDocument, fetchModels } from '../utils/api.js'
import Sidebar from '../components/Sidebar.jsx'
import FileUploadZone from '../components/FileUploadZone.jsx'

export default function NewProjectView() {
  const [name, setName]             = useState('')
  const [docFile, setDocFile]       = useState(null)
  const [includeNio, setIncludeNio] = useState(true)
  const [model, setModel]           = useState(null)
  const [models, setModels]         = useState([])
  const [nameFocused, setNameFocused] = useState(false)
  const [creating, setCreating]     = useState(false)
  const [uploadStep, setUploadStep] = useState(null)
  const [error, setError]           = useState(null)

  // Load models from backend
  useEffect(() => {
    fetchModels()
      .then(data => {
        const list = Array.isArray(data) ? data : data.models || []
        setModels(list)
        if (list.length > 0) setModel(list[0])
      })
      .catch(() => {
        const fallback = ['Qwen3-30B-A3B-Thinking']
        setModels(fallback)
        setModel(fallback[0])
      })
  }, [])

  const canCreate = name.trim() && !creating

  async function handleCreate() {
    if (!canCreate) return
    setCreating(true)
    setError(null)

    let docId = null

    try {
      if (docFile) {
        setUploadStep('doc')
        const res = await uploadDocument(docFile)
        docId = res.doc_id ?? res.id ?? null
      }

      setUploadStep('done')

      store.dispatch({
        type: 'CREATE_PROJECT',
        payload: {
          name: name.trim(),
          model,
          mode: 'analyse',
          lawFile: docFile,
          sitFile: null,
          lawDocId: docId,
          sitDocId: null,
          includeNio: !!includeNio,
        },
      })
    } catch (err) {
      setError(err.message || 'Erreur lors du téléchargement.')
      setCreating(false)
      setUploadStep(null)
    }
  }

  function buttonLabel() {
    if (!creating) return 'Lancer l\'analyse'
    if (uploadStep === 'doc')  return 'Téléchargement du document…'
    if (uploadStep === 'done') return 'Création du projet…'
    return 'Chargement…'
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
          <p style={{ color: '#8A7D78', fontSize: '0.85rem', margin: '6px 0 0' }}>
            Configurez votre espace de travail NIO
          </p>
        </motion.div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 24, maxWidth: 640 }}>

          {/* Project name */}
          <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
            <label style={labelStyle}>NOM DU PROJET *</label>
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

          {/* Document upload */}
          <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}>
            <label style={labelStyle}>DOCUMENT</label>
            <div style={{ opacity: creating ? 0.6 : 1, pointerEvents: creating ? 'none' : 'auto' }}>
              <FileUploadZone
                label="Document à analyser"
                file={docFile}
                onFile={setDocFile}
                onRemove={() => setDocFile(null)}
                uploading={uploadStep === 'doc'}
                done={!!docFile && uploadStep === 'done'}
              />
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
                flexShrink: 0,
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

          {/* Model selector */}
          <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }}>
            <label style={labelStyle}>MODÈLE IA</label>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {models.length === 0 ? (
                <div style={{ color: '#8A7D78', fontSize: '0.82rem' }}>Chargement des modèles…</div>
              ) : (
                models.map(m => (
                  <ModelOption
                    key={m}
                    label={m}
                    active={model === m}
                    disabled={creating}
                    onClick={() => !creating && setModel(m)}
                  />
                ))
              )}
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

          {/* Launch button */}
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
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
            }}
          >
            {creating && (
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"
                style={{ animation: 'spin 0.8s linear infinite' }}>
                <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83" />
              </svg>
            )}
            {buttonLabel()}
          </motion.button>

        </div>
      </motion.div>

      <style>{`
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
      `}</style>
    </div>
  )
}

/* ─── Label style ─── */
const labelStyle = {
  color: '#8A7D78', fontSize: '0.78rem', fontWeight: 600,
  display: 'block', marginBottom: 8, letterSpacing: '0.05em',
}

/* ─── Model option row ─── */
function ModelOption({ label, active, disabled, onClick }) {
  const [hov, setHov] = useState(false)
  return (
    <button
      onClick={onClick}
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      disabled={disabled}
      style={{
        display: 'flex', alignItems: 'center', gap: 12,
        padding: '11px 16px', borderRadius: 10, border: 'none',
        backgroundColor: active ? '#FFF3EE' : hov ? '#FAFAFA' : '#FFFFFF',
        outline: `1.5px solid ${active ? '#E88B66' : '#E8E2DE'}`,
        cursor: disabled ? 'not-allowed' : 'pointer',
        opacity: disabled ? 0.6 : 1,
        textAlign: 'left', width: '100%',
        transition: 'background-color 0.15s, outline-color 0.15s',
      }}
    >
      {/* Radio dot */}
      <div style={{
        width: 16, height: 16, borderRadius: '50%', flexShrink: 0,
        border: `2px solid ${active ? '#E88B66' : '#C8C0BC'}`,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        backgroundColor: active ? '#E88B66' : 'transparent',
        transition: 'all 0.15s',
      }}>
        {active && <div style={{ width: 6, height: 6, borderRadius: '50%', backgroundColor: '#fff' }} />}
      </div>
      <span style={{ fontSize: '0.85rem', fontWeight: active ? 600 : 400, color: active ? '#E88B66' : '#1A1614' }}>
        {label}
      </span>
    </button>
  )
}
