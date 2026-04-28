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

function modelToLLM(model) {
  const map = {
    '01': 'Qwen3-30B-A3B-Thinking',
    '02': 'gpt-oss-120b',
    '03': 'Qwen3-30B-A3B-Thinking',
  }

  if (!model) return 'Qwen3-30B-A3B-Thinking'
  return map[model] || String(model).trim()
}

export default function ProjectView() {
  const state = useSyncExternalStore(store.subscribe, store.getSnapshot)
  const project = state.projects.find(p => p.id === state.activeProjectId)

  const [streaming, setStreaming] = useState(false)
  const [error, setError] = useState(null)
  const [hasInit, setHasInit] = useState(false)
  const bottomRef = useRef(null)

  useEffect(() => {
    setHasInit(false)
    setError(null)
  }, [state.activeProjectId])

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [project?.messages])

  useEffect(() => {
    if (!project || hasInit) return
    setHasInit(true)

    const llmName = modelToLLM(project.model)

    if (project.mode === 'chat' && project.messages.length === 0) {
      initChat(project)
    }

    if (project.mode === 'analyse' && !project.analysisStarted) {
      initAnalysis(project, llmName)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [project?.id, hasInit])

  async function initChat(proj) {
    store.dispatch({
      type: 'ADD_PROJECT_MESSAGE',
      payload: {
        projectId: proj.id,
        message: {
          role: 'assistant',
          content: 'Bonjour, vous pouvez poser vos questions sur ce projet.',
        },
      },
    })
  }

  async function initAnalysis(proj, llmName) {
    setError(null)

    if (!proj.sitDocId) {
      const msg = 'Aucun document à analyser. Vérifiez que le fichier a bien été uploadé.'
      setError(msg)

      store.dispatch({
        type: 'ADD_PROJECT_MESSAGE',
        payload: {
          projectId: proj.id,
          message: { role: 'assistant', content: `⚠️ ${msg}` },
        },
      })

      return
    }

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
      const data = await runStudy(
        proj.sitDocId,
        'Est-ce que ce marché est conforme à la procédure NAFTAL ?',
        llmName
      )

      const answer =
        data?.answer ??
        data?.response ??
        data?.result ??
        data?.output ??
        JSON.stringify(data, null, 2)

      store.dispatch({
        type: 'UPDATE_LAST_PROJECT_AI',
        payload: {
          projectId: proj.id,
          content: answer,
        },
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

  async function sendMessage(text) {
    if (!project || !text.trim() || streaming || project.mode === 'analyse') return
    setError(null)

    const docIds = [project.lawDocId, project.sitDocId].filter(Boolean)
    const llmName = modelToLLM(project.model)

    let convId = project.conversationId

    if (!convId) {
      const conv = await createConversation()
      convId = conv.conversation_id

      store.dispatch({
        type: 'SET_PROJECT_CONVERSATION_ID',
        payload: { projectId: project.id, conversationId: convId },
      })
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
      const data = await sendChat(convId, text, docIds, llmName)
      const answer =
        data?.answer ??
        data?.response ??
        data?.result ??
        data?.output ??
        JSON.stringify(data, null, 2)

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

  const isAnalyse = project.mode === 'analyse'
  const fileChips = [
    project.lawFile && { label: project.lawFile.name ?? 'Loi / Texte réglementaire' },
    project.sitFile && { label: project.sitFile.name ?? 'Document à analyser' },
  ].filter(Boolean)

  return (
    <div style={{ display: 'flex', height: '100vh', backgroundColor: '#F5F2F0', overflow: 'hidden' }}>
      <Sidebar />

      <motion.div
        key={`project-${project.id}`}
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.25, ease: 'easeOut' }}
        style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}
      >
        <div style={{
          padding: '24px 32px 18px',
          backgroundColor: '#F5F2F0',
          borderBottom: '1px solid #E8E2DE',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
            <h1 style={{ color: '#1A1614', fontWeight: 800, fontSize: '1.5rem', margin: 0 }}>
              {project.name}
            </h1>

            <Badge active>{isAnalyse ? 'Analyse' : 'Chat'}</Badge>
            <Badge>{project.model}</Badge>

            {project.includeNio && <Badge active>NIO</Badge>}
          </div>

          {fileChips.length > 0 && (
            <div style={{ display: 'flex', gap: 8, marginTop: 14, flexWrap: 'wrap' }}>
              {fileChips.map((chip, i) => (
                <FileChip key={i} label={chip.label} />
              ))}
            </div>
          )}
        </div>

        <AnimatePresence>
          {error && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              style={{
                backgroundColor: 'rgba(220,38,38,0.08)',
                borderBottom: '1px solid rgba(220,38,38,0.18)',
                padding: '10px 32px',
                color: '#dc2626',
                fontSize: '0.85rem',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
              }}
            >
              <span>⚠️ {error}</span>
              <button
                onClick={() => setError(null)}
                style={{ background: 'none', border: 'none', color: '#dc2626', cursor: 'pointer', fontSize: '1rem' }}
              >
                ×
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        <div style={{
          flex: 1,
          overflowY: 'auto',
          padding: '28px 32px',
          display: 'flex',
          flexDirection: 'column',
          gap: 16,
          backgroundColor: '#F5F2F0',
        }}>
          {isAnalyse && project.messages.length === 0 && streaming && (
            <div style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              flex: 1,
              gap: 16,
            }}>
              <Spinner size={32} />
              <p style={{ color: '#8A7D78', fontSize: '0.9rem' }}>Analyse en cours…</p>
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

        {!isAnalyse && (
          <div style={{ padding: '0 32px 24px', backgroundColor: '#F5F2F0' }}>
            <ChatInput onSend={sendMessage} disabled={streaming} />
          </div>
        )}

        {isAnalyse && project.analysisStarted && !streaming && (
          <div style={{
            padding: '12px 32px',
            textAlign: 'center',
            color: '#8A7D78',
            fontSize: '0.78rem',
            borderTop: '1px solid #E8E2DE',
            backgroundColor: '#F5F2F0',
          }}>
            Analyse terminée — mode lecture seule
          </div>
        )}
      </motion.div>
    </div>
  )
}

function Badge({ children, active = false }) {
  return (
    <span style={{
      backgroundColor: active ? '#FFF3EE' : '#FFFFFF',
      color: active ? '#E88B66' : '#8A7D78',
      border: active ? '1.5px solid rgba(232,139,102,0.35)' : '1.5px solid #E8E2DE',
      fontSize: '0.74rem',
      fontWeight: 700,
      padding: '5px 11px',
      borderRadius: 999,
    }}>
      {children}
    </span>
  )
}

function FileChip({ label }) {
  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      gap: 7,
      backgroundColor: '#FFFFFF',
      border: '1.5px solid #E8E2DE',
      borderRadius: 999,
      padding: '6px 12px',
    }}>
      <FileText size={13} color="#E88B66" />
      <span style={{ color: '#8A7D78', fontSize: '0.78rem', fontWeight: 500 }}>{label}</span>
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
        backgroundColor: isUser ? '#E88B66' : '#FFFFFF',
        borderRadius: isUser ? '18px 18px 4px 18px' : '18px 18px 18px 4px',
        padding: '14px 16px',
        boxShadow: '0 2px 10px rgba(0,0,0,0.07)',
        color: isUser ? '#FFFFFF' : '#1A1614',
        border: isUser ? 'none' : '1px solid #E8E2DE',
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