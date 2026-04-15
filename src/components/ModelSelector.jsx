// src/components/ModelSelector.jsx
import React, { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronDown } from 'lucide-react'
import { fetchModels } from '../utils/api.js'

// ── Fallback displayed while /models loads or if it fails ─────────────────────
const FALLBACK_MODELS = ['01', '02', '03']

export default function ModelSelector({ value, onChange }) {
  const [open, setOpen]     = useState(false)
  const [models, setModels] = useState(FALLBACK_MODELS)
  const [loading, setLoading] = useState(true)
  const containerRef          = useRef(null)

  // ── Fetch real model list from backend once on mount ──────────────────────
  useEffect(() => {
    fetchModels()
      .then(data => {
        // data.models = ["QWEN3-30B-A3B-THINKING", "GPT_OSS_120B", ...]
        // Map each backend name → zero-padded display index: "01", "02", …
        if (Array.isArray(data?.models) && data.models.length > 0) {
          const mapped = data.models.map((_, i) =>
            String(i + 1).padStart(2, '0')
          )
          setModels(mapped)

          // If the currently selected value is no longer valid, reset to first
          if (!mapped.includes(value)) {
            onChange(mapped[0])
          }
        }
      })
      .catch(() => {
        // Keep FALLBACK_MODELS silently — no error shown to user
      })
      .finally(() => setLoading(false))
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  // ── Close dropdown when clicking outside ─────────────────────────────────
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

      {/* ── Trigger button ── */}
      <motion.button
        onClick={() => setOpen(o => !o)}
        whileHover={{ backgroundColor: '#4e4440' }}
        whileTap={{ scale: 0.97 }}
        style={{
          display: 'flex', alignItems: 'center', gap: 6,
          backgroundColor: '#443A36', border: 'none', borderRadius: 10,
          padding: '7px 12px', cursor: 'pointer', color: '#fff',
          fontSize: '0.82rem', fontWeight: 500,
          boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
          transition: 'background-color 0.15s',
        }}
      >
        <span style={{ color: '#A89E9A', fontSize: '0.72rem' }}>
          Modèle
        </span>

        {/* Value or skeleton while loading */}
        {loading ? (
          <span style={{
            display: 'inline-block', width: 20, height: 10,
            backgroundColor: 'rgba(168,158,154,0.25)',
            borderRadius: 4,
            animation: 'pulse-opacity 1.2s ease-in-out infinite',
          }} />
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

      {/* ── Dropdown ── */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -6, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -6, scale: 0.97 }}
            transition={{ duration: 0.15, ease: 'easeOut' }}
            style={{
              position: 'absolute', top: 'calc(100% + 6px)', right: 0,
              zIndex: 200,
              backgroundColor: '#362E2B', borderRadius: 12,
              boxShadow: '0 8px 24px rgba(0,0,0,0.35)',
              overflow: 'hidden', minWidth: 140,
              border: '1px solid rgba(168,158,154,0.1)',
            }}
          >
            {models.map(m => {
              const isActive = m === value
              return (
                <ModelOption
                  key={m}
                  label={`Modèle ${m}`}
                  active={isActive}
                  onClick={() => { onChange(m); setOpen(false) }}
                />
              )
            })}
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  )
}

// ── Dropdown row with its own hover state ──────────────────────────────────────

function ModelOption({ label, active, onClick }) {
  const [hov, setHov] = useState(false)

  return (
    <button
      onClick={onClick}
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      style={{
        display: 'block', width: '100%',
        padding: '10px 16px',
        background: active
          ? 'rgba(232,139,102,0.12)'
          : hov
            ? 'rgba(68,58,54,0.6)'
            : 'none',
        border: 'none', cursor: 'pointer', textAlign: 'left',
        color: active ? '#E88B66' : '#fff',
        fontSize: '0.82rem',
        fontWeight: active ? 600 : 400,
        transition: 'background 0.12s, color 0.12s',
        // Left accent bar on active item
        borderLeft: active ? '2px solid #E88B66' : '2px solid transparent',
      }}
    >
      {label}
    </button>
  )
}
