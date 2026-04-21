import React, { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronDown } from 'lucide-react'
import { fetchModels } from '../utils/api.js'

const FALLBACK_MODELS = ['Qwen3-30B-A3B-Thinking']

export default function ModelSelector({ value, onChange }) {
  const [open, setOpen]       = useState(false)
  const [models, setModels]   = useState(FALLBACK_MODELS)
  const [loading, setLoading] = useState(true)
  const containerRef = useRef(null)

  useEffect(() => {
    let mounted = true
    fetchModels()
      .then(data => {
        if (!mounted) return
        const m = data?.models
        if (Array.isArray(m) && m.length > 0) setModels(m)
      })
      .catch(() => {})
      .finally(() => { if (mounted) setLoading(false) })
    return () => { mounted = false }
  }, [])

  useEffect(() => {
    if (!models.length || !value) return
    const isValid = models.some(m => m.toLowerCase() === String(value).toLowerCase())
    if (!isValid) onChange(models[0])
  }, [models])

  useEffect(() => {
    if (!open) return
    function handleClick(e) {
      if (containerRef.current && !containerRef.current.contains(e.target)) setOpen(false)
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [open])

  return (
    <div ref={containerRef} style={{ position: 'relative' }}>
      <motion.button
        onClick={() => setOpen(o => !o)}
        whileHover={{ backgroundColor: '#FFF3EE' }}
        whileTap={{ scale: 0.97 }}
        style={{
          display: 'flex', alignItems: 'center', gap: 6,
          backgroundColor: '#F5F2F0',
          border: '1.5px solid #E8E2DE',
          borderRadius: 10, padding: '7px 12px',
          cursor: 'pointer', fontSize: '0.82rem', fontWeight: 500,
        }}
      >
        <span style={{ color: '#8A7D78', fontSize: '0.72rem' }}>Modèle</span>
        {loading ? (
          <span style={{ width: 80, height: 10, display: 'inline-block', backgroundColor: '#E8E2DE', borderRadius: 4 }} />
        ) : (
          <span style={{ color: '#E88B66', fontWeight: 700 }}>{value}</span>
        )}
        <motion.div animate={{ rotate: open ? 180 : 0 }} transition={{ duration: 0.2 }}>
          <ChevronDown size={13} color="#E88B66" />
        </motion.div>
      </motion.button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -6, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -6, scale: 0.97 }}
            transition={{ duration: 0.15 }}
            style={{
              position: 'absolute', top: 'calc(100% + 6px)', right: 0, zIndex: 200,
              backgroundColor: '#FFFFFF',
              borderRadius: 12, boxShadow: '0 8px 24px rgba(0,0,0,0.12)',
              minWidth: 220, overflow: 'hidden',
              border: '1px solid #E8E2DE',
            }}
          >
            {models.map(m => (
              <ModelOption
                key={m} label={m}
                active={m === value || m.toLowerCase() === String(value).toLowerCase()}
                onClick={() => { onChange(m); setOpen(false) }}
              />
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

function ModelOption({ label, active, onClick }) {
  const [hover, setHover] = useState(false)
  return (
    <button
      onClick={onClick}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={{
        width: '100%', padding: '10px 14px', textAlign: 'left',
        border: 'none', cursor: 'pointer',
        background: active ? 'rgba(232,139,102,0.1)' : hover ? '#F5F2F0' : 'transparent',
        color: active ? '#E88B66' : '#1A1614',
        fontSize: '0.82rem', fontWeight: active ? 600 : 400,
        borderLeft: active ? '2px solid #E88B66' : '2px solid transparent',
      }}
    >{label}</button>
  )
}
