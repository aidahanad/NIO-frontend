import React from 'react'
import { motion } from 'framer-motion'

export default function SegmentedControl({ options, value, onChange }) {
  return (
    <div style={{
      display: 'inline-flex', backgroundColor: '#2C2522', borderRadius: 12,
      padding: 4, position: 'relative', gap: 2,
    }}>
      {options.map(opt => (
        <button key={opt}
          onClick={() => onChange(opt)}
          style={{
            position: 'relative', padding: '7px 18px', borderRadius: 9,
            border: 'none', background: 'none', cursor: 'pointer',
            fontSize: '0.82rem', fontWeight: 600,
            color: value === opt ? '#fff' : '#A89E9A',
            transition: 'color 0.2s', zIndex: 1, letterSpacing: '0.05em',
          }}>
          {value === opt && (
            <motion.div layoutId="seg-pill"
              style={{
                position: 'absolute', inset: 0, borderRadius: 9,
                backgroundColor: '#E88B66',
                boxShadow: '0 2px 8px rgba(232,139,102,0.35)',
                zIndex: -1,
              }}
              transition={{ type: 'spring', stiffness: 400, damping: 35 }} />
          )}
          {opt}
        </button>
      ))}
    </div>
  )
}
