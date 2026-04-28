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
  return res.json()
}

// ─── Local Conversations ───────────────────────────────────────────────────
// Backend does not persist conversations yet.
export async function createConversation() {
  return { conversation_id: `local_${Date.now()}` }
}

export async function listConversations() {
  return []
}

export async function getConversation(id) {
  return { conversation_id: id, messages: [] }
}

export async function deleteConversation(id) {
  return { message: 'Conversation deleted locally', conversation_id: id }
}

// ─── Chat ──────────────────────────────────────────────────────────────────
export async function sendChat(conversationId, question, docIds = [], llm) {
  const body = {
    question,
    llm,
  }

  if (conversationId) body.conversation_id = conversationId
  if (Array.isArray(docIds) && docIds.length > 0) body.doc_ids = docIds

  const res = await fetch(`${BASE_URL}/chat`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  })

  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    throw new Error(
      typeof err.detail === 'string'
        ? err.detail
        : JSON.stringify(err.detail || err, null, 2)
    )
  }

  return res.json()
}

// ─── Study ─────────────────────────────────────────────────────────────────
export async function runStudy(docId, question, llm) {
  const body = {
    topic: question,
    llm,
    doc_ids: docId ? [docId] : [],
  }

  console.log('SENDING STUDY BODY:', body)

  const res = await fetch(`${BASE_URL}/study`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  })

  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    console.error('Study error:', err)

    throw new Error(
      typeof err.detail === 'string'
        ? err.detail
        : JSON.stringify(err.detail || err, null, 2)
    )
  }

  return res.json()
}


// ─── Documents ─────────────────────────────────────────────────────────────
export async function uploadDocument(file) {
  const form = new FormData()
  form.append('file', file)

  const res = await fetch(`${BASE_URL}/upload`, {
    method: 'POST',
    body: form,
  })

  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    throw new Error(
      typeof err.detail === 'string'
        ? err.detail
        : JSON.stringify(err.detail || err, null, 2)
    )
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