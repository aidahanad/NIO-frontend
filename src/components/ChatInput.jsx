import React, { useRef, useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Send, Paperclip, X, FileText, Check } from 'lucide-react'
import { listDocuments } from '../utils/api.js'

export default function ChatInput({ onSend, disabled }) {
  const [val, setVal]           = useState('')
  const [docsOpen, setDocsOpen] = useState(false)
  const [docs, setDocs]         = useState([])
  const [selectedIds, setSelectedIds] = useState([])
  const [loadingDocs, setLoadingDocs] = useState(false)
  const ref = useRef(null)
  const panelRef = useRef(null)

  // Auto-grow textarea
  useEffect(() => {
    if (ref.current) {
      ref.current.style.height = 'auto'
      ref.current.style.height = Math.min(ref.current.scrollHeight, 150) + 'px'
    }
  }, [val])

  // Close panel on outside click
  useEffect(() => {
    if (!docsOpen) return
    function handle(e) {
      if (panelRef.current && !panelRef.current.contains(e.target)) {
        setDocsOpen(false)
      }
    }
    document.addEventListener('mousedown', handle)
    return () => document.removeEventListener('mousedown', handle)
  }, [docsOpen])

  function toggleDocs() {
    if (!docsOpen) {
      setLoadingDocs(true)
      listDocuments()
        .then(data => setDocs(Array.isArray(data) ? data : []))
        .catch(() => setDocs([]))
        .finally(() => setLoadingDocs(false))
    }
    setDocsOpen(o => !o)
  }

  function toggleSelect(doc_id) {
    setSelectedIds(ids =>
      ids.includes(doc_id) ? ids.filter(i => i !== doc_id) : [...ids, doc_id]
    )
  }

  function shortName(filename) {
    // strip the uuid prefix if present
    const parts = filename.split('_')
    if (parts.length > 1) return parts.slice(1).join('_')
    return filename
  }

  const send = () => {
    const t = val.trim()
    if (!t || disabled) return
    onSend(t, selectedIds)
    setVal('')
    if (ref.current) ref.current.style.height = 'auto'
  }

  return (
    <div style={{ padding: '12px 0 0', position: 'relative' }} ref={panelRef}>

      {/* ── Document picker panel ── */}
      <AnimatePresence>
        {docsOpen && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 8 }}
            transition={{ duration: 0.18 }}
            style={{
              position: 'absolute', bottom: '100%', left: 0,
              marginBottom: 8, zIndex: 100,
              backgroundColor: '#FFFFFF',
              border: '1.5px solid #E8E2DE',
              borderRadius: 14,
              boxShadow: '0 8px 24px rgba(0,0,0,0.1)',
              minWidth: 320, maxWidth: 420,
              overflow: 'hidden',
            }}
          >
            {/* Header */}
            <div style={{
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              padding: '12px 16px',
              borderBottom: '1px solid #F0EDE9',
            }}>
              <span style={{ fontSize: '0.82rem', fontWeight: 600, color: '#1A1614' }}>
                Documents disponibles
              </span>
              <button
                onClick={() => setDocsOpen(false)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', display: 'flex' }}
              >
                <X size={14} color="#8A7D78" />
              </button>
            </div>

            {/* Doc list */}
            <div style={{ maxHeight: 220, overflowY: 'auto', padding: '8px 0' }}>
              {loadingDocs ? (
                <div style={{ padding: '16px', textAlign: 'center', color: '#8A7D78', fontSize: '0.82rem' }}>
                  Chargement…
                </div>
              ) : docs.length === 0 ? (
                <div style={{ padding: '16px', textAlign: 'center', color: '#8A7D78', fontSize: '0.82rem' }}>
                  Aucun document disponible
                </div>
              ) : (
                docs.map(doc => {
                  const selected = selectedIds.includes(doc.doc_id)
                  return (
                    <button
                      key={doc.doc_id}
                      onClick={() => toggleSelect(doc.doc_id)}
                      style={{
                        display: 'flex', alignItems: 'center', gap: 10,
                        width: '100%', padding: '10px 16px',
                        background: selected ? '#FFF3EE' : 'transparent',
                        border: 'none', cursor: 'pointer',
                        textAlign: 'left',
                        transition: 'background 0.15s',
                      }}
                    >
                      <FileText size={14} color="#E88B66" style={{ flexShrink: 0 }} />
                      <span style={{
                        flex: 1, fontSize: '0.8rem',
                        color: selected ? '#E88B66' : '#1A1614',
                        fontWeight: selected ? 600 : 400,
                        overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                      }}>
                        {shortName(doc.filename)}
                      </span>
                      {selected && <Check size={13} color="#E88B66" style={{ flexShrink: 0 }} />}
                    </button>
                  )
                })
              )}
            </div>

            {/* Footer — selected count */}
            {selectedIds.length > 0 && (
              <div style={{
                padding: '8px 16px',
                borderTop: '1px solid #F0EDE9',
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              }}>
                <span style={{ fontSize: '0.75rem', color: '#E88B66', fontWeight: 600 }}>
                  {selectedIds.length} document{selectedIds.length > 1 ? 's' : ''} sélectionné{selectedIds.length > 1 ? 's' : ''}
                </span>
                <button
                  onClick={() => setSelectedIds([])}
                  style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '0.72rem', color: '#8A7D78' }}
                >
                  Tout désélectionner
                </button>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Input bar ── */}
      <div style={{
        display: 'flex', alignItems: 'flex-end', gap: 10,
        backgroundColor: '#FFFFFF',
        borderRadius: 16, padding: '10px 12px',
        boxShadow: '0 2px 12px rgba(0,0,0,0.07)',
        border: `1.5px solid ${selectedIds.length > 0 ? '#E88B66' : '#E8E2DE'}`,
        transition: 'border-color 0.2s',
      }}>

        {/* Paperclip — opens doc picker */}
        <motion.button
          onClick={toggleDocs}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          style={{
            background: selectedIds.length > 0 ? '#FFF3EE' : 'none',
            border: 'none', cursor: 'pointer', padding: '4px', display: 'flex',
            flexShrink: 0, borderRadius: 6,
            transition: 'background 0.15s',
          }}
        >
          <Paperclip size={16} color={selectedIds.length > 0 ? '#E88B66' : '#8A7D78'} />
        </motion.button>

        {/* Selected doc badges */}
        {selectedIds.length > 0 && (
          <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap', flex: '0 0 auto', maxWidth: 200 }}>
            {selectedIds.map(id => {
              const doc = docs.find(d => d.doc_id === id)
              const name = doc ? shortName(doc.filename) : id
              return (
                <span key={id} style={{
                  display: 'flex', alignItems: 'center', gap: 4,
                  backgroundColor: '#FFF3EE', border: '1px solid #E88B66',
                  borderRadius: 99, padding: '2px 8px',
                  fontSize: '0.7rem', color: '#E88B66', fontWeight: 600,
                  maxWidth: 120, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                }}>
                  {name.length > 14 ? name.slice(0, 14) + '…' : name}
                  <button
                    onClick={(e) => { e.stopPropagation(); toggleSelect(id) }}
                    style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0, display: 'flex' }}
                  >
                    <X size={10} color="#E88B66" />
                  </button>
                </span>
              )
            })}
          </div>
        )}

        <textarea
          ref={ref} rows={1} value={val}
          onChange={e => setVal(e.target.value)}
          onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send() } }}
          placeholder={selectedIds.length > 0 ? 'Posez une question sur ce document…' : 'Posez votre question...'}
          disabled={disabled}
          style={{
            flex: 1, background: 'transparent', border: 'none', outline: 'none',
            color: '#1A1614', fontSize: '0.875rem', lineHeight: 1.55,
            resize: 'none', maxHeight: 150, overflowY: 'auto',
            fontFamily: 'Inter, sans-serif',
          }}
        />

        <motion.button
          onClick={send}
          disabled={!val.trim() || disabled}
          whileHover={val.trim() && !disabled ? { y: -1, boxShadow: '0 4px 14px rgba(232,139,102,0.4)' } : {}}
          whileTap={val.trim() && !disabled ? { scale: 0.96 } : {}}
          style={{
            width: 36, height: 36, borderRadius: 10, border: 'none',
            backgroundColor: val.trim() && !disabled ? '#E88B66' : '#E8E2DE',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            cursor: val.trim() && !disabled ? 'pointer' : 'not-allowed',
            flexShrink: 0, transition: 'background-color 0.2s',
          }}
        >
          <Send size={14} color={val.trim() && !disabled ? '#fff' : '#8A7D78'} />
        </motion.button>
      </div>
    </div>
  )
}
