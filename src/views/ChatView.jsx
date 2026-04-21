import React, { useState, useRef, useEffect, useSyncExternalStore } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { store } from '../store/store.js'
import { createConversation, sendChat } from '../utils/api.js'
import Sidebar from '../components/Sidebar.jsx'
import ChatInput from '../components/ChatInput.jsx'
import MarkdownRenderer from '../components/MarkdownRenderer.jsx'
import ModelSelector from '../components/ModelSelector.jsx'
import Spinner from '../components/Spinner.jsx'

function resolveModel(model) {
  if (!model) return 'Qwen3-30B-A3B-Thinking'
  return String(model).trim()
}

const SUGGESTIONS = [
  'Can a contract with NAFTAL be awarded without an open tender if only one supplier exists in the market?',
  'Is it legal to split a large project into smaller contracts to stay below the 50 million DA threshold?',
]

export default function ChatView() {
  const state    = useSyncExternalStore(store.subscribe, store.getSnapshot)
  const session  = state.activeChatSession
  const messages = session?.messages ?? []

  const [streaming, setStreaming] = useState(false)
  const [error, setError]         = useState(null)
  const bottomRef = useRef(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  async function sendMessage(text, docIds = []) {
    if (!text.trim() || streaming) return
    setError(null)

    let convId = session?.conversationId ?? null
    if (!convId) {
      try {
        const conv = await createConversation()
        convId = conv.conversation_id
        store.dispatch({ type: 'SET_CHAT_CONVERSATION_ID', payload: convId })
      } catch {
        setError('Impossible de créer la conversation. Vérifiez le backend.')
        return
      }
    }

    store.dispatch({ type: 'ADD_CHAT_MESSAGE', payload: { role: 'user', content: text } })
    store.dispatch({ type: 'ADD_CHAT_MESSAGE', payload: { role: 'assistant', content: '' } })
    setStreaming(true)

    try {
      const llm  = resolveModel(session?.model)
      const data = await sendChat(convId, text, docIds, llm)
      const answer = data?.answer || data?.response || data?.result || data?.output || JSON.stringify(data)
      store.dispatch({ type: 'UPDATE_LAST_CHAT_AI', payload: answer })
    } catch (err) {
      store.dispatch({ type: 'UPDATE_LAST_CHAT_AI', payload: `⚠️ Erreur : ${err.message}` })
      setError(err.message)
    } finally {
      setStreaming(false)
    }
  }

  function handleModelChange(m) {
    store.dispatch({ type: 'SET_CHAT_MODEL', payload: m })
  }

  return (
    <div style={{ display: 'flex', height: '100vh', backgroundColor: '#F5F2F0', overflow: 'hidden' }}>
      <Sidebar />

      <motion.div
        key="chat-view"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.25 }}
        style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}
      >
        {/* Top bar */}
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '14px 24px',
          backgroundColor: '#FFFFFF',
          boxShadow: '0 1px 0 #E8E2DE',
          zIndex: 10,
        }}>
          <div>
            <p style={{ color: '#1A1614', fontWeight: 700, fontSize: '0.95rem', margin: 0 }}>
              {session?.title || 'Nouvelle discussion'}
            </p>
            <p style={{ color: '#8A7D78', fontSize: '0.75rem', margin: 0 }}>
              Posez n'importe quelle question à NIO
            </p>
          </div>
          <ModelSelector value={session?.model} onChange={handleModelChange} />
        </div>

        {/* Error banner */}
        <AnimatePresence>
          {error && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              style={{
                backgroundColor: 'rgba(220,38,38,0.08)',
                borderBottom: '1px solid rgba(220,38,38,0.2)',
                padding: '8px 24px', color: '#dc2626',
                fontSize: '0.8rem', display: 'flex',
                justifyContent: 'space-between', alignItems: 'center',
              }}
            >
              <span>⚠️ {error}</span>
              <button onClick={() => setError(null)} style={{ background: 'none', border: 'none', color: '#dc2626', cursor: 'pointer', fontSize: '1rem' }}>×</button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Messages area */}
        <div style={{
          flex: 1, overflowY: 'auto',
          display: 'flex', flexDirection: 'column',
          backgroundColor: '#F5F2F0',
          padding: messages.length === 0 ? '0' : '24px',
        }}>
          {messages.length === 0 ? (

            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, ease: 'easeOut' }}
              style={{
                flex: 1, display: 'flex', flexDirection: 'column',
                alignItems: 'center', justifyContent: 'center',
                gap: 20, textAlign: 'center', padding: '40px 24px',
              }}
            >
              <div style={{
                position: 'absolute', width: 400, height: 400, borderRadius: '50%',
                background: 'radial-gradient(circle, rgba(232,139,102,0.1) 0%, transparent 70%)',
                pointerEvents: 'none',
              }} />

              <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1, duration: 0.4 }}>
                <h1 style={{ fontSize: '3.2rem', fontWeight: 900, color: '#1A1614', margin: 0, letterSpacing: '0.1em' }}>
                  NIO
                </h1>
                <div style={{ width: 44, height: 3, backgroundColor: '#E88B66', borderRadius: 2, margin: '8px auto 0' }} />
              </motion.div>

              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2, duration: 0.4 }}>
                <p style={{ color: '#1A1614', fontSize: '1rem', fontWeight: 500, margin: '0 0 4px' }}>
                  Votre assistant intelligent.
                </p>
                <p style={{ color: '#8A7D78', fontSize: '0.82rem', margin: 0 }}>
                  Comment puis-je vous aider ?
                </p>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3, duration: 0.4 }}
                style={{ display: 'flex', flexWrap: 'wrap', gap: 12, justifyContent: 'center', maxWidth: 640, margin: '8px auto 0' }}
              >
                {SUGGESTIONS.map((s, i) => (
                  <motion.button
                    key={i}
                    onClick={() => !streaming && sendMessage(s, [])}
                    whileHover={{ scale: 1.03, backgroundColor: '#FFF3EE', borderColor: '#E88B66' }}
                    whileTap={{ scale: 0.97 }}
                    style={{
                      backgroundColor: '#FFFFFF',
                      border: '1.5px solid #E8E2DE',
                      borderRadius: 24, padding: '10px 20px',
                      color: '#1A1614', fontSize: '0.82rem',
                      cursor: streaming ? 'not-allowed' : 'pointer',
                      opacity: streaming ? 0.5 : 1,
                      boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
                      lineHeight: 1.5,
                    }}
                  >
                    {s}
                  </motion.button>
                ))}
              </motion.div>
            </motion.div>

          ) : (

            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <AnimatePresence initial={false}>
                {messages.map((msg, idx) => (
                  <ChatBubbleItem
                    key={idx}
                    msg={msg}
                    streaming={streaming && idx === messages.length - 1}
                  />
                ))}
              </AnimatePresence>
              <div ref={bottomRef} />
            </div>

          )}
        </div>

        {/* Input bar */}
        <div style={{ padding: '0 24px 20px', backgroundColor: '#F5F2F0' }}>
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
      style={{ display: 'flex', justifyContent: isUser ? 'flex-end' : 'flex-start' }}
    >
      <div style={{
        maxWidth: '72%',
        backgroundColor: isUser ? '#E88B66' : '#FFFFFF',
        borderRadius: 16,
        padding: '12px 16px',
        boxShadow: '0 2px 8px rgba(0,0,0,0.07)',
        color: isUser ? '#FFFFFF' : '#1A1614',
      }}>
        {streaming && msg.content === '' ? (
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <Spinner size={16} />
            <span style={{ color: '#8A7D78', fontSize: '0.82rem' }}>NIO rédige…</span>
          </div>
        ) : (
          <MarkdownRenderer content={msg.content} />
        )}
      </div>
    </motion.div>
  )
}
