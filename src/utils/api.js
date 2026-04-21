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
  return res.json()
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
  const res = await fetch(`${BASE_URL}/conversations/${id}`, {
    method: 'DELETE',
  })
  if (!res.ok) throw new Error('Could not delete conversation')
  return res.json()
}

// ─── CHAT (🔥 FIXED: model is ALWAYS explicit now) ─────────────────────────
export async function sendChat(
  conversationId,
  question,
  docIds = [],
  llm
) {
  const body = {
    conversation_id: conversationId,
    question,
    llm, // 🔥 ALWAYS sent explicitly
  }

  // only include docs if needed
  if (Array.isArray(docIds) && docIds.length > 0) {
    body.doc_ids = docIds
  }

  const res = await fetch(`${BASE_URL}/chat`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  })

  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    throw new Error(err.detail || `Chat error ${res.status}`)
  }

  return res.json()
}

// ─── STUDY ─────────────────────────────────────────────────────────────────
export async function runStudy(conversationId, topic) {
  const res = await fetch(`${BASE_URL}/study`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      conversation_id: conversationId,
      topic,
    }),
  })

  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    throw new Error(err.detail || `Study error ${res.status}`)
  }

  return res.json()
}

// ─── DOCUMENTS ─────────────────────────────────────────────────────────────
export async function uploadDocument(file) {
  const form = new FormData()
  form.append('file', file)

  const res = await fetch(`${BASE_URL}/upload`, {
    method: 'POST',
    body: form,
  })

  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    throw new Error(err.detail || `Upload error ${res.status}`)
  }

  return res.json()
}

export async function listDocuments() {
  const res = await fetch(`${BASE_URL}/documents`)
  if (!res.ok) throw new Error('Could not list documents')
  return res.json()
}

export async function deleteDocument(docId) {
  const res = await fetch(`${BASE_URL}/documents/${docId}`, {
    method: 'DELETE',
  })

  if (!res.ok) throw new Error('Could not delete document')
  return res.json()
}