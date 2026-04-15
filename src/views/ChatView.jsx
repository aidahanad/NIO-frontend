// src/views/ChatView.jsx
import React, { useState, useRef, useEffect, useSyncExternalStore } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { store } from '../store/store.js'
import { createConversation, sendChat } from '../utils/api.js'
import Sidebar from '../components/Sidebar.jsx'
import ChatInput from '../components/ChatInput.jsx'
import MarkdownRenderer from '../components/MarkdownRenderer.jsx'
import ModelSelector from '../components/ModelSelector.jsx'
import Spinner from '../components/Spinner.jsx'

// Map NIO model IDs → backend LLM strings
function modelToLLM(nioModel) {
  const map = {
    '01': 'Qwen3-30B-A3B-Thinking',
    '02': 'GPT_OSS_120B',
    '03': 'Qwen3-30B-A3B-Thinking',
  }
  return map[nioModel] ?? 'Qwen3-30B-A3B-Thinking'
}

const SUGGESTIONS = [
  'Can a contract with NAFTAL be awarded without an open tender if only one supplier exists in the market?',
  'What happens if a company submits a technically strong offer but accidentally includes pricing details in the technical proposal?',
  'Is it legal to split a large project into smaller contracts to stay below the 50 million DA threshold?',
]

export default function ChatView() {
  const state = useSyncExternalStore(store.subscribe, store.getSnapshot)
  const session = state.activeChatSession
  const messages = session?.messages ?? []

  const [streaming, setStreaming] = useState(false)
  const [error, setError]         = useState(null)
  const bottomRef = useRef(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  async function sendMessage(text) {
    if (!text.trim() || streaming) return
    setError(null)

    // ── 1. Ensure a backend conversation exists ──────────────────────────
    let convId = session?.conversationId ?? null
    if (!convId) {
      try {
        const conv = await createConversation()
        convId = conv.conversation_id
        store.dispatch({ type: 'SET_CHAT_CONVERSATION_ID', payload: convId })
      } catch {
        setError('Impossible de créer la conversation. Vérifiez que le backend est actif.')
        return
      }
    }

    // ── 2. Dispatch user message ─────────────────────────────────────────
    store.dispatch({
      type: 'ADD_CHAT_MESSAGE',
      payload: { role: 'user', content: text },
    })

    // ── 3. Add empty assistant placeholder ──────────────────────────────
    store.dispatch({
      type: 'ADD_CHAT_MESSAGE',
      payload: { role: 'assistant', content: '' },
    })

    setStreaming(true)

    // ── 4. Call backend ─────────────────────────────────────────────────
    try {
      const llm  = modelToLLM(session?.model ?? '01')
      const data = await sendChat(convId, text, [], llm)
      const answer =
        data?.answer ?? data?.response ?? data?.result ?? data?.output ??
        JSON.stringify(data)
      store.dispatch({ type: 'UPDATE_LAST_CHAT_AI', payload: answer })
    } catch (err) {
      store.dispatch({
        type: 'UPDATE_LAST_CHAT_AI',
        payload: `⚠️ Erreur : ${err.message}`,
      })
      setError(err.message)
    } finally {
      setStreaming(false)
    }
  }

  function handleModelChange(m) {
    store.dispatch({ type: 'SET_CHAT_MODEL', payload: m })
  }

  return (
    <div style={{ display: 'flex', height: '100vh', backgroundColor: '#2C2522', overflow: 'hidden' }}>
      <Sidebar />

      <motion.div
        key="chat-view"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.25 }}
        style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}
      >
        {/* ── Top bar ── */}
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '14px 24px', backgroundColor: '#2C2522',
          boxShadow: '0 1px 0 rgba(255,255,255,0.04)',
        }}>
          <div>
            <p style={{ color: '#fff', fontWeight: 700, fontSize: '0.95rem', margin: 0 }}>
              Nouvelle discussion
            </p>
            <p style={{ color: '#A89E9A', fontSize: '0.75rem', margin: 0 }}>
              Posez n'importe quelle question à NIO
            </p>
          </div>
          <ModelSelector value={session?.model ?? '01'} onChange={handleModelChange} />
        </div>

        {/* ── Error banner ── */}
        <AnimatePresence>
          {error && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              style={{
                backgroundColor: 'rgba(220,38,38,0.12)',
                borderBottom: '1px solid rgba(220,38,38,0.25)',
                padding: '8px 24px', color: '#fca5a5',
                fontSize: '0.8rem', display: 'flex',
                justifyContent: 'space-between', alignItems: 'center',
              }}
            >
              <span>⚠️ {error}</span>
              <button onClick={() => setError(null)}
                style={{ background: 'none', border: 'none', color: '#fca5a5', cursor: 'pointer', fontSize: '1rem' }}>
                ×
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ── Messages area ── */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '24px' }}>
          {messages.length === 0 ? (
            /* Empty state */
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.35 }}
              style={{ display: 'flex', flexDirection: 'column', alignItems: 'center',
                       justifyContent: 'center', height: '100%', gap: 24 }}
            >
              <div style={{ fontSize: '2.5rem', fontWeight: 900,
                            background: 'linear-gradient(135deg,#E88B66,#F09A78)',
                            WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                NIO
              </div>
              <p style={{ color: '#A89E9A', fontSize: '0.9rem', margin: 0 }}>
                Comment puis-je vous aider ?
              </p>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10,
                            justifyContent: 'center', maxWidth: 600 }}>
                {SUGGESTIONS.map((s, i) => (
                  <motion.button key={i}
                    onClick={() => !streaming && sendMessage(s)}
                    whileHover={{ scale: 1.03, backgroundColor: '#4e4440' }}
                    whileTap={{ scale: 0.97 }}
                    style={{
                      backgroundColor: '#443A36', border: 'none', borderRadius: 20,
                      padding: '9px 16px', color: '#fff', fontSize: '0.8rem',
                      cursor: streaming ? 'not-allowed' : 'pointer',
                      opacity: streaming ? 0.5 : 1,
                      boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
                    }}>
                    {s}
                  </motion.button>
                ))}
              </div>
            </motion.div>
          ) : (
            /* Message list */
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <AnimatePresence initial={false}>
                {messages.map((msg, idx) => (
                  <ChatBubbleItem key={idx} msg={msg} streaming={streaming && idx === messages.length - 1} />
                ))}
              </AnimatePresence>
              <div ref={bottomRef} />
            </div>
          )}
        </div>

        {/* ── Input bar ── */}
        <div style={{ padding: '0 24px 20px' }}>
          <ChatInput onSend={sendMessage} disabled={streaming} />
        </div>
      </motion.div>
    </div>
  )
}

function ChatBubbleItem({ msg, streaming }) {
  const isUser = msg.role === 'user'
  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.2 }}
      style={{
        display: 'flex',
        justifyContent: isUser ? 'flex-end' : 'flex-start',
      }}
    >
      <div style={{
        maxWidth: '72%',
        backgroundColor: isUser ? '#443A36' : '#362E2B',
        borderRadius: isUser ? '18px 18px 4px 18px' : '18px 18px 18px 4px',
        padding: '12px 16px',
        boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
      }}>
        {streaming && msg.content === '' ? (
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <Spinner size={16} />
            <span style={{ color: '#A89E9A', fontSize: '0.82rem' }}>NIO rédige…</span>
          </div>
        ) : (
          <MarkdownRenderer content={msg.content} />
        )}
      </div>
    </motion.div>
  )
}
