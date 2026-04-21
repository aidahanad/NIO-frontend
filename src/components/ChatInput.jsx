import React, { useRef, useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Send, Paperclip } from 'lucide-react'

export default function ChatInput({ onSend, disabled }) {
  const [val, setVal] = useState('')
  const ref = useRef(null)

  useEffect(() => {
    if (ref.current) {
      ref.current.style.height = 'auto'
      ref.current.style.height = Math.min(ref.current.scrollHeight, 150) + 'px'
    }
  }, [val])

  const send = () => {
    const t = val.trim()
    if (!t || disabled) return
    onSend(t)
    setVal('')
    if (ref.current) ref.current.style.height = 'auto'
  }

  return (
    <div style={{ padding: '12px 0 0' }}>
      <div style={{
        display: 'flex', alignItems: 'flex-end', gap: 10,
        backgroundColor: '#FFFFFF',
        borderRadius: 16, padding: '10px 12px',
        boxShadow: '0 2px 12px rgba(0,0,0,0.07)',
        border: '1.5px solid #E8E2DE',
      }}>
        <button style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '2px', display: 'flex', flexShrink: 0 }}>
          <Paperclip size={16} color="#8A7D78" />
        </button>
        <textarea
          ref={ref} rows={1} value={val}
          onChange={e => setVal(e.target.value)}
          onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send() } }}
          placeholder="Posez votre question..."
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
