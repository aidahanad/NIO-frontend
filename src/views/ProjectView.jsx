// src/views/ProjectView.jsx
import React, { useState, useRef, useEffect, useSyncExternalStore } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { FileText } from 'lucide-react'
import { store } from '../store/store.js'
import { createConversation, sendChat, runStudy } from '../utils/api.js'
import Sidebar from '../components/Sidebar.jsx'
import ChatInput from '../components/ChatInput.jsx'
import MarkdownRenderer from '../components/MarkdownRenderer.jsx'
import Spinner from '../components/Spinner.jsx'

function modelToLLM(nioModel) {
  const map = {
    '01': 'Qwen3-30B-A3B-Thinking',
    '02': 'GPT_OSS_120B',
    '03': 'Qwen3-30B-A3B-Thinking',
  }
  return map[nioModel] ?? 'Qwen3-30B-A3B-Thinking'
}

export default function ProjectView() {
  const state   = useSyncExternalStore(store.subscribe, store.getSnapshot)
  const project = state.projects.find(p => p.id === state.activeProjectId)

  const [streaming, setStreaming] = useState(false)
  const [error, setError]         = useState(null)
  const [hasInit, setHasInit]     = useState(false)
  const bottomRef = useRef(null)

  // Reset init flag when project changes
  useEffect(() => {
    setHasInit(false)
    setError(null)
  }, [state.activeProjectId])

  // Auto-scroll
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [project?.messages])

  // ── Initialisation (greeting or analysis) ────────────────────────────────
  useEffect(() => {
    if (!project || hasInit) return
    setHasInit(true)

    const docIds  = [project.lawDocId, project.sitDocId].filter(Boolean)
    const llmName = modelToLLM(project.model)

    if (project.mode === 'chat' && project.messages.length === 0) {
      initChat(project, docIds, llmName)
    }
    if (project.mode === 'analyse' && !project.analysisStarted) {
      initAnalysis(project, docIds, llmName)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [project?.id, hasInit])

  async function initChat(proj, docIds, llmName) {
    setError(null)

    // Add empty assistant placeholder
    store.dispatch({
      type: 'ADD_PROJECT_MESSAGE',
      payload: {
        projectId: proj.id,
        message: { role: 'assistant', content: '' },
      },
    })
    setStreaming(true)

    try {
      // Create conversation if not yet done
      let convId = proj.conversationId
      if (!convId) {
        const conv = await createConversation()
        convId = conv.conversation_id
        store.dispatch({
          type: 'SET_PROJECT_CONVERSATION_ID',
          payload: { projectId: proj.id, conversationId: convId },
        })
      }

      const prompt =
        `Présente-toi comme NIO, l'assistant IA de Naftal, et explique brièvement ` +
        `ce que tu peux faire pour le projet "${proj.name}". ` +
        (docIds.length ? `Tu as accès aux documents fournis (${docIds.length} fichier(s)).` : '')

      const data   = await sendChat(convId, prompt, docIds, llmName)
      const answer = data?.answer ?? data?.response ?? data?.result ?? data?.output ?? JSON.stringify(data)

      store.dispatch({
        type: 'UPDATE_LAST_PROJECT_AI',
        payload: { projectId: proj.id, content: answer },
      })
    } catch (err) {
      store.dispatch({
        type: 'UPDATE_LAST_PROJECT_AI',
        payload: {
          projectId: proj.id,
          content:
            `Bonjour ! Je suis **NIO**, votre assistant IA Naftal. ` +
            `Je suis prêt à vous aider sur le projet **${proj.name}**. ` +
            `Comment puis-je vous assister ?`,
        },
      })
    } finally {
      setStreaming(false)
    }
  }

  async function initAnalysis(proj, docIds, llmName) {
    setError(null)
    store.dispatch({ type: 'SET_ANALYSIS_STARTED', payload: proj.id })

    store.dispatch({
      type: 'ADD_PROJECT_MESSAGE',
      payload: {
        projectId: proj.id,
        message: { role: 'assistant', content: '' },
      },
    })
    setStreaming(true)

    try {
      let convId = proj.conversationId
      if (!convId) {
        const conv = await createConversation()
        convId = conv.conversation_id
        store.dispatch({
          type: 'SET_PROJECT_CONVERSATION_ID',
          payload: { projectId: proj.id, conversationId: convId },
        })
      }

      const data   = await runStudy(convId, proj.name, docIds, llmName)
      const answer = data?.answer ?? data?.response ?? data?.result ?? data?.output ?? JSON.stringify(data)

      store.dispatch({
        type: 'UPDATE_LAST_PROJECT_AI',
        payload: { projectId: proj.id, content: answer },
      })
    } catch (err) {
      store.dispatch({
        type: 'UPDATE_LAST_PROJECT_AI',
        payload: {
          projectId: proj.id,
          content: `⚠️ Erreur lors de l'analyse : ${err.message}`,
        },
      })
      setError(err.message)
    } finally {
      setStreaming(false)
    }
  }

  // ── Send user message ────────────────────────────────────────────────────
  async function sendMessage(text) {
    if (!project || !text.trim() || streaming || project.mode === 'analyse') return
    setError(null)

    const docIds  = [project.lawDocId, project.sitDocId].filter(Boolean)
    const llmName = modelToLLM(project.model)

    // Ensure conversation exists
    let convId = project.conversationId
    if (!convId) {
      try {
        const conv = await createConversation()
        convId = conv.conversation_id
        store.dispatch({
          type: 'SET_PROJECT_CONVERSATION_ID',
          payload: { projectId: project.id, conversationId: convId },
        })
      } catch {
        setError('Impossible de créer la conversation.')
        return
      }
    }

    store.dispatch({
      type: 'ADD_PROJECT_MESSAGE',
      payload: { projectId: project.id, message: { role: 'user', content: text } },
    })
    store.dispatch({
      type: 'ADD_PROJECT_MESSAGE',
      payload: { projectId: project.id, message: { role: 'assistant', content: '' } },
    })
    setStreaming(true)

    try {
      const data   = await sendChat(convId, text, docIds, llmName)
      const answer = data?.answer ?? data?.response ?? data?.result ?? data?.output ?? JSON.stringify(data)
      store.dispatch({
        type: 'UPDATE_LAST_PROJECT_AI',
        payload: { projectId: project.id, content: answer },
      })
    } catch (err) {
      store.dispatch({
        type: 'UPDATE_LAST_PROJECT_AI',
        payload: { projectId: project.id, content: `⚠️ Erreur : ${err.message}` },
      })
      setError(err.message)
    } finally {
      setStreaming(false)
    }
  }

  if (!project) return null

  const isAnalyse  = project.mode === 'analyse'
  const docIds     = [project.lawDocId, project.sitDocId].filter(Boolean)
  const fileChips  = [
    project.lawFile && { label: project.lawFile.name ?? 'Loi / Texte réglementaire' },
    project.sitFile && { label: project.sitFile.name ?? 'Situation' },
  ].filter(Boolean)

  return (
    <div style={{ display: 'flex', height: '100vh', backgroundColor: '#2C2522', overflow: 'hidden' }}>
      <Sidebar />

      <motion.div
        key={`project-${project.id}`}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.25 }}
        style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}
      >
        {/* ── Header ── */}
        <div style={{
          padding: '14px 24px', backgroundColor: '#2C2522',
          boxShadow: '0 1px 0 rgba(255,255,255,0.04)',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
            <p style={{ color: '#fff', fontWeight: 700, fontSize: '0.95rem', margin: 0 }}>
              {project.name}
            </p>

            {/* Mode badge */}
            <span style={{
              backgroundColor: isAnalyse ? 'rgba(232,139,102,0.15)' : 'rgba(68,58,54,0.8)',
              color: isAnalyse ? '#E88B66' : '#A89E9A',
              fontSize: '0.7rem', fontWeight: 600, padding: '3px 9px', borderRadius: 20,
            }}>
              {isAnalyse ? 'Analyse' : 'Chat'}
            </span>

            {/* Model badge */}
            <span style={{
              backgroundColor: '#443A36', color: '#E88B66',
              fontSize: '0.7rem', fontWeight: 600, padding: '3px 9px', borderRadius: 20,
            }}>
              Modèle {project.model}
            </span>

            {/* NIO badge */}
            {project.includeNio && (
              <span style={{
                backgroundColor: 'rgba(232,139,102,0.1)', color: '#E88B66',
                fontSize: '0.7rem', fontWeight: 700, padding: '3px 9px', borderRadius: 20,
              }}>
                NIO
              </span>
            )}
          </div>

          {/* File chips */}
          {fileChips.length > 0 && (
            <div style={{ display: 'flex', gap: 8, marginTop: 10, flexWrap: 'wrap' }}>
              {fileChips.map((chip, i) => (
                <FileChip key={i} label={chip.label} />
              ))}
            </div>
          )}
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

        {/* ── Messages ── */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '24px', display: 'flex', flexDirection: 'column', gap: 16 }}>
          {isAnalyse && project.messages.length === 0 && (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center',
                          justifyContent: 'center', flex: 1, gap: 16 }}>
              <Spinner size={32} />
              <p style={{ color: '#A89E9A', fontSize: '0.9rem' }}>Analyse en cours…</p>
            </div>
          )}

          <AnimatePresence initial={false}>
            {project.messages.map((msg, idx) => (
              <ProjBubble
                key={idx}
                msg={msg}
                streaming={streaming && idx === project.messages.length - 1}
              />
            ))}
          </AnimatePresence>
          <div ref={bottomRef} />
        </div>

        {/* ── Input (chat mode only) ── */}
        {!isAnalyse && (
          <div style={{ padding: '0 24px 20px' }}>
            <ChatInput onSend={sendMessage} disabled={streaming} />
          </div>
        )}

        {/* ── Read-only footer for analyse mode ── */}
        {isAnalyse && project.analysisStarted && !streaming && (
          <div style={{
            padding: '12px 24px', textAlign: 'center',
            color: '#A89E9A', fontSize: '0.78rem',
            borderTop: '1px solid rgba(255,255,255,0.04)',
          }}>
            Analyse terminée — mode lecture seule
          </div>
        )}
      </motion.div>
    </div>
  )
}

function FileChip({ label }) {
  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: 6,
      backgroundColor: '#443A36', borderRadius: 20,
      padding: '4px 12px',
    }}>
      <FileText size={12} color="#E88B66" />
      <span style={{ color: '#A89E9A', fontSize: '0.75rem' }}>{label}</span>
    </div>
  )
}

function ProjBubble({ msg, streaming }) {
  const isUser = msg.role === 'user'
  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.2 }}
      style={{ display: 'flex', justifyContent: isUser ? 'flex-end' : 'flex-start' }}
    >
      <div style={{
        maxWidth: '76%',
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
