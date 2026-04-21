// src/components/ModelSelector.jsx
import React, { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronDown } from 'lucide-react'
import { fetchModels } from '../utils/api.js'

// ── Safe fallback ─────────────────────────────────────────────
const FALLBACK_MODELS = ['Qwen3-30B-A3B-Thinking']

export default function ModelSelector({ value, onChange }) {
  const [open, setOpen] = useState(false)
  const [models, setModels] = useState(FALLBACK_MODELS)
  const [loading, setLoading] = useState(true)
  const containerRef = useRef(null)

  // ── Load models from backend ─────────────────────────────────
  useEffect(() => {
    let mounted = true

    fetchModels()
      .then(data => {
        if (!mounted) return

        const backendModels = data?.models

        if (Array.isArray(backendModels) && backendModels.length > 0) {
          setModels(backendModels)
        }
      })
      .catch(() => {
        // fallback already set
      })
      .finally(() => {
        if (mounted) setLoading(false)
      })

    return () => {
      mounted = false
    }
  }, [])

  // ── ONLY validate once value exists (no overwrite loop) ─────
  useEffect(() => {
    if (!models.length || !value) return

    const isValid = models.some(
      m => m.toLowerCase() === String(value).toLowerCase()
    )

    if (!isValid) {
      onChange(models[0])
    }
  }, [models]) // IMPORTANT: do NOT depend on value

  // ── close on outside click ───────────────────────────────────
  useEffect(() => {
    if (!open) return

    function handleClick(e) {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [open])

  return (
    <div ref={containerRef} style={{ position: 'relative' }}>

      {/* ── Trigger ───────────────────────────────────────────── */}
      <motion.button
        onClick={() => setOpen(o => !o)}
        whileHover={{ backgroundColor: '#4e4440' }}
        whileTap={{ scale: 0.97 }}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 6,
          backgroundColor: '#443A36',
          border: 'none',
          borderRadius: 10,
          padding: '7px 12px',
          cursor: 'pointer',
          color: '#fff',
          fontSize: '0.82rem',
          fontWeight: 500,
        }}
      >
        <span style={{ color: '#A89E9A', fontSize: '0.72rem' }}>
          Modèle
        </span>

        {loading ? (
          <span
            style={{
              width: 80,
              height: 10,
              display: 'inline-block',
              backgroundColor: 'rgba(255,255,255,0.15)',
              borderRadius: 4,
            }}
          />
        ) : (
          <span style={{ color: '#E88B66', fontWeight: 700 }}>
            {value}
          </span>
        )}

        <motion.div
          animate={{ rotate: open ? 180 : 0 }}
          transition={{ duration: 0.2 }}
        >
          <ChevronDown size={13} color="#E88B66" />
        </motion.div>
      </motion.button>

      {/* ── Dropdown ──────────────────────────────────────────── */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -6, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -6, scale: 0.97 }}
            transition={{ duration: 0.15 }}
            style={{
              position: 'absolute',
              top: 'calc(100% + 6px)',
              right: 0,
              zIndex: 200,
              backgroundColor: '#362E2B',
              borderRadius: 12,
              boxShadow: '0 8px 24px rgba(0,0,0,0.35)',
              minWidth: 220,
              overflow: 'hidden',
              border: '1px solid rgba(255,255,255,0.08)',
            }}
          >
            {models.map(m => (
              <ModelOption
                key={m}
                label={m}
                active={
                  m === value ||
                  m.toLowerCase() === String(value).toLowerCase()
                }
                onClick={() => {
                  onChange(m)   // send raw backend value
                  setOpen(false)
                }}
              />
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

// ── Option row ────────────────────────────────────────────────
function ModelOption({ label, active, onClick }) {
  const [hover, setHover] = useState(false)

  return (
    <button
      onClick={onClick}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={{
        width: '100%',
        padding: '10px 14px',
        textAlign: 'left',
        border: 'none',
        cursor: 'pointer',
        background: active
          ? 'rgba(232,139,102,0.15)'
          : hover
          ? 'rgba(255,255,255,0.05)'
          : 'transparent',
        color: active ? '#E88B66' : '#fff',
        fontSize: '0.82rem',
        fontWeight: active ? 600 : 400,
        borderLeft: active ? '2px solid #E88B66' : '2px solid transparent',
      }}
    >
      {label}
    </button>
  )
}