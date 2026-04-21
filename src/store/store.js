let state = {
  projects: [],
  activeProjectId: null,
  activeChatSession: null,
  activeView: 'welcome', // 'welcome' | 'chat' | 'new-project' | 'project'
}

let listeners = new Set()
const emit = () => listeners.forEach(l => l())

export const store = {
  getSnapshot: () => state,
  subscribe(listener) {
    listeners.add(listener)
    return () => listeners.delete(listener)
  },
  dispatch(action) {
    state = reducer(state, action)
    emit()
  },
}

function reducer(state, action) {
  switch (action.type) {

    // ── Navigation ──────────────────────────────────────────────────────────
    case 'SET_VIEW':
      return {
        ...state,
        activeView: action.payload,
        activeProjectId: null,
        activeChatSession: null,
      }

    // ── Chat Session ────────────────────────────────────────────────────────
    case 'START_NEW_CHAT':
      return {
        ...state,
        activeView: 'chat',
        activeProjectId: null,
        activeChatSession: {
          id: `chat_${Date.now()}`,
          title: 'Nouvelle discussion',
          model: '01',
          conversationId: null,
          messages: [],
        },
      }

    case 'SET_CHAT_MODEL':
      if (!state.activeChatSession) return state
      return {
        ...state,
        activeChatSession: { ...state.activeChatSession, model: action.payload },
      }

    case 'RENAME_CHAT':
      if (!state.activeChatSession) return state
      return {
        ...state,
        activeChatSession: {
          ...state.activeChatSession,
          title: action.payload,
        },
      }

    case 'SET_CHAT_CONVERSATION_ID':
      if (!state.activeChatSession) return state
      return {
        ...state,
        activeChatSession: {
          ...state.activeChatSession,
          conversationId: action.payload,
        },
      }

    case 'ADD_CHAT_MESSAGE':
      if (!state.activeChatSession) return state
      return {
        ...state,
        activeChatSession: {
          ...state.activeChatSession,
          messages: [...state.activeChatSession.messages, action.payload],
        },
      }

    case 'UPDATE_LAST_CHAT_AI': {
      if (!state.activeChatSession) return state
      const msgs = [...state.activeChatSession.messages]
      const i = msgs.length - 1
      if (i >= 0 && msgs[i].role === 'assistant') {
        msgs[i] = { ...msgs[i], content: action.payload }
      }
      return {
        ...state,
        activeChatSession: { ...state.activeChatSession, messages: msgs },
      }
    }

    // ── Projects ────────────────────────────────────────────────────────────
    case 'CREATE_PROJECT': {
      const project = {
        id: `proj_${Date.now()}`,
        name: action.payload.name,
        model: action.payload.model,
        mode: action.payload.mode,
        lawFile: action.payload.lawFile || null,
        sitFile: action.payload.sitFile || null,
        lawDocId: action.payload.lawDocId || null,
        sitDocId: action.payload.sitDocId || null,
        includeNio: action.payload.includeNio,
        conversationId: null,
        messages: [],
        createdAt: new Date().toISOString(),
        analysisStarted: false,
      }
      return {
        ...state,
        projects: [project, ...state.projects],
        activeProjectId: project.id,
        activeView: 'project',
        activeChatSession: null,
      }
    }

    case 'SET_ACTIVE_PROJECT':
      return {
        ...state,
        activeProjectId: action.payload,
        activeView: 'project',
        activeChatSession: null,
      }

    case 'RENAME_PROJECT': {
      const projects = state.projects.map(p =>
        p.id === action.payload.id
          ? { ...p, name: action.payload.name }
          : p
      )
      return { ...state, projects }
    }

    case 'SET_PROJECT_CONVERSATION_ID': {
      const projects = state.projects.map(p =>
        p.id === action.payload.projectId
          ? { ...p, conversationId: action.payload.conversationId }
          : p
      )
      return { ...state, projects }
    }

    case 'ADD_PROJECT_MESSAGE': {
      const projects = state.projects.map(p =>
        p.id === action.payload.projectId
          ? { ...p, messages: [...p.messages, action.payload.message] }
          : p
      )
      return { ...state, projects }
    }

    case 'UPDATE_LAST_PROJECT_AI': {
      const projects = state.projects.map(p => {
        if (p.id !== action.payload.projectId) return p
        const msgs = [...p.messages]
        const i = msgs.length - 1
        if (i >= 0 && msgs[i].role === 'assistant') {
          msgs[i] = { ...msgs[i], content: action.payload.content }
        }
        return { ...p, messages: msgs }
      })
      return { ...state, projects }
    }

    case 'SET_ANALYSIS_STARTED': {
      const projects = state.projects.map(p =>
        p.id === action.payload ? { ...p, analysisStarted: true } : p
      )
      return { ...state, projects }
    }

    case 'DELETE_PROJECT': {
      const projects = state.projects.filter(p => p.id !== action.payload)
      const wasActive = state.activeProjectId === action.payload
      return {
        ...state,
        projects,
        activeProjectId: wasActive ? null : state.activeProjectId,
        activeView: wasActive ? 'welcome' : state.activeView,
      }
    }

    default:
      return state
  }
}
