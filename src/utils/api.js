// src/utils/api.js
const BASE_URL = 'http://localhost:8000'

// ─── Health ────────────────────────────────────────────────────────────────
export async function checkHealth() {
  const res = await fetch(`${BASE_URL}/health`)
  if (!res.ok) throw new Error('Backend unreachable')
  return res.json()
}

// ─── Models ────────────────────────────────────────────────────────────────
export async function fetchModels() {
  const res = await fetch(`${BASE_URL}/models`)
  if (!res.ok) throw new Error('Could not fetch models')
  return res.json() // { models: [...] }
}

// ─── Conversations ─────────────────────────────────────────────────────────
export async function createConversation() {
  const res = await fetch(`${BASE_URL}/conversations`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({}),
  })
  if (!res.ok) throw new Error('Could not create conversation')
  return res.json() // { conversation_id, title }
}

export async function listConversations() {
  const res = await fetch(`${BASE_URL}/conversations`)
  if (!res.ok) throw new Error('Could not list conversations')
  return res.json()
}

export async function getConversation(id) {
  const res = await fetch(`${BASE_URL}/conversations/${id}`)
  if (!res.ok) throw new Error('Conversation not found')
  return res.json()
}

export async function deleteConversation(id) {
  const res = await fetch(`${BASE_URL}/conversations/${id}`, { method: 'DELETE' })
  if (!res.ok) throw new Error('Could not delete conversation')
  return res.json()
}

// ─── Chat ──────────────────────────────────────────────────────────────────
export async function sendChat(
  conversationId,
  question,
  docIds = [],
  llm = 'Qwen3-30B-A3B-Thinking'
) {
  const body = { conversation_id: conversationId, question, llm }
  if (docIds && docIds.length > 0) body.doc_ids = docIds

  const res = await fetch(`${BASE_URL}/chat`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  })
  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    throw new Error(err.detail || `Chat error ${res.status}`)
  }
  return res.json() // { answer, sources? }
}

// ─── Study ─────────────────────────────────────────────────────────────────
export async function runStudy(
  conversationId,
  topic
) {
  const body = {
    conversation_id: conversationId,
    topic,
  };

  const res = await fetch(`${BASE_URL}/study`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.detail || `Study error ${res.status}`);
  }

  return res.json(); // { conversation_id, answer, json_path, mode }
}
// ─── Documents ─────────────────────────────────────────────────────────────
export async function uploadDocument(file) {
  const form = new FormData()
  form.append('file', file)
  const res = await fetch(`${BASE_URL}/upload`, { method: 'POST', body: form })
  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    throw new Error(err.detail || `Upload error ${res.status}`)
  }
  return res.json() // { doc_id, chunks, message }
}

export async function listDocuments() {
  const res = await fetch(`${BASE_URL}/documents`)
  if (!res.ok) throw new Error('Could not list documents')
  return res.json()
}

export async function deleteDocument(docId) {
  const res = await fetch(`${BASE_URL}/documents/${docId}`, { method: 'DELETE' })
  if (!res.ok) throw new Error('Could not delete document')
  return res.json()
}
