import React, { useRef, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Upload, FileText, X } from 'lucide-react'

export default function FileUploadZone({ label, file, onFile, onRemove }) {
  const inputRef = useRef(null)
  const [drag, setDrag] = useState(false)

  const handleDrop = (e) => {
    e.preventDefault()
    setDrag(false)
    const f = e.dataTransfer.files[0]
    if (!f) return
    const allowedTypes = [
      'application/pdf',
      'text/plain',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/json',
    ]
    const allowedExtensions = ['.pdf', '.txt', '.docx', '.json']
    const isValid = allowedTypes.includes(f.type) || allowedExtensions.some(ext => f.name.toLowerCase().endsWith(ext))
    if (isValid) onFile(f)
  }

  const handleRemove = () => {
    if (inputRef.current) inputRef.current.value = ''
    onRemove?.()
  }

  return (
    <div>
      {/* Label row */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
        <span style={{ fontSize: '0.85rem', fontWeight: 500, color: '#1A1614' }}>
          {label}
        </span>
        <span style={{
          fontSize: '0.72rem', color: '#8A7D78',
          backgroundColor: '#F0EDE9',
          padding: '1px 8px', borderRadius: 99,
        }}>
          Facultatif
        </span>
      </div>

      <AnimatePresence mode="wait">
        {file ? (
          /* ── File chip ── */
          <motion.div
            key="chip"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.22 }}
            style={{
              display: 'flex', alignItems: 'center', gap: 10,
              backgroundColor: '#FFF3EE',
              border: '1.5px solid #E88B66',
              borderRadius: 10, padding: '12px 14px',
            }}
          >
            <FileText size={16} color="#E88B66" />
            <span style={{
              flex: 1, fontSize: '0.82rem', color: '#1A1614',
              overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
            }}>
              {file.name}
            </span>
            <button
              onClick={handleRemove}
              style={{ background: 'none', border: 'none', cursor: 'pointer', display: 'flex', padding: 2 }}
            >
              <X size={14} color="#8A7D78" />
            </button>
          </motion.div>
        ) : (
          /* ── Drop zone ── */
          <motion.div
            key="zone"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.22 }}
            onDragOver={e => { e.preventDefault(); setDrag(true) }}
            onDragLeave={() => setDrag(false)}
            onDrop={handleDrop}
            onClick={() => inputRef.current?.click()}
            style={{
              border: `2px dashed ${drag ? '#E88B66' : '#D8D0CC'}`,
              borderRadius: 12, padding: '22px 16px',
              backgroundColor: drag ? 'rgba(232,139,102,0.05)' : '#FAFAF9',
              display: 'flex', flexDirection: 'column',
              alignItems: 'center', gap: 8,
              cursor: 'pointer',
              transition: 'border-color 0.2s, background-color 0.2s',
            }}
          >
            <Upload size={20} color={drag ? '#E88B66' : '#8A7D78'} />
            <span style={{ fontSize: '0.8rem', color: '#8A7D78', textAlign: 'center' }}>
              Glissez votre PDF ici{' '}
              <span style={{ color: '#E88B66' }}>ou parcourir</span>
            </span>
            <input
              ref={inputRef}
              type="file"
              accept=".pdf,.txt,.docx,.json,application/pdf,text/plain,application/json,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
              style={{ display: 'none' }}
              onChange={e => { if (e.target.files[0]) onFile(e.target.files[0]); e.target.value = '' }}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
